function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found.",
    code: "ROUTE_NOT_FOUND",
  });
}

function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Invalid request data.",
      code: "VALIDATION_ERROR",
    });
  }

  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "An unexpected error occurred." : err.message,
    code: err.code || "INTERNAL_ERROR",
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
