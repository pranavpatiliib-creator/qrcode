/**
 * Not found and error handlers.
 */
function notFoundHandler(_req, res) {
  return res.status(404).json({
    status: "error",
    message: "Route not found"
  });
}

function errorHandler(err, _req, res, _next) {
  // eslint-disable-next-line no-console
  console.error(err);

  if (err && err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      status: "error",
      message: err.message
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal server error"
  });
}

module.exports = { notFoundHandler, errorHandler };