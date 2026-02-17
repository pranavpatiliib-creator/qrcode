/**
 * Request validation middleware for barcode scan payloads.
 */
function validateScanBody(req, res, next) {
  const { id, source } = req.body || {};

  if (typeof id !== "string") {
    return res.status(400).json({
      status: "error",
      message: "Invalid payload: id is required and must be a string"
    });
  }

  const normalizedId = id.trim();

  // Adjust the regex based on your college ID format.
  if (!/^[A-Za-z0-9_-]{4,40}$/.test(normalizedId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid id format"
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