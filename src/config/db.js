/**
 * MongoDB connection helper.
 */
const mongoose = require("mongoose");
const { env } = require("./env");

async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  // eslint-disable-next-line no-console
  console.log("Connected to MongoDB");
}

module.exports = { connectDB };