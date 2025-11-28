require("dotenv").config();
console.log("🔥 JWT_SECRET EN USO →", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const path = require("path"); // <-- IMPORTANTE
const pool = require("./db/conexion");

const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const couponRoutes = require('./routes/couponRoutes');
const contactRoutes = require("./routes/contactRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/subscribe", subscriptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

async function testDBConnection() {
    try {
        const [rows] = await pool.query("SELECT 1 + 1 AS result");
        console.log("Database connection successful:", rows[0].result);
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

app.use("/api/products", productRoutes);

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    await testDBConnection();  
});
