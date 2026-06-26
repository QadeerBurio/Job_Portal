// backend/utils/hybridResumeParser.js
// ─────────────────────────────────────────────────────────────────────────────
// HYBRID PARSER: Tries Gemini first, falls back to Regex if it fails
// This ensures you ALWAYS get data, with Gemini as the preference
// ─────────────────────────────────────────────────────────────────────────────

const { parseResumeFile: parseWithGemini } = require("./geminiResumeParser");
const { parseResumeFile: parseWithRegex } = require("./resumeParser");

async function parseResumeFile(filePath, fileType) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`📄 HYBRID PARSER: Gemini → Regex Fallback`);
  console.log(`${"=".repeat(70)}\n`);

  // Check if Gemini API key is set
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  if (!hasGeminiKey) {
    console.warn(`⚠️  GEMINI_API_KEY not set, using Regex parser only\n`);
    const result = await parseWithRegex(filePath, fileType);
    return result;
  }

  // Try Gemini first
  console.log(`🤖 Attempt 1: Gemini API\n`);
  try {
    const geminiResult = await parseWithGemini(filePath, fileType);

    // Check if Gemini actually found data
    const hasData =
      (geminiResult.data?.experience?.length ?? 0) > 0 ||
      (geminiResult.data?.education?.length ?? 0) > 0 ||
      (geminiResult.data?.skills?.length ?? 0) > 0 ||
      (geminiResult.data?.personalInfo?.fullName ?? "").length > 0;

    if (hasData) {
      console.log(`\n✅ Gemini succeeded with data!\n`);
      return geminiResult;
    } else {
      console.log(`⚠️  Gemini returned empty data, trying Regex...\n`);
    }
  } catch (error) {
    console.error(`❌ Gemini failed: ${error.message}`);
    console.log(`⚠️  Falling back to Regex parser...\n`);
  }

  // Fallback to Regex
  console.log(`📝 Attempt 2: Regex Parser (Fallback)\n`);
  const regexResult = await parseWithRegex(filePath, fileType);
  console.log(`✅ Regex parser complete\n`);
  return regexResult;
}

module.exports = { parseResumeFile };
