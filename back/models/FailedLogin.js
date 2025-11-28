/**
 * FAILED LOGIN MODEL
 * Purpose: Implement security rule "block account after 3 failed attempts for 5 minutes"
 * What it does:
 *   - Increment failed attempt counter
 *   - Get current attempts and last attempt time
 *   - Clear counter on successful login
 * Required by: Login controller (rate limiting)
 */
const pool = require("../db/conexion");

async function iterateFailedAttempt(user_id) {
  // Iterate failed attempts
  const [fail] = await pool.query('UPDATE users SET failed_attempts = failed_attempts + 1 WHERE user_id = ?', [user_id]);
  return fail.affectedRows;
}

// Get current failed attempts value
async function getCurrentAttempts(user_id) {
  const [currAtt] = await pool.query('SELECT failed_attempts FROM users WHERE user_id = ?', [user_id]);
  return currAtt[0].failed_attempts;
}

// Get last attempt timestamp
async function getLastAttemptTimestamp(user_id) {
  const [currTime] = await pool.query('SELECT lockout_date FROM users WHERE user_id = ?', [user_id]) 
  return currTime[0].lockout_date;
}

// Set lockout
async function setLockout(user_id) {
  const [lock] = await pool.query('UPDATE users SET lockout_date = CURRENT_TIMESTAMP WHERE user_id = ?', [user_id]);
  return lock.affectedRows;
}

// Remove failed attempts
async function resetAttempts(user_id) {
  const [remFail] = await pool.query('UPDATE users SET failed_attempts = 0 WHERE user_id = ?', [user_id]);
  return remFail.affectedRows;
}

// Remove lockout, if any
async function removeLockout(user_id) {
  const [unlock] = await pool.query('UPDATE users SET lockout_date = NULL WHERE user_id = ?', [user_id]);
  return unlock.affectedRows;
}

module.exports = {
  iterateFailedAttempt,
  getCurrentAttempts,
  getLastAttemptTimestamp,
  setLockout,
  resetAttempts,
  removeLockout
}