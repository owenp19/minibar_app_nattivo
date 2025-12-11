const pool = require('../config/database');

const findUserByUsername = async (username) => {
  // const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  // return rows[0];
};

module.exports = {
  findUserByUsername
};
