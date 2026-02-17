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

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 8080),
  MONGODB_URI: process.env.MONGODB_URI,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || ""
};

module.exports = { env };