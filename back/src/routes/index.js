const adminRoutes = require("./adminRoutes");
const addressRoutes = require("./addressRoutes");
const authRoutes = require("./authRoutes");
const cartRoutes = require("./cartRoutes");
const contactRoutes = require("./contactRoutes");
const couponRoutes = require("./couponRoutes");
const orderRoutes = require("./orderRoutes");
const productRoutes = require("./productRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const wishlistRoutes = require("./wishlistRoutes");

function registerRoutes(app) {
  app.use("/api/admin", adminRoutes);
  app.use("/api/address", addressRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/coupons", couponRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/subscribe", subscriptionRoutes);
  app.use("/api/wishlist", wishlistRoutes);
}

module.exports = { registerRoutes };
