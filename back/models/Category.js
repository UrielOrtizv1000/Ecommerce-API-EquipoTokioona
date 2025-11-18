/**
 * CATEGORY MODEL
 * Purpose: Manage the 3 main categories of your store (e.g., Rings, Necklaces, Bracelets)
 * What it does:
 *   - Return all categories (used in filters and admin panel)
 *   - Create new category if needed (optional, but good practice)
 * Required by: Product filters, admin product form
 */
const pool = require("../db/conexion");

// Return all categories
async function getCategories() {
  const [rows] = await pool.query('SELECT * FROM categories');
  return rows;
}

async function createCategory(cat_name) {
  const [res] = await pool.query(
    'INSERT INTO categories (category_name) VALUES (?)',
    [cat_name]
  );
  return res.insertId;
}

module.exports = { getCategories, createCategory };