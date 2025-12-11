const { getDbPool } = require("../config/db");

async function getAllRooms() {
  const pool = getDbPool();

  const [rows] = await pool.query(
    `SELECT 
        h.id_habitacion AS id,
        h.numero AS roomNumber,
        p.id_piso AS floorId,
        p.nombre AS floorName
     FROM habitaciones h
     INNER JOIN pisos p ON p.id_piso = h.id_piso
     ORDER BY p.id_piso, h.numero`
  );

  return rows;
}

module.exports = {
  getAllRooms
};
