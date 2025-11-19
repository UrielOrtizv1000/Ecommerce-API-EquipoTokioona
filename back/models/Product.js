/**
 * PRODUCT MODEL
 * Purpose: Complete CRUD and filtering for store products
 * What it does:
 *   - Get all products with filters (category, price range, on sale)
 *   - Get single product by ID
 *   - Create / Update / Delete (admin only)
 *   - Decrease stock when an order is placed
 * Required by: Product catalog, admin panel, order creation
 */

const pool = require('../config/database');

const Product = {
  async create(productData) {
    const sql = `
      INSERT INTO products 
      (name, description, price, stock, image_url, is_on_sale, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      productData.name,
      productData.description,
      productData.price,
      productData.stock,
      productData.image_url || null,
      productData.is_on_sale ?? 0,
      productData.category_id
    ];

    const [result] = await pool.query(sql, params);
    return result.insertId;
  }
};

module.exports = Product;
