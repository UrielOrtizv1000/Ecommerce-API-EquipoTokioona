const wishlist = require('../models/Wishlist');

getWishlist = async (req, res) => {
    const userId = req.user.id; 

    try {
        const cartItems = await wishlist.getAllProducts(userId);
        
        res.status(200).json({
            message: "Products retrieved succesfully.",
            products: cartItems
        });
    } catch (error) {
        console.error("Error retrieving wishlist", error);
        res.status(500).json({ error: 'Internal server error while retrieving.' });
    }
};

addToWishlist = async (req, res) => {
    const userId = req.user.id; 
    const { productId } = req.body;

    try {
        await wishlist.insertProduct(userId, productId);
        res.status(201).json({ message: 'Product added to wishlist successfully.' });
    } catch (error) {
        console.error("Error adding product to wishlist:", error);
        res.status(500).json({ error: 'Internal server error while adding the product to the wishlist.' });
    }   
};

deleteFromWishlist = async (req, res) => {
    const userId = req.user.id; 
    const { productId } = req.params;

    try {
        await wishlist.deleteProduct(userId, productId);
        res.status(200).json({ message: 'Product removed from wishlist successfully.' });
    } catch (error) {
        console.error("Error removing product from wishlist:", error);
        res.status(500).json({ error: 'Internal server error while removing the product from the wishlist.' });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    deleteFromWishlist
};