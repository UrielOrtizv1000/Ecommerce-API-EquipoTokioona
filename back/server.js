require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/conexion");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes cart
app.use('/api/cart', require('./routes/cartRoutes'));

async function testDBConnection() {
    try {
        const [rows] = await pool.query("SELECT 1 + 1 AS result");
        console.log("Database connection successful:", rows[0].result);
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await testDBConnection();
});