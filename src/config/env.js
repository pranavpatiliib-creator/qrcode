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
  AUTH_USER_ID: process.env.AUTH_USER_ID || "safe",
  AUTH_PASSWORD: process.env.AUTH_PASSWORD || "safe@123",
  AUTH_TOKEN_SECRET: process.env.AUTH_TOKEN_SECRET || "scanner-dev-secret-change-this",
  AUTH_TOKEN_TTL_MINUTES: Number(process.env.AUTH_TOKEN_TTL_MINUTES || 720),
  STUDENT_ID_REGEX: compiledIdRegex,
  ALLOWED_STUDENT_IDS: new Set(allowedStudentIds)
};

module.exports = { env };
