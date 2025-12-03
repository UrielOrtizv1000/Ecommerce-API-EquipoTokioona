/**
 * ORDER MODEL
 * Purpose: Create and retrieve purchase orders
 * What it does:
 *   - Create order + all order items in one transaction
 *   - Get all orders of a specific user (for "my orders" page)
 * Required by: Checkout completion, admin sales report
 */

const pool = require("../db/conexion");

const Order = {

  /**
   * Creates an order with all items inside a SQL transaction.
   * Receives: userId, items[], subtotal, discount, taxes, shipping, total, shippingAddressId
   */
  async create({ 
    userId, 
    items, 
    subtotal, 
    discount, 
    taxes, 
    shipping, 
    total,
    shippingAddressId 
  }) {

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Insert order WITH shipping_address_id
      const [orderRes] = await conn.query(
        `INSERT INTO orders 
          (user_id, subtotal, taxes, shipping_cost, coupon_discount, grand_total, payment_method, shipping_address_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          subtotal,
          taxes,
          shipping,
          discount,
          total,
          "card",               // default payment method
          shippingAddressId     // NEW FIELD
        ]
      );

      const orderId = orderRes.insertId;

      // Insert order items
      for (const item of items) {
        await conn.query(
          `INSERT INTO order_details 
            (order_id, product_id, quantity, unit_price, line_subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.quantity,
            item.price,
            item.subtotal
          ]
        );
      }

      await conn.commit();
      return orderId;

    } catch (err) {
      await conn.rollback();
      console.error("Error creating order:", err);
      throw err;
    } finally {
      conn.release();
    }
  },

  // Used by admin total_sales endpoint
  async getTotalSales() {
    const [rows] = await pool.query(
      `SELECT SUM(grand_total) AS total_sales FROM orders`
    );
    return rows[0].total_sales || 0;
  },

  /**
   * Returns total sales grouped by product category.
   * Used by admin dashboard chart.
   */
  async getSalesByCategory() {
    const [rows] = await pool.query(`
      SELECT 
          c.category_name,            
          SUM(od.line_subtotal) AS total_sales
      FROM order_details od
      JOIN products p ON od.product_id = p.product_id
      JOIN categories c ON p.category_id = c.category_id
      JOIN orders o ON od.order_id = o.order_id
      GROUP BY c.category_name
      ORDER BY total_sales DESC
    `);

    return rows;
  }

};

module.exports = Order;
