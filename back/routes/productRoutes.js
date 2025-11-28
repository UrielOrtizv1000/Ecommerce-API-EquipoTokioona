const express = require("express");
const router = express.Router();

const productController = require('../controllers/productController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateNewProduct } = require('../middlewares/validateMiddleware');

// GET /api/products/getCategories
router.get("/categories", productController.getCategories);

// GET /api/products/filterBy
router.get("/query", productController.filterProductsBy);

// GET /api/products/getProductById
router.get("/:id", productController.getProductById);

// Protected: only admins 
//ADD (admin)
router.post('/', verifyToken(true), validateNewProduct, productController.createProduct);
//UPDATE (admin)
router.put('/:id', verifyToken(true), productController.updateProduct);
// DELETE (admin)
router.delete('/:id', verifyToken(true), productController.deleteProduct);


module.exports = router;
