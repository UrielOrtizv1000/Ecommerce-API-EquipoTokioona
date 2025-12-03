const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/total_sales", verifyToken(true), adminController.getTotalSales);
router.get("/sales/category", verifyToken(true), adminController.getSalesByCategory);
router.get("/inventory",verifyToken(true),adminController.getInventoryReport);
router.get("/stats", verifyToken(true), adminController.getDashboardStats);
router.get("/sales-page", verifyToken(true), adminController.getSalesPageData);
router.get("/inventory", verifyToken(true), adminController.getInventoryData);

module.exports = router;

