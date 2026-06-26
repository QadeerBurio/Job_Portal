const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API Key:", apiKey ? "✅ Found" : "❌ Missing");

  if (!apiKey) {
    console.error("❌ Add GEMINI_API_KEY to backend/.env");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    console.log("🤖 Testing Gemini API...");
    const response = await model.generateContent("Say 'Hello'");
    console.log("✅ Gemini works! Response:", response.response.text());
  } catch (err) {
    console.error("❌ Gemini error:", err.message);

    if (err.message.includes("API_KEY_INVALID")) {
      console.error("❌ Your API key is invalid or wrong format");
    }
    if (err.message.includes("PERMISSION_DENIED")) {
      console.error("❌ API key doesn't have permission to use Gemini");
      console.error("→ Go to https://console.cloud.google.com");
      console.error("→ Enable 'Generative Language API'");
    }
    if (err.message.includes("429")) {
      console.error("❌ Quota exceeded — wait 24h or upgrade account");
    }
  }
}

testGemini();
