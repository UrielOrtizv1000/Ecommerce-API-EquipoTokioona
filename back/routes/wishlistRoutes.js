const express = require('express');
const router = express.Router();

const { getWishlist, addToWishlist, deleteFromWishlist } = require('../controllers/wishlistController');
const { verifyToken } = require('../middlewares/authMiddleware');

// get the cart from an user
router.get('/', verifyToken(), getWishlist);

// add a product to the cart
router.post('/add', verifyToken(), addToWishlist);

// delete a product from the cart
router.delete('/:productId', verifyToken(), deleteFromWishlist);

module.exports = router;