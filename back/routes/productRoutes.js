const express = require("express");
const router = express.Router();
const multer = require("multer"); 
const path = require("path");

const productController = require('../controllers/productController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateNewProduct } = require('../middlewares/validateMiddleware');

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/'); 
    },
    filename: function (req, file, cb) {
        // Unique name: timestamp + extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/", productController.getAllProducts);
router.get("/categories", productController.getCategories);
router.get("/query", productController.filterProductsBy);
router.get("/:id", productController.getProductById);

// --- PRIVATE ROUTES (ADMIN) ---

// Added 'upload.single('image')'. 'image' is the field name in the form-data
router.post('/', verifyToken(true), upload.single('image'), validateNewProduct, productController.createProduct);
router.put('/:id', verifyToken(true), upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken(true), productController.deleteProduct);

module.exports = router;