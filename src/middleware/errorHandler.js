// Middleware para manejo de errores centralizado

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested URL ${req.originalUrl} was not found on this server.`
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something broke!';

  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
