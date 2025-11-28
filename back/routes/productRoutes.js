const express = require("express");
const router = express.Router();

const productController = require('../controllers/productController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateNewProduct } = require('../middlewares/validateMiddleware');

// GET /api/products - Obtener todos los productos
router.get("/", productController.getAllProducts);

// GET /api/products/categories
router.get("/categories", productController.getCategories);

// GET /api/products/query - Filtrar productos
router.get("/query", productController.filterProductsBy);

// GET /api/products/:id - Obtener producto por ID
router.get("/:id", productController.getProductById);

// Protected: only admins 
// POST /api/products (admin)
router.post('/', verifyToken(true), validateNewProduct, productController.createProduct);
// PUT /api/products/:id (admin)
router.put('/:id', verifyToken(true), productController.updateProduct);
// DELETE /api/products/:id (admin)
router.delete('/:id', verifyToken(true), productController.deleteProduct);

module.exports = router;
