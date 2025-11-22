/**
 * ORDER MODEL
 * Purpose: Create and retrieve purchase orders
 * What it does:
 *   - Create order + all order items in one transaction
 *   - Get all orders of a specific user (for "my orders" page)
 * Required by: Checkout completion, admin sales report
 */

// back/models/Order.js

// back/models/Order.js
// back/models/Order.js
// back/models/Order.js
const pool = require("../db/conexion");

class Order {

    static async create({ userId, items, subtotal, taxes, shippingCost, discountAmount, grandTotal, paymentMethod }) {

        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            // Insertar orden en tabla orders
            const [orderResult] = await conn.query(
                `INSERT INTO orders 
                    (user_id, subtotal, taxes, shipping_cost, coupon_discount, grand_total, payment_method) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, subtotal, taxes, shippingCost, discountAmount, grandTotal, paymentMethod]
            );

            const orderId = orderResult.insertId;

            // Insertar cada item en order_details
            for (let item of items) {
                const unitPrice = Number(item.price);
                const lineSubtotal = unitPrice * item.quantity;

                await conn.query(
                    `INSERT INTO order_details 
                        (order_id, product_id, quantity, unit_price, line_subtotal)
                     VALUES (?, ?, ?, ?, ?)`,
                    [orderId, item.product_id, item.quantity, unitPrice, lineSubtotal]
                );
            }

            await conn.commit();
            return orderId;

        } catch (error) {
            await conn.rollback();
            throw error;

        } finally {
            conn.release();
        }
    }
}

module.exports = Order;
