const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/authMiddleware");
const { limiter } = require("../middlewares/rateLimiter");
const { signup, login, logout } = require("../controllers/authController");

// POST /api/users/signup
router.post("/signup", signup);

// POST /api/users/login
router.post("/login", limiter, login);

// PROTECTED POST /api/users/logout
router.post("/logout", verifyToken(), logout);

module.exports = router;
