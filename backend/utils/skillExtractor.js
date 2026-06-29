// backend/utils/skillExtractor.js
// ─────────────────────────────────────────────────────────────────────────────
// Extracts skills from job descriptions when job.tags is empty.
// Scans description for known tech skills and returns them as an array.
// ✅ FIXED: Proper regex escaping for C++, C#, and other special characters
// ─────────────────────────────────────────────────────────────────────────────

// Comprehensive list of technical and professional skills commonly found in Karachi tech jobs
const SKILL_DATABASE = [
  // Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "Dart",
  "SQL",
  "HTML",
  "CSS",
  "SCSS",
  "Sass",

  // Frontend Frameworks
  "React",
  "React Native",
  "Vue",
  "Vue.js",
  "Angular",
  "Angular.js",
  "Next.js",
  "Nuxt",
  "Flutter",
  "Svelte",
  "Ember",

  // Backend Frameworks
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "FastAPI",
  "Spring",
  "Spring Boot",
  "Laravel",
  "Rails",
  "Gin",
  "Nest.js",
  "NestJS",

  // Databases
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Firebase",
  "Firestore",
  "Supabase",
  "DynamoDB",
  "Cassandra",
  "Elasticsearch",
  "Oracle",
  "SQL Server",
  "MariaDB",

  // DevOps & Cloud
  "AWS",
  "Azure",
  "Google Cloud",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitLab CI",
  "GitHub Actions",
  "CircleCI",
  "Heroku",
  "DigitalOcean",
  "Netlify",
  "Vercel",
  "Linux",
  "Ubuntu",
  "CentOS",
  "Nginx",
  "Apache",

  // APIs & Protocols
  "REST",
  "RESTful",
  "GraphQL",
  "SOAP",
  "OAuth",
  "JWT",
  "WebSocket",
  "gRPC",
  "HTTP",
  "HTTPS",

  // Tools & Technologies
  "Git",
  "GitHub",
  "GitLab",
  "Bitbucket",
  "Jira",
  "Confluence",
  "Slack",
  "Figma",
  "Adobe XD",
  "Sketch",
  "VS Code",
  "Visual Studio",
  "Postman",
  "Insomnia",
  "Webpack",
  "Vite",
  "Babel",
  "ESLint",
  "Prettier",
  "Jest",
  "Mocha",
  "Cypress",
  "Selenium",
  "Photoshop",
  "Illustrator",

  // Soft Skills
  "Communication",
  "Leadership",
  "Problem Solving",
  "Team Work",
  "Agile",
  "Scrum",
  "Kanban",
  "Project Management",
  "Time Management",
  "Presentation",
  "Documentation",
  "Code Review",
  "Testing",
  "Debugging",

  // Methodologies
  "Microservices",
  "Monolithic",
  "SOLID",
  "Design Patterns",
  "MVC",
  "MVP",
  "MVVM",
  "Clean Architecture",
  "TDD",
  "BDD",
  "CI/CD",
  "DevOps",

  // Data & AI
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Data Analysis",
  "Data Science",
  "Big Data",
  "Apache Spark",
  "Hadoop",
  "NLP",
  "Computer Vision",

  // Mobile
  "iOS",
  "Android",
  "Xcode",
  "Android Studio",
  "React Native",
  "Flutter",
  "Cross-platform",

  // Testing
  "Unit Testing",
  "Integration Testing",
  "E2E Testing",
  "Load Testing",
  "Performance Testing",
  "Security Testing",

  // Other
  "XML",
  "JSON",
  "YAML",
  "Markdown",
  "Bash",
  "PowerShell",
  "Linux",
  "Windows",
  "macOS",
  "API Design",
  "Database Design",
  "System Design",
  "Scalability",
  "Performance",
  "Security",
  "Caching",
  "Message Queues",
  "RabbitMQ",
  "Kafka",
  "Memcached",
  "Varnish",
];

/**
 * Escape special regex characters
 * Fixes issues with C++, C#, etc. where + and # are special regex chars
 */
function escapeRegex(str) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extract skills from job description text.
 * Returns list of skills found in description.
 *
 * @param {string} text - Job description text
 * @returns {string[]} Array of skills found
 */
function extractSkillsFromText(text) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const lowerText = text.toLowerCase();
  const foundSkills = new Set();

  // Search for each skill in the text
  for (const skill of SKILL_DATABASE) {
    const skillLower = skill.toLowerCase();

    try {
      // First: simple substring match (fast)
      if (lowerText.includes(skillLower)) {
        foundSkills.add(skill);
        continue;
      }

      // Second: word boundary regex match (accurate)
      // Only do regex if substring didn't match, to avoid processing overhead
      const escapedSkill = escapeRegex(skillLower);

      try {
        const regex = new RegExp(
          `(^|[^a-zA-Z0-9])${escapedSkill}([^a-zA-Z0-9]|$)`,
          "i",
        );

        if (regex.test(lowerText)) {
          foundSkills.add(skill);
        }
      } catch (regexErr) {
        // If regex compilation fails, just skip this skill
        console.warn(`Regex error for skill "${skill}": ${regexErr.message}`);
      }
    } catch (err) {
      // Silently skip any skill that causes issues
      continue;
    }
  }

  return Array.from(foundSkills);
}

/**
 * Extract skills from job object.
 * Uses job.tags if available, otherwise extracts from description.
 *
 * @param {Object} job - Job document from MongoDB
 * @returns {string[]} Array of skills
 */
function extractJobSkills(job) {
  if (!job) return [];

  // If job has explicit tags, use them (most accurate)
  if (job.tags && Array.isArray(job.tags) && job.tags.length > 0) {
    return job.tags;
  }

  // Fallback: extract from description
  const descriptionText = job.description || "";
  const requirementsText = Array.isArray(job.requirements)
    ? job.requirements.join(" ")
    : job.requirements || "";
  const responsibilitiesText = Array.isArray(job.responsibilities)
    ? job.responsibilities.join(" ")
    : job.responsibilities || "";
  const titleText = job.title || "";

  const combinedText = `${titleText} ${descriptionText} ${requirementsText} ${responsibilitiesText}`;

  const skills = extractSkillsFromText(combinedText);

  // Also check title for skills (e.g., "Senior Flutter Developer")
  const titleSkills = extractSkillsFromText(titleText);
  const allSkills = new Set([...skills, ...titleSkills]);

  return Array.from(allSkills);
}

module.exports = {
  extractSkillsFromText,
  extractJobSkills,
  SKILL_DATABASE,
  escapeRegex,
};
