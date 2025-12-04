/**
 * CART MODEL
 * Purpose: Manage shopping cart for logged-in users
 * What it does:
 *   - Add or increase quantity of a product
 *   - Get full cart with product details
 *   - Update quantity or remove items
 *   - Clear cart after successful purchase
 * Required by: Cart page, checkout process
 */

const pool = require('../db/conexion');

class Cart {

  // Add product or add more
  static async addProduct(userId, productId, quantity = 1) {
    const conn = await pool.getConnection(); // wait a promise and put in a const call "conn"
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query( // add a product
        `SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );

      if (rows.length > 0) { // put more product
        await conn.query(
          `UPDATE cart SET quantity = quantity + ? 
           WHERE user_id = ? AND product_id = ?`,
          [quantity, userId, productId]
        );
      } else {
        await conn.query( // if the cart doesn´t exist
          `INSERT INTO cart (user_id, product_id, quantity)
           VALUES (?, ?, ?)`,
          [userId, productId, quantity]
        );
      }

      await conn.commit();
      return { message: "Producto agregado al carrito" };

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // get the user cart
static async getUserCart(userId) {
  const [rows] = await pool.query(
    `
    SELECT 
      c.product_id,
      c.quantity,
      COALESCE(p.name, CONCAT('Producto ID ', c.product_id, ' (no disponible)')) AS name,
      COALESCE(p.price, 0) + 0.0 AS price,
      COALESCE(p.discount, 0) AS discount,
      COALESCE(p.is_on_sale, 0) AS is_on_sale,
      COALESCE(p.stock, 0) AS stock,
      -- Precio original
      COALESCE(p.price, 0) + 0.0 AS original_price,
      -- Precio con descuento si aplica
      CASE 
        WHEN COALESCE(p.is_on_sale, 0) = 1 AND COALESCE(p.discount, 0) > 0 
        THEN ROUND(COALESCE(p.price, 0) - (COALESCE(p.price, 0) * COALESCE(p.discount, 0) / 100), 2)
        ELSE COALESCE(p.price, 0)
      END + 0.0 AS final_price,
      -- Subtotal con descuento aplicado
      (c.quantity * 
        CASE 
          WHEN COALESCE(p.is_on_sale, 0) = 1 AND COALESCE(p.discount, 0) > 0 
          THEN ROUND(COALESCE(p.price, 0) - (COALESCE(p.price, 0) * COALESCE(p.discount, 0) / 100), 2)
          ELSE COALESCE(p.price, 0)
        END
      ) + 0.0 AS subtotal
    FROM cart c
    LEFT JOIN products p ON c.product_id = p.product_id
    WHERE c.user_id = ?
    `,
    [userId]
  );

  return rows.map(item => ({
    ...item,
    price: Number(item.final_price), // Usar precio con descuento
    original_price: Number(item.original_price),
    discount: Number(item.discount),
    is_on_sale: Number(item.is_on_sale),
    stock: Number(item.stock),
    subtotal: Number(item.subtotal),
    quantity: Number(item.quantity)
  }));
}

    // Update quantity or delete if quantity = 0
  static async updateQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      const [result] = await pool.query(
        `DELETE FROM cart WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );
      return result;
    }

    const [result] = await pool.query(
      `UPDATE cart 
       SET quantity = ? 
       WHERE user_id = ? AND product_id = ?`,
      [quantity, userId, productId]
    );

    return result;
  }

  // Delete product
  static async removeProduct(userId, productId) {
    const [result] = await pool.query(
      `DELETE FROM cart 
       WHERE user_id = ? AND product_id = ?`,
      [userId, productId]
    );

    return result;
  }

  // Clear all the cart
  static async clearCart(userId) {
    const [result] = await pool.query(
      `DELETE FROM cart WHERE user_id = ?`,
      [userId]
    );

    return result;
  }
}

module.exports = Cart;


