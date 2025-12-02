require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./db/conexion");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const couponRoutes = require("./routes/couponRoutes");
const contactRoutes = require("./routes/contactRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
const port = process.env.PORT || 3000;

console.log("🔥 JWT_SECRET EN USO →", process.env.JWT_SECRET);

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔹 ARCHIVOS ESTÁTICOS DE IMÁGENES
const imagesPath = path.join(__dirname, "images");
console.log("🖼️ Sirviendo imágenes desde:", imagesPath);
app.use("/images", express.static(imagesPath));

// Rutas API
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/subscribe", subscriptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);

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
