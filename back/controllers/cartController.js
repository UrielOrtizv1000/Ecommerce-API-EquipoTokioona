/*
Controller for shoping cart
addToCart, getCart, updateQuantity, removeItem

*/

/*
Controller for shoping cart
addToCart, getCart, updateQuantity, removeItem

*/

const Cart = require('../models/Cart');

const cartController = {

  // get the cart
  getCart: async (req, res) => {
    try {
      const userId = req.params.userId; // comes from the URL

      const cart = await Cart.getUserCart(userId);

      res.json({
        success: true,
        cart
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al obtener el carrito' });
    }
  },

  // Add to the cart
addToCart: async (req, res) => {
  try {
    const userId = req.body.userId || req.body.user_id;
    const productId = req.body.productId || req.body.product_id;
    const quantity = req.body.quantity;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos: userId/productId/quantity"
      });
    }

    const result = await Cart.addProduct(userId, productId, quantity);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al agregar producto al carrito' });
  }
},

  // Update the quantity
  updateQuantity: async (req, res) => {
    try {
      const { user_id, product_id, quantity } = req.body;

      await Cart.updateQuantity(user_id, product_id, quantity);

      res.json({
        success: true,
        message: "Cantidad actualizada"
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar cantidad' });
    }
  },

  // Delete product
  removeProduct: async (req, res) => {
    try {
      const { userId, productId } = req.body;

      await Cart.removeProduct(userId, productId);

      res.json({
        success: true,
        message: "Producto eliminado del carrito"
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al eliminar producto' });
    }
  },

  // Clear cart
  clearCart: async (req, res) => {
    try {
      const { userId } = req.body;

      await Cart.clearCart(userId);

      res.json({
        success: true,
        message: "Carrito limpiado"
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al limpiar carrito' });
    }
  }

};

module.exports = cartController;