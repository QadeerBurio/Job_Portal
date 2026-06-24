// backend/utils/resumeParser.js
// ─────────────────────────────────────────────────────────────────────────────
// Extracts text from an uploaded PDF/DOCX with AGGRESSIVE parsing.
//
// FIXES applied vs previous version:
//
//   1. pdf-parse v2 IMPORT — v2 exports a CLASS via named export, NOT a
//      plain function. `const pdfParse = require("pdf-parse")` gives an
//      object, not a callable, so `pdfParse(buffer)` threw "pdfParse is not
//      a function". The correct v2 API is:
//        const { PDFParse } = require("pdf-parse");
//        const parser = new PDFParse({ data: buffer });
//        const result = await parser.getText();
//        await parser.destroy();
//      This is a complete break from v1 (which WAS a plain function).
//
//   2. education.institution REQUIRED — educationSchema marks institution
//      required:true. The parser set institution:"" and only filled it from
//      the NEXT line after the degree header. If that line was missing or
//      misidentified, Mongoose threw "Path `institution` is required."
//      Fixed: fall back to the degree line itself so institution is never
//      empty when we push an education entry.
//
//   3. experience.description MINLENGTH — experienceSchema has
//      description: { minlength: 50 }. Short or missing bullets collapsed to
//      fewer than 50 chars and failed validation.
//      Fixed: pad description to at least 50 chars before saving, and ensure
//      "Imported from uploaded resume." is the guaranteed fallback (it's 32
//      chars so we pad it).
//
//   4. experience.startDate REQUIRED — startDate: { required: true } on
//      experienceSchema. The fallback `new Date(new Date().getFullYear(), 0, 1)`
//      was fine, but only used when dateRangeStr existed. If no date was found
//      AT ALL the field could come out undefined.
//      Fixed: always assign a concrete Date even when parsing returns null.
// ─────────────────────────────────────────────────────────────────────────────
const fs = require("fs");
// ✅ FIX 1: pdf-parse v2 exports a CLASS via named export — NOT a plain function.
// v1: const pdf = require("pdf-parse"); await pdf(buffer)  ← plain fn
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

// ── Text extraction ──────────────────────────────────────────────────────────

async function extractRawText(filePath, fileType) {
  if (fileType === "pdf") {
    const buffer = fs.readFileSync(filePath);
    // v2 API: PDFParse is a class; pass data as { data: buffer }
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  throw new Error(`Unsupported file type for parsing: ${fileType}`);
}

// ── Section splitting ────────────────────────────────────────────────────────

const SECTION_HEADERS = {
  experience:
    /\b(work experience|professional experience|experience|employment history|career history|professional background|work history|relevant experience|employment)\b/i,
  education:
    /\b(education|academic background|qualifications|degrees|university|college|schooling)\b/i,
  skills:
    /\b(skills|technical skills|core competencies|key skills|technical expertise|skillset|languages|technologies)\b/i,
  projects:
    /\b(projects|key projects|personal projects|portfolio|portfolio projects)\b/i,
  certifications:
    /\b(certifications?|licenses?|credentials?|certifications and licenses)\b/i,
};

function splitIntoSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = {};
  let currentKey = "header";
  sections[currentKey] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    let matchedKey = null;

    if (trimmed.length > 0 && trimmed.length < 100) {
      for (const [key, pattern] of Object.entries(SECTION_HEADERS)) {
        if (pattern.test(trimmed)) {
          matchedKey = key;
          break;
        }
      }
    }

    if (matchedKey) {
      currentKey = matchedKey;
      sections[currentKey] = sections[currentKey] || [];
    } else {
      sections[currentKey] = sections[currentKey] || [];
      sections[currentKey].push(line);
    }
  }

  console.log(
    "📋 Sections found:",
    Object.keys(sections).filter((k) => k !== "header"),
  );
  console.log("   - Experience lines:", sections.experience?.length ?? 0);
  console.log("   - Education lines:", sections.education?.length ?? 0);
  console.log("   - Skills lines:", sections.skills?.length ?? 0);

  return sections;
}

// ── URL extraction ───────────────────────────────────────────────────────────

function extractURLs(fullText) {
  const result = { linkedinUrl: "", portfolioUrl: "", githubUrl: "" };

  // ── LinkedIn ──────────────────────────────────────────────────────────────
  // PRIMARY: match a full linkedin.com/in/username URL in the text
  const linkedinUrlMatch = fullText.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9][a-zA-Z0-9\-]{0,48}[a-zA-Z0-9]?)\/?/i,
  );
  if (linkedinUrlMatch) {
    result.linkedinUrl = `https://linkedin.com/in/${linkedinUrlMatch[1]}`;
    console.log("🔗 Found LinkedIn URL:", result.linkedinUrl);
  } else {
    // FALLBACK: PDF hyperlink text — the word "LinkedIn" appears as anchor text
    // but the URL lives in a PDF annotation object (not in the text stream).
    // We detect the presence signal and store a placeholder that the user can
    // update on the Personal Info screen. Better than silently losing it.
    const hasLinkedInWord = /\blinkedin\b/i.test(fullText);
    if (hasLinkedInWord) {
      result.linkedinUrl = "https://linkedin.com/in/"; // partial — user fills in username
      console.log(
        "🔗 Found LinkedIn word (no URL in text stream — PDF annotation)",
      );
    }
  }

  // ── GitHub ────────────────────────────────────────────────────────────────
  // PRIMARY: match a full github.com/username URL
  const githubUrlMatch = fullText.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/(?!features|pricing|about|login|join|explore|marketplace|topics|trending|collections|events|sponsors|orgs|apps|contact|security|docs|enterprise|nonprofit)([a-zA-Z0-9][a-zA-Z0-9\-]{0,37}[a-zA-Z0-9]?)(?:\/[^\s]*)?/i,
  );
  if (githubUrlMatch) {
    result.githubUrl = `https://github.com/${githubUrlMatch[1]}`;
    result.portfolioUrl = result.githubUrl;
    console.log("🔗 Found GitHub URL:", result.githubUrl);
  } else {
    // FALLBACK: word "GitHub" as hyperlink anchor text (same PDF annotation issue)
    const hasGitHubWord = /\bgithub\b/i.test(fullText);
    if (hasGitHubWord) {
      result.githubUrl = "https://github.com/"; // partial — user fills in username
      result.portfolioUrl = result.portfolioUrl || result.githubUrl;
      console.log(
        "🔗 Found GitHub word (no URL in text stream — PDF annotation)",
      );
    }
  }

  // ── Portfolio / personal site ─────────────────────────────────────────────
  const portfolioMatch = fullText.match(
    /https?:\/\/(?!(?:www\.)?(?:linkedin|github)\.com)[a-zA-Z0-9][a-zA-Z0-9\-._~:/?#@!$&'()*+,;=%]*/i,
  );
  if (portfolioMatch && !result.portfolioUrl) {
    result.portfolioUrl = portfolioMatch[0].replace(/[.,;)]+$/, "");
    console.log("🔗 Found Portfolio:", result.portfolioUrl);
  }

  return result;
}

// ── Personal info ────────────────────────────────────────────────────────────

function extractPersonalInfo(headerLines, fullText) {
  const emailMatch = fullText.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );
  const phoneMatch = fullText.match(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/,
  );
  const firstMeaningfulLine = headerLines.find(
    (l) =>
      l.trim().length > 2 &&
      l.trim().length < 60 &&
      !/@|http|github|linkedin|\d{3,}/.test(l),
  );
  const urls = extractURLs(fullText);

  console.log("👤 Personal Info:");
  console.log("   - Name:", firstMeaningfulLine?.trim() || "(not found)");
  console.log("   - Email:", emailMatch?.[0] || "(not found)");

  return {
    fullName: firstMeaningfulLine?.trim() || "",
    email: emailMatch?.[0] || "",
    phone: phoneMatch?.[0]?.trim() || "",
    linkedinUrl: urls.linkedinUrl,
    portfolioUrl: urls.portfolioUrl || urls.githubUrl,
    city: "",
    summary: "",
  };
}

// ── Date parsing ─────────────────────────────────────────────────────────────

function parseDate(dateStr) {
  if (!dateStr) return null;
  const str = dateStr.trim().toLowerCase();

  const slashMatch = str.match(/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    return new Date(
      parseInt(slashMatch[2], 10),
      parseInt(slashMatch[1], 10) - 1,
      1,
    );
  }

  const dashMatch = str.match(/(\d{4})-(\d{1,2})/);
  if (dashMatch) {
    return new Date(
      parseInt(dashMatch[1], 10),
      parseInt(dashMatch[2], 10) - 1,
      1,
    );
  }

  const monthYearMatch = str.match(/([A-Za-z]{3,9})\s+(\d{4})/);
  if (monthYearMatch) {
    const months = {
      jan: 0,
      january: 0,
      feb: 1,
      february: 1,
      mar: 2,
      march: 2,
      apr: 3,
      april: 3,
      may: 4,
      jun: 5,
      june: 5,
      jul: 6,
      july: 6,
      aug: 7,
      august: 7,
      sep: 8,
      september: 8,
      oct: 9,
      october: 9,
      nov: 10,
      november: 10,
      dec: 11,
      december: 11,
    };
    const month = months[monthYearMatch[1].slice(0, 3).toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(monthYearMatch[2], 10), month, 1);
    }
  }

  return null;
}

// ✅ FIX 4: guaranteed fallback so startDate is never undefined
function parseDateOrFallback(dateStr) {
  return parseDate(dateStr) ?? new Date(new Date().getFullYear(), 0, 1);
}

// ── Experience ───────────────────────────────────────────────────────────────

const DATE_PATTERNS = [
  /([A-Za-z]{3,9}\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}-\d{2})\s*[-–to]+\s*(present|current|[A-Za-z]{3,9}\.?\s+\d{4}|\d{1,2}\/\d{4}|\d{4}-\d{2})/i,
  /\d{1,2}\/\d{4}\s*[-–to]+\s*(present|current)/i,
  // ✅ Duration patterns like "(2 Months)", "(6 months)", "3 months" — common in
  // internship entries that don't use a year-based date range
  /\(?\d{1,2}\s+months?\)?/i,
  /\(?\d{1,2}\s+years?\)?/i,
];

// ✅ FIX 3: ensure description always meets the 50-char minlength on the schema
const MIN_DESCRIPTION_LEN = 50;
const DESCRIPTION_FALLBACK =
  "Role imported from uploaded resume. Please update with details.";

function buildDescription(bullets) {
  if (bullets.length === 0) return DESCRIPTION_FALLBACK;
  const joined = bullets.join(". ").slice(0, 2000);
  // Pad to minimum length if bullets were very short
  return joined.length >= MIN_DESCRIPTION_LEN
    ? joined
    : joined +
        " " +
        DESCRIPTION_FALLBACK.slice(0, MIN_DESCRIPTION_LEN - joined.length);
}

function extractExperience(lines) {
  const entries = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.length < 3) continue;

    const hasDateRange = DATE_PATTERNS.some((p) => p.test(line));
    const hasSeparators = /\s+@\s+|\sat\s|\s[-–]\s|\s\|\s|[-–]/i.test(line);
    const hasCompanyKeyword =
      /\b(inc|corp|ltd|llc|company|technologies|solutions|group|consulting|co\.|pvt|limited|ventures|studio|labs|media|services|works|tech|systems|internee|pk)\b/i.test(
        line,
      ) || /\.pk\b|\.io\b|\.co\b|\.net\b/i.test(line);
    const hasJobKeyword =
      /\b(developer|engineer|manager|analyst|designer|architect|specialist|coordinator|officer|assistant|consultant|lead|senior|junior|executive|director|head|associate|intern|trainee|apprentice|researcher|programmer|coder)\b/i.test(
        line,
      );

    const looksLikeTitleLine =
      line.length > 3 &&
      line.length < 200 &&
      (hasDateRange ||
        hasSeparators ||
        (hasCompanyKeyword && hasJobKeyword) ||
        (hasDateRange && line.length > 10));

    if (looksLikeTitleLine) {
      if (current) {
        entries.push(current);
        console.log(
          `   ✓ Experience: "${current.jobTitle}" at "${current.companyName}"`,
        );
      }

      let jobTitle = line;
      let companyName = "";
      let dateRangeStr = "";

      const dateMatch =
        line.match(DATE_PATTERNS[0]) || line.match(DATE_PATTERNS[1]);
      if (dateMatch) dateRangeStr = dateMatch[0];

      const pipeSplit = line.split(/\s*\|\s*/);
      if (pipeSplit.length >= 2) {
        jobTitle = pipeSplit[0];
        companyName = pipeSplit[1];
      } else {
        const atSplit = line.split(/\s+@\s+|\s+[Aa]t\s+/);
        if (atSplit.length >= 2) {
          jobTitle = atSplit[0];
          // Everything after "at" is the company + possible duration
          // e.g. "Internee.pk (2 Months)" → strip the duration suffix
          companyName = atSplit
            .slice(1)
            .join(" at ")
            .replace(/\s*\(\d+\s+(?:months?|years?)\)/i, "")
            .trim();
        } else {
          const dashSplit = line.split(/\s[-–]\s/);
          if (dashSplit.length >= 2) {
            [jobTitle, companyName] = dashSplit;
          }
        }
      }

      DATE_PATTERNS.forEach((pattern) => {
        jobTitle = jobTitle.replace(pattern, "").trim();
        companyName = companyName.replace(pattern, "").trim();
      });

      const isCurrent = /present|current|ongoing/i.test(line);
      const [startStr, endStr] = dateRangeStr
        ? dateRangeStr.split(/[-–to]+/i)
        : [null, null];

      current = {
        jobTitle: jobTitle || "Untitled Role",
        companyName: companyName || "Unknown Company",
        location: "",
        // ✅ FIX 4: parseDateOrFallback guarantees a Date, never undefined
        startDate: parseDateOrFallback(startStr),
        endDate: isCurrent ? null : (parseDate(endStr) ?? null),
        isCurrent,
        description: "",
        bullets: [],
      };
    } else if (current && line.length > 5) {
      current.bullets.push(line.replace(/^[•\-*]\s*/, ""));
    }
  }

  if (current) {
    entries.push(current);
    console.log(
      `   ✓ Experience: "${current.jobTitle}" at "${current.companyName}"`,
    );
  }

  console.log(`📊 Extracted ${entries.length} experience entries`);

  // ✅ FIX 3: build description after collecting all bullets, with length guard
  return entries.map(({ bullets, ...e }) => ({
    ...e,
    description: buildDescription(bullets),
    bullets,
  }));
}

// ── Education ────────────────────────────────────────────────────────────────

const DEGREE_KEYWORDS =
  /\b(bachelor|master|bs|ba|ms|ma|phd|bsc|msc|diploma|degree|associate|b\.s\.?|b\.a\.?|m\.s\.?|m\.a\.?|b\.tech|m\.tech|btech|mtech)\b/i;
const UNIVERSITY_KEYWORDS =
  /\b(university|college|institute|school|mit|stanford|oxford|cambridge|polytechnic|academy)\b/i;

function extractEducation(lines) {
  const entries = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const hasDegreeHint = DEGREE_KEYWORDS.test(line);
    const hasUniversityHint = UNIVERSITY_KEYWORDS.test(line);
    const hasDateHint = /\d{4}/.test(line);

    if (hasDegreeHint || (hasUniversityHint && hasDateHint)) {
      if (current) entries.push(current);

      const yearMatch = line.match(/(\d{4})/);
      const startDate =
        parseDate(line) ??
        (yearMatch
          ? new Date(parseInt(yearMatch[0], 10), 0, 1)
          : new Date(2020, 0, 1));

      // ✅ FIX 2: if degree line also contains a university keyword, use it
      // directly for institution so the field is never empty. The next
      // non-empty line will still overwrite it if it's a better match.
      const institutionFromLine = hasUniversityHint
        ? line.replace(/\d{4}.*/i, "").trim()
        : "";

      current = {
        degree: line.replace(/\d{4}.*$/i, "").trim() || "Imported Degree",
        // ✅ FIX 2: seed with something so Mongoose never sees an empty required field
        institution: institutionFromLine || "See uploaded resume",
        city: "",
        startDate,
        endDate: null,
        isCurrent: /present|current|pursuing/i.test(line),
        grade: "",
      };
    } else if (current && line.length > 5) {
      // Only overwrite institution once — keep the first substantive line
      // that follows the degree header.
      if (
        current.institution === "See uploaded resume" ||
        !current.institution
      ) {
        current.institution = line;
      } else if (
        !current.grade &&
        /[A-F]\+?|[0-9]+(\.[0-9]+)?\s*(GPA|CGPA|%)/i.test(line)
      ) {
        current.grade = line;
      }
    }
  }

  if (current) entries.push(current);

  // ✅ FIX 2: final safety net — institution can never be empty when we save
  const safe = entries.map((e) => ({
    ...e,
    institution: e.institution?.trim() || "See uploaded resume",
    degree: e.degree?.trim() || "Imported Degree",
  }));

  console.log(`📚 Extracted ${safe.length} education entries`);
  return safe;
}

// ── Skills ───────────────────────────────────────────────────────────────────

function extractSkills(lines) {
  const text = lines.join(" ");
  const raw = text
    .split(/[,•|/\n]|:\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40);

  const seen = new Set();
  const result = [];
  for (const skill of raw) {
    const key = skill.toLowerCase();
    if (!seen.has(key) && result.length < 30) {
      seen.add(key);
      result.push({ name: skill, type: "technical" });
    }
  }

  console.log(`🛠️  Extracted ${result.length} skills`);
  return result;
}

// ── Projects ─────────────────────────────────────────────────────────────────

function extractProjects(lines) {
  const entries = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const hasUrl = /(http|www|github|gitlab|\.com|\.io)/i.test(line);
    const isProjectHeader = /^[A-Z][a-z\s0-9]+$/.test(line) && line.length < 50;

    if ((hasUrl && line.length < 150) || (isProjectHeader && !current)) {
      if (current) entries.push(current);
      const urlMatch = line.match(/(http[s]?:\/\/[^\s]+)/);
      const projectName = line.replace(/(http[s]?:\/\/[^\s]+)/g, "").trim();
      current = {
        name: projectName || "Project",
        role: "",
        technologies: [],
        projectUrl: urlMatch?.[1] || "",
        description: "",
        startDate: new Date(),
        endDate: null,
        isCurrent: false,
      };
    } else if (current && line.length > 5) {
      if (/tech|built|using|stack/i.test(line)) {
        const techs = line
          .replace(/tech|built|using|stack|:\s*/gi, "")
          .split(/[,•|/]/)
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        current.technologies.push(...techs);
      } else {
        current.description += (current.description ? " " : "") + line;
      }
    }
  }
  if (current) entries.push(current);
  return entries.filter((p) => p.name && p.name.length > 1);
}

// ── Main export ──────────────────────────────────────────────────────────────

async function parseResumeFile(filePath, fileType) {
  console.log(`\n📄 Parsing resume: ${filePath}`);

  const rawText = await extractRawText(filePath, fileType);

  if (!rawText || rawText.trim().length < 30) {
    console.log("❌ Raw text too short or empty");
    return {
      rawText: rawText || "",
      parseStatus: "failed",
      parsedSections: {
        personalInfo: false,
        experience: false,
        education: false,
        skills: false,
      },
      data: {
        personalInfo: {},
        experience: [],
        education: [],
        skills: [],
        projects: [],
      },
    };
  }

  console.log(`✅ Extracted ${rawText.length} characters of raw text\n`);

  const sections = splitIntoSections(rawText);

  console.log("\n📝 Extracting sections:");
  const personalInfo = extractPersonalInfo(sections.header || [], rawText);
  const experience = extractExperience(sections.experience || []);
  const education = extractEducation(sections.education || []);
  const skills = extractSkills(sections.skills || []);
  const projects = extractProjects(sections.projects || []);

  const parsedSections = {
    personalInfo: Boolean(personalInfo.fullName || personalInfo.email),
    experience: experience.length > 0,
    education: education.length > 0,
    skills: skills.length > 0,
  };

  const successCount = Object.values(parsedSections).filter(Boolean).length;
  const parseStatus =
    successCount === 0 ? "failed" : successCount < 4 ? "partial" : "success";

  console.log(`\n✨ Parse Status: ${parseStatus} (${successCount}/4 sections)`);

  return {
    rawText,
    parseStatus,
    parsedSections,
    data: { personalInfo, experience, education, skills, projects },
  };
}

module.exports = { parseResumeFile, extractRawText };
