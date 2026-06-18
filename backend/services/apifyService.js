const axios = require("axios");

const ACTOR_ID = "jpraRc4MCUh5ehbHV";

async function fetchJobs() {
  try {
    const response = await axios.post(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`,
      {
        keyword: "Software Engineer",
        country: "Pakistan",
        max_results: 500,
        location: "Karachi",
        posted_since: "7 days",
        job_type: "all",
        remote_only: false,
        currency: "PKR",
      },
    );

    return response.data || [];
  } catch (error) {
    console.error("Apify Error:", error.response?.data || error.message);
    return [];
  }
}

module.exports = fetchJobs;
