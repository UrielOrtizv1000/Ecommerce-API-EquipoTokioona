/*
Controller for shopping cart
addToCart, getCart, updateQuantity, removeItem
*/

const Cart = require('../models/Cart');
const Order = require("../models/Order");
const generatePDF = require("../utils/generatePDF");
const sendEmail = require("../utils/sendEmail");
const pool = require("../db/conexion");
const { calculateTotals } = require("../utils/calculateTotals");


const cartController = {

  // get the cart
getCart: async (req, res) => {
    try {
        const userId = req.user.id; 

        const items = await Cart.getUserCart(userId);

        const subtotal = items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);

        return res.json({
            success: true,
            items,
            subtotal: Number(subtotal.toFixed(2)) 
        });

    } catch (error) {
        console.error("Error en getCart:", error);
        res.status(500).json({ success: false, message: "Error fetching cart" });
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
                    message: "Missing fields: product_id or quantity"
                });
            }

            await Cart.addProduct(userId, product_id, quantity);

            res.json({
                success: true,
                message: "Product added to cart"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Error adding product" });
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
                    message: "Missing data: product_id or quantity"
                });
            }

            await Cart.updateQuantity(userId, product_id, quantity);

            res.json({
                success: true,
                message: "Quantity updated"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Error updating quantity" });
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
                message: "Product removed from cart"
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error removing product' });
        }
    },

  // Clear cart
clearCart: async (req, res) => {
    try {
      const userId = req.user.id;

      // Clean cart items
      await Cart.clearCart(userId);

      // Remove applied coupon
      await pool.query("DELETE FROM cart_coupons WHERE user_id = ?", [userId]);

      return res.json({
        success: true,
        message: "Cart cleared successfully"
      });

    } catch (error) {
      console.error("Error clearing cart:", error);
      return res.status(500).json({
        success: false,
        message: "Error clearing cart"
      });
    }
  },

    //  Calculate shipping, taxes, and total (with or without coupon)
calculate: async (req, res) => {
    try {
      const userId = req.user.id;
      const { state, shippingMethod } = req.body;

      if (!state) {
        return res.status(400).json({
          success: false,
          message: "Country/State is required"
        });
      }

      const totals = await calculateTotals(userId, state, shippingMethod || "standard");

      return res.json({
        success: true,
        ...totals
      });

    } catch (error) {
      console.error("Error in calculate:", error);
      return res.status(500).json({
        success: false,
        message: "Error calculating totals"
      });
    }
  },

checkout: async (req, res) => {
    try {
      const userId = req.user.id;
      const { shipping, payment } = req.body;

      if (!shipping?.state) {
        return res.status(400).json({
          success: false,
          message: "Shipping state is required"
        });
      }

      if (!payment?.method) {
        return res.status(400).json({
          success: false,
          message: "Payment method is required"
        });
      }

      // 1. Calculate totals with util
      const totals = await calculateTotals(
        userId,
        shipping.state,
        shipping.method || "standard"
      );

      const items = totals.items;

      // 2. Validate stock
      for (const item of items) {
        const [product] = await pool.query(
          "SELECT stock FROM products WHERE product_id = ?",
          [item.product_id]
        );
        if (item.quantity > product[0].stock) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product: ${item.name}`
          });
        }
      }

      // 3. Create order
      const orderId = await Order.create({
        userId,
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxes: totals.taxes,
        shipping: totals.shippingCost,
        total: totals.total
      });

      // 4. Reduce stock
      for (const item of items) {
        await pool.query(
          "UPDATE products SET stock = stock - ? WHERE product_id = ?",
          [item.quantity, item.product_id]
        );
      }

      // 5. Generate PDF & email
      const pdfPath = await generatePDF({
        id: orderId,
        customerName: shipping?.name,
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.taxes,
        shipping: totals.shippingCost,
        total: totals.total
      });

    await sendEmail({
      to: req.user.email,
      subject: "Thank you for your purchase!",
      html: `<h1>Purchase successful</h1><p>Your receipt is attached.</p> 
      <a href="https://ibb.co/HpLMB8FL"><img src="https://i.ibb.co/TqDnY3vD/logo-mock.png" alt="logo-mock" border="0" width="120"/></a>
      <p>Tokioona — <i>"Recordar es volver a jugar"</i></p>`,
      attachments: [{ filename: "receipt.pdf", path: pdfPath }]
    });

    // 6. Clear cart and coupon
    await Cart.clearCart(userId);
    await pool.query("DELETE FROM cart_coupons WHERE user_id = ?", [userId]);

    return res.json({
      success: true,
      message: "Purchase completed successfully",
      orderId,
      totalCharged: totals.total
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing purchase"
    });
  }
 }
};

module.exports = cartController;
