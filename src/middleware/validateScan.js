/**
 * Request validation middleware for barcode scan payloads.
 */
const { env } = require("../config/env");

function validateScanBody(req, res, next) {
  const { id, source } = req.body || {};

  if (typeof id !== "string") {
    return res.status(400).json({
      status: "error",
      message: "Invalid payload: id is required and must be a string"
    });
  }

  const normalizedId = id.trim();

  if (!normalizedId) {
    return res.status(400).json({
      status: "error",
      message: "Invalid id: empty value"
    });
  }

  if (normalizedId.length > 120) {
    return res.status(400).json({
      status: "error",
      message: "Invalid id: too long"
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
