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
const bcrypt = require("bcryptjs");
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

// User login
async function userLogin(name, password) {
  // Get user data (password is required to verify with bcrypt)
  const [check] = await pool.query('SELECT user_id, name, email, role, password FROM users WHERE name = ?', [name])

  if (check.length === 0)
    return null;

  // Set user
  const user = check[0];

  // Verify bcrypt's encrypted password
  const verifyHash = await bcrypt.compare(password, user.password);

  if (!verifyHash)
    return {
      failedAttempt: true,
      affectedId: user.user_id
    };

  // Return public data
  return {
    id: user.user_id,
    email: user.email,
    role: user.role
  };
}

module.exports = { createUser, userLogin };
