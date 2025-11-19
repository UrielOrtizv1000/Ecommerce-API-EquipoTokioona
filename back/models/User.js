/**
 * USER MODEL
 * Purpose: Handles everything related to registered users (customers and admin)
 * What it does:
 *   - Find user by email or ID
 *   - Create new user during registration
 *   - Update password (for "forgot password" feature)
 *   - Never returns the hashed password in queries
 * Required by: Auth controller, login, register, forgot-password
 */
const pool = require("../db/conexion");

// Insert new user into database (Sign-up)
async function createUser(name, email, password) {
  // Check if username/email already exists
  const [check] = await pool.query('SELECT user_id FROM users WHERE name = ? OR email = ?', [name, email]);
  if (check.length > 0)
    return null;

  // Insert user entry
  const [res] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
  return res.insertId;
}

module.exports = { createUser };