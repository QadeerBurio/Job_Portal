// backend/migrations/backfillJobSkills.js
// ─────────────────────────────────────────────────────────────────────────────
// One-time migration: Extract skills from existing job descriptions
// and populate the job.tags array.
//
// RUN ONCE:
//   node backend/migrations/backfillJobSkills.js
//
// This will:
//   1. Find all jobs with empty tags
//   2. Extract skills from their descriptions
//   3. Update each job's tags array
//   4. Report how many were updated
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");
const { extractJobSkills } = require("../utils/skillExtractor");
const Job = require("../models/Job");

async function backfillJobSkills() {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected");

    // Find all jobs with empty tags
    console.log("\n📊 Scanning jobs...");
    const jobsWithoutTags = await Job.find({
      $or: [
        { tags: { $exists: false } },
        { tags: { $eq: [] } },
        { tags: null },
      ],
    });

    console.log(
      `Found ${jobsWithoutTags.length} jobs with empty/missing tags\n`,
    );

    if (jobsWithoutTags.length === 0) {
      console.log("✅ All jobs already have tags!");
      await mongoose.disconnect();
      return;
    }

    // Process each job
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < jobsWithoutTags.length; i++) {
      const job = jobsWithoutTags[i];

      try {
        // Extract skills from description
        const skills = extractJobSkills(job);

        if (skills.length > 0) {
          // Update job with extracted skills
          await Job.findByIdAndUpdate(job._id, { tags: skills });
          updated++;

          // Log progress
          if ((i + 1) % 50 === 0) {
            console.log(`⏳ Processed ${i + 1}/${jobsWithoutTags.length}...`);
          }
        }
      } catch (err) {
        console.error(`❌ Error processing job ${job._id}: ${err.message}`);
        failed++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ MIGRATION COMPLETE");
    console.log("=".repeat(60));
    console.log(`Jobs updated: ${updated}`);
    console.log(`Jobs failed: ${failed}`);
    console.log(`Total processed: ${jobsWithoutTags.length}`);
    console.log("=".repeat(60));

    // Sample output
    console.log("\n📋 Sample of updated jobs:");
    const samples = await Job.find({ tags: { $exists: true, $ne: [] } })
      .limit(3)
      .select("title tags");
    samples.forEach((job) => {
      console.log(`  • ${job.title}`);
      console.log(`    Tags: ${job.tags.slice(0, 5).join(", ")}`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Migration complete! Database disconnected.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

// Run migration
backfillJobSkills();
