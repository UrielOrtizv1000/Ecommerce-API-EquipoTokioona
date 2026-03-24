const express = require("express");

const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/total-sales", verifyToken(true), adminController.getTotalSales);
router.get("/total_sales", verifyToken(true), adminController.getTotalSales);
router.get("/sales/category", verifyToken(true), adminController.getSalesByCategory);
router.get("/sales-by-category", verifyToken(true), adminController.getSalesByCategory);
router.get("/stats", verifyToken(true), adminController.getDashboardStats);
router.get("/sales-page", verifyToken(true), adminController.getSalesPageData);
router.get("/inventory", verifyToken(true), adminController.getInventoryReport);
router.get("/inventory-report", verifyToken(true), adminController.getInventoryData);

module.exports = router;
