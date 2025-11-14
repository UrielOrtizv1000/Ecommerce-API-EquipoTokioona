require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/conexion");

const authRoutes = require("./routes/authRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));    // Required for x-www-form-urlencoded support
app.use(express.json());

async function testDBConnection() {
    try {
        const [rows] = await pool.query("SELECT 1 + 1 AS result");
        console.log("Database connection successful:", rows[0].result);
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

// Routes under /api
app.use("/api", authRoutes);

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await testDBConnection();
});