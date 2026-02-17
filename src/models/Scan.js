/**
 * Scan model with a unique index on studentId to enforce one-time distribution.
 */
const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    scannedAt: {
      type: Date,
      default: Date.now
    },
    source: {
      type: String,
      enum: ["camera", "manual", "sync"],
      default: "camera"
    }
  },
  {
    versionKey: false
  }
);

module.exports = mongoose.model("Scan", scanSchema);