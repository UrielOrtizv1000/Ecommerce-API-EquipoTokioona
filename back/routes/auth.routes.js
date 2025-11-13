const express = require("express");
const { signup } = require("../controllers/auth.controller");

const router = express.Router();

// POST /api/signup
router.post("/signup", signup);

module.exports = router;