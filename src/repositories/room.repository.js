const pool = require('../config/database');

const getAllRooms = async () => {
  // const [rows] = await pool.query('SELECT * FROM rooms');
  // return rows;
};

module.exports = {
  getAllRooms
};
