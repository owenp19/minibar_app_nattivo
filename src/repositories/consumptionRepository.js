const { getDbPool } = require("../config/db");

async function createConsumptionWithItems(roomId, note, items) {
  const pool = getDbPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [consResult] = await conn.query(
      "INSERT INTO consumptions (room_id, consumption_date, note, created_at) VALUES (?, NOW(), ?, NOW())",
      [roomId, note || null]
    );

    const consumptionId = consResult.insertId;

    const values = items.map((item) => [
      consumptionId,
      item.productId,
      item.quantity
    ]);

    await conn.query(
      "INSERT INTO consumption_items (consumption_id, product_id, quantity) VALUES ?",
      [values]
    );

    await conn.commit();
    return consumptionId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  createConsumptionWithItems
};
