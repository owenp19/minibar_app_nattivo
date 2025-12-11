const express = require('express');
const router = express.Router();
const roomsController = require('../../controllers/rooms.controller');

router.get('/', roomsController.getAllRooms);

module.exports = router;
