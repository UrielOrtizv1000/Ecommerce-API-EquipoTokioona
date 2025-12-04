// utils/calculateTotals.js
const pool = require('../db/conexion');

/**
 * Calculate all totals for cart (subtotal, discount, shipping, taxes, total)
 * @param {number} userId
 * @param {string} country - Código de país (MX, US, CA, ES, CO)
 * @param {string} shippingMethod - "standard" | "express"
 * @returns {Promise<Object>}
 */
const calculateTotals = async (userId, country, shippingMethod = "standard") => {
  // 1. Get cart items WITH NAME
const [items] = await pool.query(
  `SELECT
     c.product_id, 
     c.quantity,
     COALESCE(p.name, CONCAT('Producto ID ', c.product_id, ' (no disponible)')) AS name,
     COALESCE(p.price, 0) AS original_price,
     COALESCE(p.discount, 0) AS discount,
     COALESCE(p.is_on_sale, 0) AS is_on_sale,
     COALESCE(p.stock, 0) AS stock,
     -- Precio con descuento
     CASE 
       WHEN COALESCE(p.is_on_sale, 0) = 1 AND COALESCE(p.discount, 0) > 0 
       THEN ROUND(COALESCE(p.price, 0) - (COALESCE(p.price, 0) * COALESCE(p.discount, 0) / 100), 2)
       ELSE COALESCE(p.price, 0)
     END AS final_price,
     -- Subtotal con descuento
     (c.quantity * 
       CASE 
         WHEN COALESCE(p.is_on_sale, 0) = 1 AND COALESCE(p.discount, 0) > 0 
         THEN ROUND(COALESCE(p.price, 0) - (COALESCE(p.price, 0) * COALESCE(p.discount, 0) / 100), 2)
         ELSE COALESCE(p.price, 0)
       END
     ) AS subtotal
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

  // 4. CONFIGURATION BY COUNTRY
  const countryConfig = {
    'MX': {
      taxRate: 0.16,
      shipping: {
        standard: 129, // MXN
        express: 249,
        freeThreshold: 799
      },
      currency: 'MXN',
      symbol: '$'
    },
    'US': {
      taxRate: 0.07,
      shipping: {
        standard: 15, // USD
        express: 30,
        freeThreshold: 100
      },
      currency: 'USD',
      symbol: '$'
    },
    'CA': {
      taxRate: 0.13,
      shipping: {
        standard: 20, // CAD
        express: 40,
        freeThreshold: 150
      },
      currency: 'CAD',
      symbol: 'C$'
    },
    'ES': {
      taxRate: 0.21,
      shipping: {
        standard: 10, // EUR
        express: 25,
        freeThreshold: 50
      },
      currency: 'EUR',
      symbol: '€'
    },
    'CO': {
      taxRate: 0.19,
      shipping: {
        standard: 15, // USD equivalent - mantenemos USD
        express: 30,
        freeThreshold: 100
      },
      currency: 'USD', // Mostrar en USD
      symbol: '$'
    }
  };

  // 5. SHIPPING COST BY COUNTRY
  let shippingCost = 0;
  const config = countryConfig[country] || countryConfig['MX']; // Default México

  if (subtotal >= config.shipping.freeThreshold) {
    shippingCost = 0; // FREE SHIPPING
  } else {
    shippingCost = config.shipping[shippingMethod] || config.shipping.standard;
    
    // ESPECIAL LOGIC FOR MEXICO EXTENDED ZONES
    if (country === 'MX' && config.extendedZones) {
      // Si el país es México y tenemos un "state" (provincia/estado) en el parámetro
      // Nota: Actualmente el parámetro 'country' realmente viene como 'state' del frontend
      // Para mantener compatibilidad, chequeamos si el valor está en las zonas extendidas
      const userState = country.toLowerCase(); // El parámetro actualmente se llama 'state'
      if (config.extendedZones.includes(userState)) {
        shippingCost += 70; 
      }
    }
  }

  // 6. TAZES AMOUNT
  const taxableAmount = subtotal - discountAmount;
  const taxes = taxableAmount > 0 ? taxableAmount * config.taxRate : 0;

  // 7. TOTAL
  const total = taxableAmount + taxes + shippingCost;

  return {
    items,
    itemsCount: items.length,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discountAmount.toFixed(2)),
    appliedCoupon,
    shippingCost: Number(shippingCost.toFixed(2)),
    freeShipping: shippingCost === 0,
    shippingDetails: {
      country: country,
      method: shippingMethod
    },
    taxes: Number(taxes.toFixed(2)),
    total: Number(total.toFixed(2)),
    currency: config.currency
  };
};

module.exports = { calculateTotals };