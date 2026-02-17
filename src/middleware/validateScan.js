/**
 * Request validation middleware for barcode scan payloads.
 */
const { env } = require("../config/env");
const TARGET_ID_DIGITS = 5;

function normalizeIncomingId(rawId) {
  const compact = String(rawId || "")
    .trim()
    .replace(/\s+/g, "");

  if (!compact) {
    return "";
  }

  // Ignore text/prefix noise and always use the last 5 digits as the ID.
  const lastFiveDigits = compact.match(new RegExp(`(\\d{${TARGET_ID_DIGITS}})(?!.*\\d)`));
  if (lastFiveDigits) {
    return lastFiveDigits[1];
  }

  return "";
}

function validateScanBody(req, res, next) {
  const { id, source } = req.body || {};

  if (typeof id !== "string") {
    return res.status(400).json({
      status: "error",
      message: "Invalid payload: id is required and must be a string"
    });
  }

  const normalizedId = normalizeIncomingId(id);

  if (!normalizedId) {
    return res.status(400).json({
      status: "error",
      message: "Invalid id: last 5 digits not found"
    });
  }

  if (env.STUDENT_ID_REGEX && !env.STUDENT_ID_REGEX.test(normalizedId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid id format"
    });
  }

  if (env.ALLOWED_STUDENT_IDS.size > 0 && !env.ALLOWED_STUDENT_IDS.has(normalizedId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid id: not registered"
    });
  }

  if (source && !["camera", "manual", "sync"].includes(source)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid source value"
    });
  }

  req.validatedScan = {
    studentId: normalizedId,
    source: source || "camera"
  };

  return next();
}

module.exports = { validateScanBody };
