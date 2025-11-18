const express = require("express");
const router = express.Router();

const { getProductById, getCategories, filterProductsBy } = require("../controllers/productController");

// GET /api/products/getCategories
router.get("/categories", getCategories);

// GET /api/products/filterBy
router.get("/:query", filterProductsBy);

// GET /api/products/getProductById
router.get("/:id", getProductById);

module.exports = router;