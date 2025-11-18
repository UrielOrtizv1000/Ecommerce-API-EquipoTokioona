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

// Get single product by ID
async function getProductById(id) {
  const [res] = await pool.query('SELECT * FROM products WHERE product_id = ?', [id]);
  return res[0];
}

// Get products with filters
async function getProductsByFilter(filterQuery, filterValues) {
  const [list] = await pool.query(filterQuery, filterValues);
  return list;
}

// Create product
async function createProduct(name, desc, price, stock, img_url, onSale, cat_id) {
    const [res] = await pool.query(
        'INSERT INTO products (name, description, price, stock, image_url, is_on_sale, category_id VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, desc, price, stock, img_url, onSale, cat_id]
    );
    return res.insertId;
}
module.exports = { getProductById, getProductsByFilter, createProduct };