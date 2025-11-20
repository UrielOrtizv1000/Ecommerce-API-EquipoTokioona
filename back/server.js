require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/conexion");
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');


const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));    // Required for x-www-form-urlencoded support
app.use(express.json());

// Routes cart
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', wishlistRoutes);

async function testDBConnection() {
    try {
        const [rows] = await pool.query("SELECT 1 + 1 AS result");
        console.log("Database connection successful:", rows[0].result);
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

// Routes under /api/auth
app.use("/api/auth", authRoutes);

// Routes under /api/products
app.use("/api/product", productRoutes);

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await testDBConnection();
});