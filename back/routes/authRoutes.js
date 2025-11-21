const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/authMiddleware");
const { limiter } = require("../middlewares/rateLimiter");
const { signup, login, logout } = require("../controllers/authController");
const { sendResetPassword, resetPassword } = require("../controllers/authController");

// POST /api/auth/signup
router.post("/signup", signup);

// POST /api/auth/login
router.post("/login", limiter, login);

// PROTECTED POST /api/auth/logout
router.post("/logout", verifyToken(), logout);

// POST /api/auth/forgot-password
router.post("/forgot-password", sendResetPassword);

// POST /api/auth/reset-password
router.post("/resetPassword", resetPassword);

module.exports = router;
