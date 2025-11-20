const express = require("express");
const router = express.Router();

const productController = require('../controllers/productController');
const verifyToken = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/roleMiddleware');
const { validateNewProduct } = require('../middlewares/validateMiddleware');

// GET /api/products/getCategories
router.get("/categories", productController.getCategories);

// GET /api/products/filterBy
router.get("/:query", productController.filterProductsBy);

// GET /api/products/getProductById
router.get("/:id", productController.getProductById);

// Protected: only admins can create products
router.post('/', verifyToken, isAdmin, validateNewProduct, productController.createProduct);

module.exports = router;
