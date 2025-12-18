require("dotenv").config();
require("./src/config/db").initDbPool();
const { createApp } = require("./src/app");

const app = createApp();
const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Minibar backend running at http://localhost:${port}`);
});
