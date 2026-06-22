const Job = require("../models/Job");

const fetchJobs = require("./apifyService");

const transformJobs = require("./transformJobs");

async function syncJobs() {
  const syncStartedAt = new Date();

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
          $set: {
            ...job,
            isActive: true,
            lastSyncedAt: syncStartedAt,
          },
        },
        {
          upsert: true,
        },
      );
    }

    console.log(`${jobs.length} jobs synced`);

    // Anything not touched in this sync run is stale — deactivate it
    const sweepResult = await Job.updateMany(
      {
        lastSyncedAt: { $lt: syncStartedAt },
        isActive: true,
      },
      {
        $set: { isActive: false },
      },
    );

    console.log(`${sweepResult.modifiedCount} stale jobs marked inactive`);
  } catch (error) {
    console.error("Sync Error:", error.message);
  }
}

module.exports = syncJobs;
