// backend/middleware/uploadMiddleware.js
// ─────────────────────────────────────────────────────────────────────────────
// Multer config for resume uploads (PDF / DOCX only, 10MB max).
//
// Storage: local disk under backend/uploads/resumes/ — fine for a single
// Node instance. If you later deploy somewhere with an ephemeral filesystem
// (Render/Heroku free tiers, multi-instance scaling) or want files to survive
// redeploys, swap `diskStorage` below for a cloud storage adapter (S3, etc.) —
// the rest of the app only depends on getting back a fileUrl/filePath, so
// that swap stays contained to this one file.
// ─────────────────────────────────────────────────────────────────────────────
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "resumes");

// Ensure the upload directory exists at boot (also called from server.js,
// safe to call twice — fs.mkdirSync with recursive is idempotent)
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}
ensureUploadDir();

const ALLOWED_MIME_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Random filename on disk — never trust/use the user-supplied original
    // filename for the actual stored path (path traversal / collision risk).
    // The original name is preserved separately in MongoDB as `fileName`
    // for display purposes only.
    const ext = ALLOWED_MIME_TYPES[file.mimetype] === "docx" ? ".docx" : ".pdf";
    const uniqueName = `${req.userId || "anon"}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, uniqueName);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    // Rejecting here surfaces as a multer error caught in the route handler,
    // with a clear message the frontend can show directly to the user.
    cb(new Error("UNSUPPORTED_FILE_TYPE"));
  }
}

const uploadResumeFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cap
}).single("resume"); // field name the frontend's FormData must use

module.exports = {
  uploadResumeFile,
  UPLOAD_DIR,
  ensureUploadDir,
  ALLOWED_MIME_TYPES,
};
