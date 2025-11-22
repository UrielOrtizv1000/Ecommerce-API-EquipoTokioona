/**
 * ORDER MODEL
 * Purpose: Create and retrieve purchase orders
 * What it does:
 *   - Create order + all order items in one transaction
 *   - Get all orders of a specific user (for "my orders" page)
 * Required by: Checkout completion, admin sales report
 */

// back/models/Order.js
// src/models/Order.js
const pool = require("../db/conexion");

const Order = {

  // Create full order with transaction
  async create({ user_id, shipping_address_id, payment_method, totals }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert into orders
      const [orderRes] = await connection.query(
        `INSERT INTO orders 
          (user_id, shipping_address_id, subtotal, taxes, shipping_cost, 
           coupon_discount, grand_total, payment_method)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          shipping_address_id,
          totals.subtotal,
          totals.taxes,
          totals.shippingCost,
          totals.discount,
          totals.total,
          payment_method
        ]
      );

      const orderId = orderRes.insertId;

      // Insert every cart item into order_details
      for (const item of totals.items) {
        await connection.query(
          `INSERT INTO order_details (order_id, product_id, quantity, unit_price, line_subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.quantity,
            item.price,
            item.subtotal
          ]
        );

        // Update inventory for each product
        await connection.query(
          `UPDATE products SET stock = stock - ? WHERE product_id = ?`,
          [item.quantity, item.product_id]
        );
      }

      // Clear user's cart
      await connection.query(
        `DELETE FROM cart WHERE user_id = ?`,
        [user_id]
      );

      // Clear coupon
      await connection.query(
        `DELETE FROM cart_coupons WHERE user_id = ?`,
        [user_id]
      );

      await connection.commit();

      return { order_id: orderId, ...totals };

    } catch (error) {
      await connection.rollback();
      console.error("Order creation error:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // Sales totals for admin dashboard
  async getTotalSales() {
    const [rows] = await pool.query(
      `SELECT SUM(grand_total) AS total_sales FROM orders`
    );
    return rows[0].total_sales || 0;
  }

};

module.exports = Order;
