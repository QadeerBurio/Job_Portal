// backend/utils/geminiResumeParser.js
// ─────────────────────────────────────────────────────────────────────────────
// CORRECT API: Uses pdf-parse v2 CLASS-BASED API (exactly like your old code)
// ─────────────────────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

// ── pdf-parse v2 API — CLASS BASED ─────────────────────────────────────────
// ✅ CORRECT: This matches your old resumeParser.js that was working
let PDFParse;
try {
  ({ PDFParse } = require("pdf-parse"));
} catch {
  console.warn("⚠️  pdf-parse not installed — run: npm install pdf-parse");
}

// ── Google Gemini ─────────────────────────────────────────────────────────────
let GoogleGenerativeAI;
let geminiModel;
try {
  ({ GoogleGenerativeAI } = require("@google/generative-ai"));
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try gemini-2.0-flash first (latest), fall back to gemini-1.5-flash
    try {
      geminiModel = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });
      console.log("✅ Gemini model: gemini-2.5-flash");
    } catch {
      geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log("✅ Gemini model: gemini-1.5-flash");
    }
  } else {
    console.warn("⚠️  GEMINI_API_KEY not set in .env");
  }
} catch (err) {
  console.warn(
    "⚠️  @google/generative-ai not installed or error:",
    err.message,
  );
}

// ── Extract raw text from PDF or DOCX ────────────────────────────────────────
async function extractRawText(filePath, fileType) {
  console.log(`📖 Extracting text from ${fileType.toUpperCase()}...`);

  try {
    if (fileType === "pdf") {
      if (!PDFParse) {
        throw new Error("pdf-parse not loaded. Run: npm install pdf-parse");
      }
      const buffer = fs.readFileSync(filePath);
      // ✅ CORRECT: PDFParse is a CLASS, instantiate it
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();

      await parser.destroy();

      const text = result.text || "";

      console.log(`✅ PDF: ${text.length} characters extracted`);

      return text;
    }

    if (fileType === "docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      console.log(`✅ DOCX: ${result.value.length} characters extracted`);
      return result.value;
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (err) {
    console.error(`❌ Text extraction failed:`, err.message);
    throw err;
  }
}

// ── Gemini prompt ──────────────────────────────────────────────────────────
const GEMINI_PROMPT = `You are an expert resume parser. Extract ALL resume data and return ONLY valid JSON (no markdown, no explanation).

STRICT RULES:
1. Dates → ISO format YYYY-MM-DD. Year only → "YYYY-01-01"
2. "Present"/"Current" → endDate: null, isCurrent: true
3. All fields → "" (empty string) if missing, never null (except endDate)
4. experience[].companyName (NOT company)
5. skills[].type → "technical" or "soft"
6. experience[].description → minimum 50 chars
7. Extract LinkedIn/GitHub/portfolio URLs from entire text
8. All arrays must exist, even if empty []

Return ONLY this JSON object:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "city": "Karachi",
    "country": "Pakistan",
    "linkedinUrl": "",
    "portfolioUrl": "",
    "summary": ""
  },
  "experience": [
    {
      "jobTitle": "",
      "companyName": "",
      "location": "",
      "startDate": "YYYY-MM-DD",
      "endDate": null,
      "isCurrent": false,
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "city": "",
      "startDate": "YYYY-MM-DD",
      "endDate": null,
      "isCurrent": false,
      "grade": ""
    }
  ],
  "skills": [
    { "name": "", "type": "technical" }
  ],
  "projects": [
    {
      "name": "",
      "role": "",
      "technologies": [],
      "projectUrl": "",
      "description": "",
      "startDate": "YYYY-MM-DD",
      "endDate": null,
      "isCurrent": false
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "dateIssued": "YYYY-MM-DD",
      "expirationDate": null,
      "credentialUrl": ""
    }
  ]
}

RESUME TEXT:
`;

async function callWithRetry(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetryable =
        err.message?.includes("429") ||
        err.message?.includes("503") ||
        err.message?.includes("Service Unavailable");

      if (isRetryable && attempt < maxRetries) {
        const waitMs = attempt * 5000;

        console.warn(
          `⏳ Gemini busy. Waiting ${waitMs / 1000}s before retry ${attempt}/${maxRetries}...`,
        );

        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }

      throw err;
    }
  }
}

// ── Parse with Gemini ──────────────────────────────────────────────────────
async function parseWithGemini(resumeText) {
  if (!geminiModel) {
    throw new Error(
      "Gemini not initialized. Check GEMINI_API_KEY in .env and @google/generative-ai installed",
    );
  }

  console.log(`🤖 Gemini: Parsing ${resumeText.length} characters...`);

  try {
    const response = await callWithRetry(() =>
      geminiModel.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: GEMINI_PROMPT + resumeText }],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 8192,
        },
      }),
    );

    console.log(JSON.stringify(response.response, null, 2));

    const rawText = response.response.text();
    console.log(`✅ Gemini: Response received (${rawText.length} chars)`);
    console.log("========== GEMINI RAW RESPONSE ==========");
    console.log(rawText);
    console.log("=========================================");

    // Clean markdown if present
    const clean = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(clean);
    console.log("✅ Gemini: JSON parsed successfully");
    return parsed;
  } catch (err) {
    console.error("❌ Gemini error:", err.message);
    throw err;
  }
}

// ── Fallback regex parser ──────────────────────────────────────────────────
const KNOWN_SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "React",
  "React Native",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "SQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "Figma",
  "Flutter",
  "Dart",
  "Java",
  "C++",
  "C#",
  "PHP",
  "Laravel",
  "Django",
  "FastAPI",
  "Redux",
  "GraphQL",
  "REST",
  "HTML",
  "CSS",
  "Tailwind",
  "Vue",
  "Angular",
  "Next.js",
  "Firebase",
  "Supabase",
  "Linux",
  "Nginx",
  "CI/CD",
  "Jira",
  "Agile",
  "Scrum",
];

function fallbackParser(rawText) {
  console.log("🔄 Fallback regex parser...");

  const text = rawText || "";
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const phoneMatch = text.match(/(\+92|0092|0)[0-9\s\-().]{9,14}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const githubMatch = text.match(/github\.com\/[\w-]+/i);

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 2 &&
        l.length < 60 &&
        !l.includes("@") &&
        !l.includes("http") &&
        !l.match(/^\d/),
    );

  const lowerText = text.toLowerCase();
  const skills = KNOWN_SKILLS.filter((s) =>
    lowerText.includes(s.toLowerCase()),
  ).map((s) => ({ name: s, type: "technical" }));

  const fullName = lines[0] || "";
  console.log(`🔄 Extracted: name="${fullName}" skills=${skills.length}`);

  return {
    personalInfo: {
      fullName,
      email: emailMatch?.[0] || "",
      phone: phoneMatch?.[0]?.replace(/\s+/g, " ").trim() || "",
      city: "Karachi",
      country: "Pakistan",
      linkedinUrl: linkedinMatch ? `https://${linkedinMatch[0]}` : "",
      portfolioUrl: githubMatch ? `https://${githubMatch[0]}` : "",
      summary: "",
    },
    experience: [],
    education: [],
    skills,
    projects: [],
    certifications: [],
  };
}

// ── Main export ────────────────────────────────────────────────────────────
async function parseResumeFile(filePath, fileType) {
  console.log("\n" + "=".repeat(70));
  console.log("📄 GEMINI RESUME PARSER");
  console.log("=".repeat(70));

  let rawText = "";

  // Step 1: Extract text
  try {
    rawText = await extractRawText(filePath, fileType);
    if (!rawText || rawText.trim().length < 30) {
      throw new Error("Extracted text too short — likely scanned/image PDF");
    }
  } catch (err) {
    console.error(err.message);
    return {
      success: false,
      data: fallbackParser(""),
      rawText: "",
      parseStatus: "failed",
      parsedSections: {
        personalInfo: false,
        experience: false,
        education: false,
        skills: false,
      },
      error: err.message,
    };
  }

  // Step 2: Try Gemini, fall back to regex
  let data;
  let usedFallback = false;

  try {
    data = await parseWithGemini(rawText);
  } catch (err) {
    console.warn("⚠️ Gemini failed, using regex fallback");

    data = fallbackParser(rawText);
    usedFallback = true;

    data.aiMessage =
      "AI parsing is temporarily unavailable. Basic information was extracted using the fallback parser.";
  }
  // Step 3: Evaluate what we got
  const sections = {
    personalInfo: !!(data.personalInfo?.fullName || data.personalInfo?.email),
    experience: (data.experience?.length ?? 0) > 0,
    education: (data.education?.length ?? 0) > 0,
    skills: (data.skills?.length ?? 0) > 0,
  };

  const filled = Object.values(sections).filter(Boolean).length;
  const parseStatus = usedFallback
    ? "partial"
    : filled === 0
      ? "failed"
      : filled < 3
        ? "partial"
        : "success";

  console.log(`\n✨ Result: ${parseStatus}`);
  console.log(`   Name: ${data.personalInfo?.fullName || "(empty)"}`);
  console.log(`   Experience: ${data.experience?.length ?? 0}`);
  console.log(`   Education: ${data.education?.length ?? 0}`);
  console.log(`   Skills: ${data.skills?.length ?? 0}`);
  console.log(`   Projects: ${data.projects?.length ?? 0}`);
  console.log(`   Certifications: ${data.certifications?.length ?? 0}`);
  console.log("=".repeat(70) + "\n");

  return {
    success: !usedFallback,
    data,
    rawText,
    parseStatus,
    parsedSections: sections,
    message: data.aiMessage || null,
  };
}

module.exports = { parseResumeFile, extractRawText };
