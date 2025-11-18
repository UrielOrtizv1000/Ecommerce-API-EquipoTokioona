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