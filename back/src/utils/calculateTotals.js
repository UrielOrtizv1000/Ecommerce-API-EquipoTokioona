const pool = require("../config/database");

const COUNTRY_RATES = {
  MX: 1,
  US: 0.058,
  CA: 0.079,
  ES: 0.053,
  CO: 0.058,
};

const COUNTRY_CONFIG = {
  MX: {
    taxRate: 0.16,
    shipping: { standard: 129, express: 249, freeThreshold: 799 },
    currency: "MXN",
  },
  US: {
    taxRate: 0.07,
    shipping: { standard: 15, express: 30, freeThreshold: 100 },
    currency: "USD",
  },
  CA: {
    taxRate: 0.13,
    shipping: { standard: 20, express: 40, freeThreshold: 150 },
    currency: "CAD",
  },
  ES: {
    taxRate: 0.21,
    shipping: { standard: 10, express: 25, freeThreshold: 50 },
    currency: "EUR",
  },
  CO: {
    taxRate: 0.19,
    shipping: { standard: 15, express: 30, freeThreshold: 100 },
    currency: "USD",
  },
};

const convertCurrency = (amount, country) => {
  const rate = COUNTRY_RATES[country] || 1;
  return Number((amount * rate).toFixed(2));
};

const calculateTotals = async (userId, country, shippingMethod = "standard") => {
  const [items] = await pool.query(
    `
      SELECT
        c.product_id,
        c.quantity,
        COALESCE(p.name, CONCAT('Product ID ', c.product_id, ' (unavailable)')) AS name,
        COALESCE(p.price, 0) AS original_price,
        COALESCE(p.discount, 0) AS discount,
        COALESCE(p.is_on_sale, 0) AS is_on_sale,
        COALESCE(p.stock, 0) AS stock,
        CASE
          WHEN COALESCE(p.is_on_sale, 0) = 1 AND COALESCE(p.discount, 0) > 0
          THEN ROUND(COALESCE(p.price, 0) - (COALESCE(p.price, 0) * COALESCE(p.discount, 0) / 100), 2)
          ELSE COALESCE(p.price, 0)
        END AS final_price,
        (
          c.quantity * CASE
            WHEN COALESCE(p.is_on_sale, 0) = 1 AND COALESCE(p.discount, 0) > 0
            THEN ROUND(COALESCE(p.price, 0) - (COALESCE(p.price, 0) * COALESCE(p.discount, 0) / 100), 2)
            ELSE COALESCE(p.price, 0)
          END
        ) AS subtotal
      FROM cart c
      LEFT JOIN products p ON c.product_id = p.product_id
      WHERE c.user_id = ?
    `,
    [userId]
  );

  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  const subtotalMXN = items.reduce((total, item) => total + Number(item.subtotal), 0);
  const subtotal = convertCurrency(subtotalMXN, country);

  let discountAmountMXN = 0;
  let appliedCoupon = null;

  try {
    const [couponRows] = await pool.query(
      "SELECT coupon_code, discount_amount FROM cart_coupons WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (couponRows.length > 0) {
      appliedCoupon = couponRows[0].coupon_code;
      discountAmountMXN = Number(couponRows[0].discount_amount);
    }
  } catch (error) {
    console.error("Error fetching coupon:", error);
  }

  const discountAmount = convertCurrency(discountAmountMXN, country);
  const config = COUNTRY_CONFIG[country] || COUNTRY_CONFIG.MX;

  const shippingCost =
    subtotal >= config.shipping.freeThreshold
      ? 0
      : config.shipping[shippingMethod] || config.shipping.standard;

  const taxableAmount = subtotal - discountAmount;
  const taxes = taxableAmount > 0 ? taxableAmount * config.taxRate : 0;
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
      country,
      method: shippingMethod,
    },
    taxes: Number(taxes.toFixed(2)),
    total: Number(total.toFixed(2)),
    currency: config.currency,
  };
};

module.exports = { calculateTotals };
