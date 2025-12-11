const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  // Middlewares básicos
  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  // Servir archivos estáticos desde la carpeta 'public'
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Redirección de la raíz a la página de login
  app.get('/', (req, res) => {
    res.redirect('/login/login.html');
  });

  // Registro de rutas
  app.use('/api', apiRoutes);
  app.use('/auth', authRoutes);

  // Manejo de 404
  app.use(notFoundHandler);

  // Middleware de manejo de errores
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
