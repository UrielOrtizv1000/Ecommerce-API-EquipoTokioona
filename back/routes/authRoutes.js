const express = require("express");
const router = express.Router();

const { signup } = require("../controllers/authController");

// POST /api/signup
router.post("/signup", signup);

module.exports = router;