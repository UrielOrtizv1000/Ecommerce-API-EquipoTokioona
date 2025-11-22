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
      category_id = ?
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
    product_id
  ];

  const [result] = await pool.query(sql, params);
  return result.affectedRows;
  },
  
  // Get single product by ID
  async getProductById(id) {
    const [res] = await pool.query('SELECT * FROM products WHERE product_id = ?', [id]);
    return res[0];
  },
  
  // Get products with filters
  async getProductsByFilter(filterQuery, filterValues) {
    const [list] = await pool.query(filterQuery, filterValues);
    return list;
  },
  
  // DELETE PRODUCT
async delete(product_id) {
  const sql = `DELETE FROM products WHERE product_id = ?`;
  const [result] = await pool.query(sql, [product_id]);
  return result.affectedRows; // 1 si borró, 0 si no existía
 }
};



module.exports = Product;
