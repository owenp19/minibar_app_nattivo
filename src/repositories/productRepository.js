const { getDbPool } = require("../config/db");

async function getActiveProducts() {
  const pool = getDbPool();

  const [rows] = await pool.query(
    "SELECT id, name, price FROM products WHERE active = 1 ORDER BY name"
  );

  return rows;
}

module.exports = {
  getActiveProducts
};
