const express = require('express');
const router = express.Router();

const productRoutes = require('./products.routes');
const roomRoutes = require('./rooms.routes');

router.use('/products', productRoutes);
router.use('/rooms', roomRoutes);

module.exports = router;
