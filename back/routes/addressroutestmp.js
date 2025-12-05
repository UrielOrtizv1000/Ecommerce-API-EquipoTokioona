const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/authMiddleware");
const { createAddress } = require("../controllers/addressController");

// POST /api/address
router.post("/", verifyToken(), createAddress);

module.exports = router;
 //cambio