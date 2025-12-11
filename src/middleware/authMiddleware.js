// Middleware para verificar JWT (ejemplo)
const authMiddleware = (req, res, next) => {
  // Lógica de autenticación aquí
  next();
};

module.exports = authMiddleware;
