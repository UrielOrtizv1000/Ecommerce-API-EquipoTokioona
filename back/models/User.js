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
  const [res] = await pool.query('INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)', [name, email, password]);
  return res.insertId;
}

module.exports = { createUser };