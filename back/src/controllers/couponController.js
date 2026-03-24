const Cart = require("../models/Cart");
const CartCoupon = require("../models/CartCoupon");
const Coupon = require("../models/Coupon");

const couponController = {
  applyCoupon: async (req, res) => {
    try {
      const userId = req.user.id;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ success: false, message: "Coupon code is required." });
      }

      const coupon = await Coupon.findByCode(code.trim().toUpperCase());
      if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found." });
      }

      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        return res.status(400).json({ success: false, message: "Coupon has expired." });
      }

      const cartItems = await Cart.getUserCart(userId);
      if (!cartItems?.length) {
        return res.status(400).json({ success: false, message: "The cart is empty." });
      }

      const subtotal = cartItems.reduce((total, item) => total + Number(item.subtotal), 0);
      if (subtotal <= 0) {
        return res.status(400).json({
          success: false,
          message: "No valid amount is available for this coupon.",
        });
      }

      let discountAmount = 0;
      if (coupon.discount_type === "percentage") {
        discountAmount = (coupon.discount_value / 100) * subtotal;
      } else {
        discountAmount = Number(coupon.discount_value);
      }

      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }

      await Coupon.incrementUses(coupon.coupon_id);
      await CartCoupon.upsert(userId, coupon.code, discountAmount);

      return res.json({
        success: true,
        message: "Coupon applied successfully.",
        coupon: { code: coupon.code, type: coupon.discount_type },
        discountAmount: Number(discountAmount.toFixed(2)),
        totals: {
          subtotal: Number(subtotal.toFixed(2)),
          discount: Number(discountAmount.toFixed(2)),
        },
      });
    } catch (error) {
      console.error("Error applying coupon:", error);
      return res.status(500).json({ success: false, message: "Server error." });
    }
  },

  removeCoupon: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized." });
      }

      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: "Coupon code is required." });
      }

      await CartCoupon.remove(userId, code);
      return res.json({ success: true, message: "Coupon removed." });
    } catch (error) {
      console.error("Error removing coupon:", error);
      return res.status(500).json({ success: false, message: "Server error." });
    }
  },
};

module.exports = couponController;
