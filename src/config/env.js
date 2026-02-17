/**
 * Centralized environment variable loading and validation.
 */
const dotenv = require("dotenv");

dotenv.config();

const required = ["MONGODB_URI", "PORT"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const idPattern = (process.env.STUDENT_ID_REGEX || "").trim();
let compiledIdRegex = null;
if (idPattern) {
  try {
    compiledIdRegex = new RegExp(idPattern);
  } catch {
    throw new Error("Invalid STUDENT_ID_REGEX environment variable");
  }
}

const allowedStudentIds = (process.env.ALLOWED_STUDENT_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 8080),
  MONGODB_URI: process.env.MONGODB_URI,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "",
  STUDENT_ID_REGEX: compiledIdRegex,
  ALLOWED_STUDENT_IDS: new Set(allowedStudentIds)
};

module.exports = { env };
