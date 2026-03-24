const bcrypt = require("bcryptjs");

const pool = require("../config/database");

async function createUser(name, email, password) {
  const [existingUsers] = await pool.query(
    "SELECT user_id FROM users WHERE name = ? OR email = ?",
    [name, email]
  );

  if (existingUsers.length > 0) {
    return null;
  }

  const [result] = await pool.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password]
  );

  return result.insertId;
}

async function userLogin(name, password) {
  const [rows] = await pool.query(
    "SELECT user_id, name, email, role, password FROM users WHERE name = ?",
    [name]
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return {
      failedAttempt: true,
      affectedId: user.user_id,
    };
  }

  return {
    id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function getUserByEmail(email) {
  const [rows] = await pool.query(
    "SELECT user_id, name, email FROM users WHERE email = ?",
    [email]
  );

  return rows[0] || null;
}

async function resetPassword(password, userId) {
  const [rows] = await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [
    password,
    userId,
  ]);

  return rows.affectedRows;
}

async function getUserById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id]);
  return rows[0] || null;
}

async function countAll() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM users");
  return rows[0].total;
}

module.exports = {
  createUser,
  userLogin,
  getUserByEmail,
  resetPassword,
  countAll,
  getUserById,
};
