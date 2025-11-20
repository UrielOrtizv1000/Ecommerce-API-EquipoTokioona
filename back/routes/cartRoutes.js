const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// get the cart from an user
router.get('/:userId', cartController.getCart);

// add a product to the cart
router.post('/add', cartController.addToCart);

// update the quantity
router.put('/update', cartController.updateQuantity);

// delete the producto from the cart
router.delete('/remove', cartController.removeProduct);

// clear the cart
router.delete('/clear', cartController.clearCart);

module.exports = router;