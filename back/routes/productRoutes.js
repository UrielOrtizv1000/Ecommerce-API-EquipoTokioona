// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const verifyToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/roleMiddleware');
const { validateNewProduct } = require('../middlewares/validateMiddleware');

// Protected: only admins can create products
router.post('/', verifyToken, isAdmin, validateNewProduct, productController.createProduct);

module.exports = router;
