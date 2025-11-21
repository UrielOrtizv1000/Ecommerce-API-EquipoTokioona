/*
Controller for shoping cart
addToCart, getCart, updateQuantity, removeItem

*/

/*
Controller for shoping cart
addToCart, getCart, updateQuantity, removeItem

*/

const Cart = require('../models/Cart');
const Order = require("../models/Order");
const generatePDF = require("../utils/generatePDF");
const sendEmail = require("../utils/sendEmail");
const pool = require("../db/conexion");

const cartController = {

  // get the cart
  getCart: async (req, res) => {
        try {
            const userId = req.user.id; 

            const items = await Cart.getUserCart(userId);

            let subtotal = 0;
            items.forEach(item => {
                subtotal += item.subtotal;
            });

            return res.json({
                success: true,
                items,
                subtotal
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Error al obtener el carrito" });
        }
    },

  // Add to the cart
addToCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const { product_id, quantity } = req.body;

            if (!product_id || !quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan campos: product_id o quantity"
                });
            }

            await Cart.addProduct(userId, product_id, quantity);

            res.json({
                success: true,
                message: "Producto agregado al carrito"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Error al agregar producto" });
        }
    },

  // Update the quantity
  updateQuantity: async (req, res) => {
        try {
            const userId = req.user.id;
            const { product_id, quantity } = req.body;

            if (!product_id || quantity === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Faltan datos: product_id o quantity"
                });
            }

            await Cart.updateQuantity(userId, product_id, quantity);

            res.json({
                success: true,
                message: "Cantidad actualizada"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Error al actualizar cantidad" });
        }
    },

  // Delete product
  removeProduct: async (req, res) => {
        try {
            const userId = req.user.id;
            const { product_id } = req.body;

            await Cart.removeProduct(userId, product_id);

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
            const userId = req.user.id;

            await Cart.clearCart(userId);

            res.json({
                success: true,
                message: "Carrito limpiado"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error al limpiar carrito' });
        }
    },


  checkout: async (req, res) => {
        try {
            const userId = req.user.id;
            const { shipping, payment } = req.body;

            // 1. get cart
            const cart = await Cart.getUserCart(userId);

            if (cart.length === 0) {
                return res.status(400).json({ success: false, message: "Carrito vacío" });
            }

            // 2. confirm stock
            for (let item of cart) {
                if (item.quantity > item.stock) {
                    return res.status(400).json({
                        success: false,
                        message: `Stock insuficiente para: ${item.name}`
                    });
                }
            }

            // 3. put the total
            let subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
            const tax = subtotal * 0.10;
            const shippingCost = 150;  
            const total = subtotal + tax + shippingCost;

            // 4. get the order
            const orderId = await Order.create({
                userId,
                items: cart,
                subtotal,
                tax,
                shipping: shippingCost,
                total
            });

            // 5. less inventary
            for (let item of cart) {
                await pool.query(
                    "UPDATE products SET stock = stock - ? WHERE product_id = ?",
                    [item.quantity, item.product_id]
                );
            }

            // 6. Generate PDF
            const pdfPath = await generatePDF({
                id: orderId,
                customerName: shipping?.name || "Usuario",
                items: cart,
                subtotal,
                tax,
                shipping: shippingCost,
                total
            });

            // 7. send the email
            await sendEmail({
                to: req.user.email,
                subject: "Tu nota de compra",
                html: `
                    <h1>¡Gracias por tu compra!</h1>
                    <p>Adjuntamos tu nota de compra.</p>
                `,
                attachments: [
                    {
                        filename: "nota_compra.pdf",
                        path: pdfPath
                    }
                ]
            });

            // 8. clean the cart
            await Cart.clearCart(userId);

            res.json({ success: true, message: "Compra realizada", orderId });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Error al procesar la compra" });
        }
    }


};

module.exports = cartController;