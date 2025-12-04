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
const pool = require("../db/conexion");

const Product = {
  // CREATE PRODUCT
  async create(productData) {
    const sql = `
      INSERT INTO products 
      (name, description, price, stock, image_url, is_on_sale, category_id, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      productData.name,
      productData.description,
      productData.price,
      productData.stock,
      productData.image_url || null,
      productData.is_on_sale ?? 0,
      productData.category_id,
      productData.tags || null 
    ];

    const [result] = await pool.query(sql, params);
    return result.insertId;
  },

  // UPDATE PRODUCT
  async update(product_id, productData) {
    const sql = `
      UPDATE products
      SET 
        name = ?, 
        description = ?, 
        price = ?, 
        stock = ?, 
        image_url = ?, 
        is_on_sale = ?, 
        category_id = ?,
        tags = ?
      WHERE product_id = ?
    `;

    const params = [
      productData.name,
      productData.description,
      productData.price,
      productData.stock,
      productData.image_url || null,
      productData.is_on_sale ?? 0,
      productData.category_id,
      productData.tags || null,
      product_id
    ];

    const [result] = await pool.query(sql, params);
    return result.affectedRows;
  },
  
  // Get single product by ID
  async getProductById(id) {
    const [res] = await pool.query(
      `SELECT 
        p.*,
        c.category_name,
        CASE 
          WHEN p.is_on_sale = 1 AND p.discount > 0 
          THEN ROUND(p.price - (p.price * p.discount / 100), 2)
          ELSE p.price 
        END as final_price
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      WHERE p.product_id = ?`, 
      [id]
    );
    return res[0];
  },
  
  // Get products with filters
  async getProductsByFilter(filterQuery, filterValues) {
    // Modifica la query para incluir precio final
    const baseQuery = filterQuery.replace(
      "SELECT * FROM products",
      `SELECT 
        p.*,
        CASE 
          WHEN p.is_on_sale = 1 AND p.discount > 0 
          THEN ROUND(p.price - (p.price * p.discount / 100), 2)
          ELSE p.price 
        END as final_price
      FROM products p`
    );
    const [list] = await pool.query(baseQuery, filterValues);
    return list;
  },
  
  // DELETE PRODUCT
  async delete(product_id) {
    const sql = `DELETE FROM products WHERE product_id = ?`;
    const [result] = await pool.query(sql, [product_id]);
    return result.affectedRows; 
  },

  async getInventoryByCategory() {
    const [rows] = await pool.query(`
      SELECT 
          c.category_name,
          p.product_id,
          p.name,
          p.stock
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      ORDER BY c.category_name, p.name
    `);

    return rows;
  },

  async countActive() {
      const [rows] = await pool.query("SELECT COUNT(*) as total FROM products WHERE stock > 0");
      return rows[0].total;
  },

async getInventoryReport() {
    const [rows] = await pool.query(`
      SELECT 
        p.product_id,
        p.name,
        p.stock,
        c.category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.stock ASC
    `);
    return rows;
  },

  async getAllProducts() {
    const [rows] = await pool.query(`
      SELECT 
        p.product_id,
        p.name,
        p.description,
        p.price,
        p.discount,
        p.stock,
        p.image_url,
        p.is_on_sale,
        p.category_id,          
        p.tags,
        c.category_name,
        CASE 
          WHEN p.is_on_sale = 1 AND p.discount > 0 
          THEN ROUND(p.price - (p.price * p.discount / 100), 2)
          ELSE p.price 
        END as final_price
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      ORDER BY p.product_id DESC
    `);
    return rows;
  }
};

module.exports = Product;