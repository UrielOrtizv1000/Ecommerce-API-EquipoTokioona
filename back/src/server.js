const app = require("./app");
const pool = require("./config/database");

const port = process.env.PORT || 3000;

async function testDatabaseConnection() {
  try {
    await pool.query("SELECT 1 + 1 AS result");
    console.log("Database connection established.");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await testDatabaseConnection();
});
