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
    const issue = err.issues?.[0] || err.errors?.[0];
    const fieldName = issue?.path?.join(".") || "data";
    const detailMsg = issue?.message || "Invalid request data.";
    return res.status(400).json({
      success: false,
      message: `${fieldName}: ${detailMsg}`,
      code: "VALIDATION_ERROR",
      details: err.issues || err.errors,
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
