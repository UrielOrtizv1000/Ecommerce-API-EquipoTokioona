const express = require("express");

const { createAddress } = require("../controllers/addressController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", verifyToken(), createAddress);

module.exports = router;
