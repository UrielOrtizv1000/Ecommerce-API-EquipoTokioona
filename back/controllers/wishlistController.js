const wishlist = require('../models/wishlist');

getWishlist = async (req, res) => {
    const userId = req.user.id; 

    try {
        const cartItems = await wishlist.getAllProducts(userId);
        
        res.status(200).json({
            message: "Productos obtenidos exitosamente.",
            products: cartItems
        });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ error: 'Error interno del servidor al recuperar el carrito.' });
    }
};

addToWishlist = async (req, res) => {
    const userId = req.user.id; 
    const { productId } = req.body;

    try {
        await wishlist.addProduct(userId, productId);
        res.status(201).json({ message: 'Producto agregado al carrito exitosamente.' });
    } catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        res.status(500).json({ error: 'Error interno del servidor al agregar el producto al carrito.' });
    }   
};

deleteFromWishlist = async (req, res) => {
    const userId = req.user.id; 
    const { productId } = req.params;

    try {
        await wishlist.removeProduct(userId, productId);
        res.status(200).json({ message: 'Producto eliminado del carrito exitosamente.' });
    } catch (error) {
        console.error("Error al eliminar producto del carrito:", error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el producto del carrito.' });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    deleteFromWishlist
};