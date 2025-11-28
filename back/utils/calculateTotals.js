//Receives: items,contry,cupon 
// and returns subtotal,tax,shipping and total
// src/utils/calculateTotals.js
const pool = require('../db/conexion');

/**
 * Calculate all totals for cart (subtotal, discount, shipping, taxes, total)
 * @param {number} userId
 * @param {string} state - Mexican state (required)
 * @param {string} shippingMethod - "standard" | "express"
 * @returns {Promise<Object>}
 */
const calculateTotals = async (userId, state, shippingMethod = "standard") => {
  // 1. Get cart items WITH NAME
  const [items] = await pool.query(
    `SELECT
       c.product_id, 
       c.quantity,
       COALESCE(p.name, CONCAT('Producto ID ', c.product_id, ' (no disponible)')) AS name,
       COALESCE(p.price, 0) AS price,
       COALESCE(p.stock, 0) AS stock,
       (c.quantity * COALESCE(p.price, 0)) AS subtotal
     FROM cart c
     LEFT JOIN products p ON c.product_id = p.product_id
     WHERE c.user_id = ?`,
    [userId]
  );

  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  // 2. Subtotal
  const subtotal = items.reduce((acc, item) => acc + Number(item.subtotal), 0);

  // 3. Applied coupon
  let discountAmount = 0;
  let appliedCoupon = null;
  try {
    const [couponRows] = await pool.query(
      `SELECT coupon_code, discount_amount FROM cart_coupons WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (couponRows.length > 0) {
      appliedCoupon = couponRows[0].coupon_code;
      discountAmount = Number(couponRows[0].discount_amount);
    }
  } catch (err) {
    console.error("Error fetching coupon:", err);
  }

  // 4. Shipping cost - Mexico logic
  let shippingCost = 129; // Standard national

  const extendedZones = [
    "baja california sur", "chiapas", "quintana roo", "yucatán",
    "campeche", "tabasco", "oaxaca"
  ].map(z => z.toLowerCase());

  const isExtendedZone = extendedZones.includes(state.toLowerCase().trim());

  if (isExtendedZone) {
    shippingCost = 199;
  }

  if (shippingMethod === "express") {
    shippingCost += 120;
  }

  // Free shipping threshold
  if (subtotal >= 799) {
    shippingCost = 0;
  }

  // 5. Taxes - Mexico VAT 16%
  const taxableAmount = subtotal - discountAmount;
  const taxes = taxableAmount > 0 ? taxableAmount * 0.16 : 0;

  // 6. Final total
  const total = taxableAmount + taxes + shippingCost;

  return {
    items,
    itemsCount: items.length,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discountAmount.toFixed(2)),
    appliedCoupon,
    shippingCost,
    freeShipping: shippingCost === 0,
    shippingDetails: {
      state: state.trim(),
      method: shippingMethod
    },
    taxes: Number(taxes.toFixed(2)),
    total: Number(total.toFixed(2))
  };
};

module.exports = { calculateTotals };