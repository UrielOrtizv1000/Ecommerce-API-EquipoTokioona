const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middlewares/authMiddleware");
const couponController = require("../controllers/couponController");

// Protected: apply coupon
// POST /api/coupons/apply
router.post("/apply", verifyToken(), couponController.applyCoupon);

// Protected: remove coupon (optional)
// POST /api/coupons/remove
router.post("/remove", verifyToken(), couponController.removeCoupon);

module.exports = router;
