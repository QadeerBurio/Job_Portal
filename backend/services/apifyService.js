const axios = require("axios");

const ACTOR_ID = "jpraRc4MCUh5ehbHV";

const KEYWORDS = [
  // Software & Engineering
  "Software Engineer",
  "Software Developer",
  "MERN Stack Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "React Developer",
  "React Native",
  "Flutter",
  "Android Developer",
  "iOS Developer",
  "DevOps Engineer",
  "Cloud Engineer",
  "QA Engineer",
  "SQA Engineer",
  "Data Engineer",
  "Data Analyst",
  "Business Analyst",

  // AI & Data
  "AI Engineer",
  "Machine Learning",
  "Artificial Intelligence",
  "LLM Engineer",
  "Prompt Engineer",
  "Computer Vision",
  "Data Scientist",

  // Internships & Trainees
  "Internship",
  "Intern",
  "Management Trainee",
  "Graduate Trainee",
  "Trainee Engineer",
  "Software Intern",
  "React Native Intern",
  "Flutter Intern",
  "AI Intern",
  "Data Science Intern",

  // Marketing
  "Marketing",
  "Digital Marketing",
  "SEO",
  "Social Media Manager",
  "Content Writer",
  "Content Creator",
  "Performance Marketing",
  "Growth Marketing",
  "E Commerce",
  "Ecommerce",

  // Sales & Business
  "Sales Executive",
  "Sales Officer",
  "Business Development",
  "Account Manager",
  "Account Management",
  "Client Success",
  "Customer Success",
  "Client Operations",

  // Finance & Accounts
  "Finance",
  "Accountant",
  "Accounts Officer",
  "Finance Executive",
  "Financial Analyst",
  "Audit",
  "ACCA",
  "CA",
  "Tax Consultant",

  // HR
  "HR",
  "Human Resources",
  "HR Executive",
  "HR Officer",
  "Recruiter",
  "Talent Acquisition",
  "HR Intern",
  "People Operations",

  // Healthcare & Pharma
  "Pharmacy",
  "Industrial Pharmacy",
  "Clinical Research",
  "Clinical Research Associate",
  "Medical Officer",
  "Healthcare",

  // Architecture & Construction
  "Architect",
  "Architectural Draftsman",
  "Civil Engineer",
  "Urban Planning",
  "Urban Planner",
  "Construction",

  // Operations & Management
  "Operations",
  "Operations Executive",
  "Project Manager",
  "Project Coordinator",
  "Supply Chain",
  "Procurement",

  // General Office
  "Administrator",
  "Office Assistant",
  "Executive Assistant",
  "Coordinator",
];

async function fetchJobs() {
  const allJobs = [];

  for (const keyword of KEYWORDS) {
    try {
      const response = await axios.post(
        `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`,
        {
          keyword,
          country: "Pakistan",
          location: "Karachi",
          distance: 200,
          posted_since: "6 months",
          job_type: "all",
          remote_only: false,
          currency: "PKR",
          platforms: ["Indeed", "LinkedIn", "Glassdoor", "Naukri"],
          max_results: 100,
        },
      );

      const jobs = response.data || [];
      console.log(`"${keyword}": ${jobs.length} jobs fetched`);

      allJobs.push(...jobs);
    } catch (error) {
      console.error(
        `Apify Error for "${keyword}":`,
        error.response?.data || error.message,
      );
    }
  }

  return allJobs;
}

module.exports = fetchJobs;
