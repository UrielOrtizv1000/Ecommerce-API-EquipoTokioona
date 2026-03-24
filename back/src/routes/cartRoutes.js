const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const {verifyToken} = require("../middlewares/authMiddleware");

// get the cart from an user
router.get('/', verifyToken(), cartController.getCart);

// add a product to the cart
router.post('/add', verifyToken(), cartController.addToCart);

// update the quantity
router.put('/update', verifyToken(), cartController.updateQuantity);

//Calculates shipping and taxes
router.post("/calculate", verifyToken(), cartController.calculate);

// delete the producto from the cart
router.delete('/remove', verifyToken(), cartController.removeProduct);

// clear the cart
router.delete('/clear', verifyToken(), cartController.clearCart);

// generate an order, PDF and email
router.post("/checkout", verifyToken(), cartController.checkout);

module.exports = router;
