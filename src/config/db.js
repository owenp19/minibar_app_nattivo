const mysql = require("mysql2/promise");

let pool = null;

function initDbPool() {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "minibar_app",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return pool;
}

function getDbPool() {
  if (!pool) {
    throw new Error("Database pool is not initialized. Call initDbPool() at application startup.");
  }
  return pool;
}

module.exports = {
  initDbPool,
  getDbPool
};
