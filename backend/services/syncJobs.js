async function syncJobs() {
  try {
    console.log("Fetching jobs from Apify...");

    const rawJobs = await fetchJobs();

    console.log("Raw jobs received:", rawJobs.length);

    const jobs = transformJobs(rawJobs);

    console.log("Transformed jobs:", jobs.length);

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
