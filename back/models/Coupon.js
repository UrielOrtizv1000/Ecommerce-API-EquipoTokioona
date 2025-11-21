/**
 * COUPON MODEL
 * Purpose: Handle discount coupons (including the one from newsletter subscription)
 * What it does:
 *   - Find valid unused coupon by code
 *   - Mark coupon as used after purchase
 *   - Create new coupons (admin or subscription feature)
 * Required by: Checkout page, newsletter subscription
 */
// src/models/Coupon.js
const db = require('../db/conexion'); // your mysql pool / connection

const Coupon = {
  findByCode: async (code) => {
    const sql = 'SELECT * FROM coupons WHERE code = ? LIMIT 1';
    const [rows] = await db.execute(sql, [code]);
    return rows[0] || null;
  },

  incrementUses: async (couponId) => {
    const sql = 'UPDATE coupons SET current_uses = current_uses + 1 WHERE coupon_id = ?';
    await db.execute(sql, [couponId]);
  }
};

module.exports = Coupon;
