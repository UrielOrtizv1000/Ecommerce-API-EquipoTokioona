// src/controllers/couponController.js
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const CartCoupon = require('../models/CartCoupon'); // optional persistence
const { calculateTotals } = require('../utils/calculateTotals'); // your util - see note abajo

const couponController = {

  // POST /apply_coupon
  applyCoupon: async (req, res) => {
   try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code) return res.status(400).json({ success: false, message: 'Code required' });

    const coupon = await Coupon.findByCode(code.trim().toUpperCase());
    if (!coupon) return res.status(404).json({ success: false, message: 'Cupón not found' });

    // Valite date
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, message: 'Expired Coupon' });
    }

    // Get cart
    const cartItems = await Cart.getUserCart(userId);
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'The cart is empty' });
    }

    // Calculates subtotal
    const subtotal = cartItems.reduce((acc, item) => acc + Number(item.subtotal), 0);

    if (subtotal <= 0) {
      return res.status(400).json({ success: false, message: 'No valid amount for the coupon' });
    }

    // Calculates discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (coupon.discount_value / 100) * subtotal;
    } else {
      discountAmount = Number(coupon.discount_value);
    }
    if (discountAmount > subtotal) discountAmount = subtotal;

    // Increment uses and save used coupon
    await Coupon.incrementUses(coupon.coupon_id);
    await CartCoupon.upsert(userId, coupon.code, discountAmount);

    return res.json({
      success: true,
      message: 'Coupon successfully applied!! Thank you',
      coupon: { code: coupon.code, type: coupon.discount_type },
      discountAmount: Number(discountAmount.toFixed(2)),
      totals: {
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discountAmount.toFixed(2)),
      }
    });

  } catch (error) {
    console.error('Error applying the coupon:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
  },

  // endpoint to remove coupon from cart
  removeCoupon: async (req, res) => {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { code } = req.body;
      if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

      await CartCoupon.remove(userId, code);
      return res.json({ success: true, message: 'Coupon removed' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

};

module.exports = couponController;
