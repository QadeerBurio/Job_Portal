// backend/test-skill-extraction.js
// ─────────────────────────────────────────────────────────────────────────────
// Run this to diagnose if skill extraction is working:
//   node backend/test-skill-extraction.js
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const mongoose = require("mongoose");
const Job = require("./models/Job");
const { extractJobSkills } = require("./utils/skillExtractor");

async function test() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected\n");

    // Get one job
    const job = await Job.findOne();

    if (!job) {
      console.log("❌ No jobs found in database!");
      process.exit(1);
    }

    console.log("📋 Test Job:");
    console.log(`   Title: ${job.title}`);
    console.log(`   Company: ${job.company}`);
    console.log(`   Current tags: ${job.tags?.length || 0} tags`);
    console.log(
      `   Description length: ${job.description?.length || 0} chars\n`,
    );

    // Test extraction
    console.log("🔍 Extracting skills...");
    const extracted = extractJobSkills(job);

    console.log(`✅ Extracted ${extracted.length} skills:`);
    extracted.forEach((skill) => console.log(`   • ${skill}`));

    if (extracted.length === 0) {
      console.log("\n⚠️  WARNING: No skills extracted!");
      console.log("   Possible causes:");
      console.log("   1. skillExtractor.js not found");
      console.log("   2. SKILL_DATABASE is empty");
      console.log("   3. Job description doesn't contain recognizable skills");
    } else {
      console.log("\n✅ Skill extraction working correctly!");
    }

    console.log("\n📊 Database Status:");
    console.log(
      `   Jobs with tags: ${await Job.countDocuments({ tags: { $ne: [] } })}`,
    );
    console.log(
      `   Jobs without tags: ${await Job.countDocuments({ tags: { $eq: [] } })}`,
    );

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

test();
