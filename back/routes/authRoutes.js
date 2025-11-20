const express = require("express");
const router = express.Router();

const { signup } = require("../controllers/authController");

const { sendResetPassword } = require("../controllers/authController");

// POST /api/signup
router.post("/signup", signup);

// POST /api/forgot-password
router.post("/forgot-password", sendResetPassword);

module.exports = router;