const axios = require("axios");

const ACTOR_ID = "jpraRc4MCUh5ehbHV";

async function fetchJobs() {
  try {
    const response = await axios.post(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`,
      {
        keywords: [
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
        ],
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
