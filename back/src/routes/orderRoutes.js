const express = require("express");
const router = express.Router();
const {createOrder} = require("../controllers/orderController");
const {verifyToken} = require("../middlewares/authMiddleware");

router.post("/", verifyToken(), createOrder);


module.exports = router;