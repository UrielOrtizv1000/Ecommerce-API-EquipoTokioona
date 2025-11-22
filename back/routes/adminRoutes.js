const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middlewares/authMiddleware");

// GET /api/admin/total_sales (admin only)
router.get("/total_sales", verifyToken(true), adminController.getTotalSales);

module.exports = router;
