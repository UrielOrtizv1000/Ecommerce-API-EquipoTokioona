const express = require("express");
const router = express.Router();
const {createOrder} = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware(), createOrder);

module.exports = router;