// src/models/CartCoupon.js
const db = require('../db/conexion');

const CartCoupon = {
  upsert: async (userId, couponCode, discountAmount) => {
    // try insert, if exists update discount_amount and applied_at
    const sql = `
      INSERT INTO cart_coupons (user_id, coupon_code, discount_amount)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE discount_amount = VALUES(discount_amount), applied_at = CURRENT_TIMESTAMP
    `;
    await db.execute(sql, [userId, couponCode, discountAmount]);
  },

  remove: async (userId, couponCode) => {
    const sql = 'DELETE FROM cart_coupons WHERE user_id = ? AND coupon_code = ?';
    await db.execute(sql, [userId, couponCode]);
  },

  getByUser: async (userId) => {
    const sql = 'SELECT * FROM cart_coupons WHERE user_id = ? LIMIT 1';
    const [rows] = await db.execute(sql, [userId]);
    return rows;
  }
};



module.exports = CartCoupon;
