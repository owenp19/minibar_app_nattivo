const roomsService = require('../services/rooms.service');

const getAllRooms = async (req, res, next) => {
  try {
    // const rooms = await roomsService.getAllRooms();
    // res.json(rooms);
    res.send('Get all rooms');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms
};
