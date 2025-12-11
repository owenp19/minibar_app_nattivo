const pool = require('../config/database');

const getAllProducts = async () => {
  // const [rows] = await pool.query('SELECT * FROM products');
  // return rows;
};

const getProductById = async (id) => {
  // const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  // return rows[0];
};

module.exports = {
  getAllProducts,
  getProductById
};
