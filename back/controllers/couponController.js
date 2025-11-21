// src/controllers/couponController.js
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');
const CartCoupon = require('../models/CartCoupon'); // optional persistence
const { calculateTotals } = require('../utils/calculateTotals'); // your util - see note abajo

const couponController = {

  // POST /apply_coupon
  applyCoupon: async (req, res) => {
    try {
      // auth middleware must attach user to req.user
      const userId = req.user && req.user.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Coupon code is required' });
      }

      // 1) find coupon
      const coupon = await Coupon.findByCode(code);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      // 2) validate active / expiry
      if (coupon.expiry_date) {
        const today = new Date();
        const expiry = new Date(coupon.expiry_date);
        expiry.setHours(23,59,59,999);
        if (expiry < today) {
          return res.status(400).json({ success: false, message: 'Coupon expired' });
        }
      }

      // 3) validate max uses
      if (coupon.max_uses !== null && coupon.max_uses !== undefined) {
        if (coupon.current_uses >= coupon.max_uses) {
          return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }
      }

      // 4) get user cart items (assumes Cart.getUserCart returns array of items with product price)
      const cartItems = await Cart.getUserCart(userId);
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
      }

      // 5) calculate totals using existing util (subtotal, taxes, shipping)
      // calculateTotals should accept an array of items and return { subtotal, taxes, shipping, total }
      const totals = await calculateTotals(cartItems);

      // 6) compute discount
      let discountAmount = 0;
      if (coupon.discount_type === 'percentage') {
        discountAmount = (Number(coupon.discount_value) / 100) * Number(totals.subtotal);
      } else if (coupon.discount_type === 'amount') {
        discountAmount = Number(coupon.discount_value);
      }

      // Do not allow discount greater than subtotal
      if (discountAmount > Number(totals.subtotal)) {
        discountAmount = Number(totals.subtotal);
      }

      const newSubtotal = Number(totals.subtotal) - discountAmount;
      // Recompute taxes / total if your business logic applies taxes after discount.
      // Here we ask calculateTotals to allow passing a discount to recompute taxes if needed.
      // If your calculateTotals doesn't support that, adjust accordingly.

      let recomputedTotals = { ...totals };
      if (typeof calculateTotals === 'function') {
        // try calling with discount (best-effort)
        try {
          recomputedTotals = await calculateTotals(cartItems, discountAmount);
        } catch (e) {
          // fallback: manual adjust totals (assume taxes scale with subtotal)
          const ratio = newSubtotal / Number(totals.subtotal);
          recomputedTotals.subtotal = newSubtotal;
          recomputedTotals.taxes = Number(totals.taxes) * ratio;
          recomputedTotals.total = recomputedTotals.subtotal + recomputedTotals.taxes + Number(totals.shipping || 0);
        }
      }

      // 7) increment coupon uses
      await Coupon.incrementUses(coupon.coupon_id);

      // 8) persist applied coupon for this user's cart (optional but suggested)
      await CartCoupon.upsert(userId, coupon.code, discountAmount);

      // 9) return response
      return res.json({
        success: true,
        message: 'Coupon applied',
        coupon: {
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: Number(coupon.discount_value)
        },
        discountAmount: Number(discountAmount.toFixed(2)),
        totals: {
          subtotal: Number(recomputedTotals.subtotal.toFixed(2)),
          taxes: Number(recomputedTotals.taxes.toFixed(2)),
          shipping: Number(recomputedTotals.shipping || 0),
          total: Number(recomputedTotals.total.toFixed(2))
        }
      });

    } catch (error) {
      console.error('applyCoupon error', error);
      return res.status(500).json({ success: false, message: 'Server error applying coupon' });
    }
  },

  // Optional: endpoint to remove coupon from cart
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
