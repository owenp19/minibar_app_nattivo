require("dotenv").config();
require("./src/config/db").initDbPool();
const { createApp } = require("./src/app");

const app = createApp();
const port = Number(process.env.PORT || 3000);

// Escuchar en todas las interfaces para acceso desde otros dispositivos (tablet/móvil)
app.listen(port, "0.0.0.0", () => {
  console.log(`Minibar backend running at http://localhost:${port}`);
});
