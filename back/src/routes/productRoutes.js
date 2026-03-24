const express = require("express");

const upload = require("../config/uploads");
const productController = require("../controllers/productController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { validateNewProduct } = require("../middlewares/validateMiddleware");

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/categories", productController.getCategories);
router.get("/query", productController.filterProductsBy);
router.get("/:id", productController.getProductById);

router.post("/", verifyToken(true), upload.single("image"), validateNewProduct, productController.createProduct);
router.put("/:id", verifyToken(true), upload.single("image"), productController.updateProduct);
router.delete("/:id", verifyToken(true), productController.deleteProduct);

module.exports = router;
