const Job = require("../models/Job");

const fetchJobs = require("./apifyService");

const transformJobs = require("./transformJobs");

async function syncJobs() {
  try {
    const rawJobs = await fetchJobs();

    const jobs = transformJobs(rawJobs);

    for (const job of jobs) {
      await Job.updateOne(
        {
          title: job.title,
          company: job.company,
          applyUrl: job.applyUrl,
        },
        {
          $set: job,
        },
        {
          upsert: true,
        },
      );
    }

    console.log(`${jobs.length} jobs synced`);
  } catch (error) {
    console.error("Sync Error:", error.message);
  }
}

module.exports = syncJobs;
