function notFoundHandler(req, res, next) {
  res.status(404).json({
    message: "Endpoint not found",
    path: req.originalUrl
  });
}

function errorHandler(err, req, res, next) {
  console.error("Unexpected error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: "Internal server error"
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
