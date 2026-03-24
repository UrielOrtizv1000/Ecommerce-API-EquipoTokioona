const path = require("path");

const pool = require("../config/database");
const { IMAGES_DIR } = require("../config/paths");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { calculateTotals } = require("../utils/calculateTotals");
const generatePDF = require("../utils/generatePDF");
const sendEmail = require("../utils/sendEmail");

const cartController = {
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const items = await Cart.getUserCart(userId);
      const subtotal = items.reduce((total, item) => total + Number(item.subtotal || 0), 0);

      return res.json({
        success: true,
        items,
        subtotal: Number(subtotal.toFixed(2)),
      });
    } catch (error) {
      console.error("Error in getCart:", error);
      return res.status(500).json({ success: false, message: "Error fetching cart." });
    }
  },

  addToCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id: productId, quantity } = req.body;

      if (!productId || !quantity) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: product_id and quantity.",
        });
      }

      await Cart.addProduct(userId, productId, quantity);

      return res.json({ success: true, message: "Product added to cart." });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      return res.status(500).json({ success: false, message: "Error adding product." });
    }
  },

  updateQuantity: async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id: productId, quantity } = req.body;

      if (!productId || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: product_id and quantity.",
        });
      }

      await Cart.updateQuantity(userId, productId, quantity);

      return res.json({ success: true, message: "Quantity updated." });
    } catch (error) {
      console.error("Error updating quantity:", error);
      return res.status(500).json({ success: false, message: "Error updating quantity." });
    }
  },

  removeProduct: async (req, res) => {
    try {
      const userId = req.user.id;
      const { product_id: productId } = req.body;

      await Cart.removeProduct(userId, productId);

      return res.json({ success: true, message: "Product removed from cart." });
    } catch (error) {
      console.error("Error removing product:", error);
      return res.status(500).json({ success: false, message: "Error removing product." });
    }
  },

  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;

      await Cart.clearCart(userId);
      await pool.query("DELETE FROM cart_coupons WHERE user_id = ?", [userId]);

      return res.json({
        success: true,
        message: "Cart cleared successfully.",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      return res.status(500).json({
        success: false,
        message: "Error clearing cart.",
      });
    }
  },

  calculate: async (req, res) => {
    try {
      const userId = req.user.id;
      const { state, shippingMethod } = req.body;

      if (!state) {
        return res.status(400).json({
          success: false,
          message: "Country or state is required.",
        });
      }

      const totals = await calculateTotals(userId, state, shippingMethod || "standard");

      return res.json({ success: true, ...totals });
    } catch (error) {
      console.error("Error calculating totals:", error);
      return res.status(500).json({
        success: false,
        message: "Error calculating totals.",
      });
    }
  },

  checkout: async (req, res) => {
    try {
      const userId = req.user.id;
      const { shipping, payment } = req.body;

      if (!shipping?.state) {
        return res.status(400).json({ success: false, message: "Shipping state is required." });
      }

      if (!shipping?.addressId) {
        return res.status(400).json({ success: false, message: "Shipping address ID is required." });
      }

      if (!payment?.method) {
        return res.status(400).json({ success: false, message: "Payment method is required." });
      }

      const totals = await calculateTotals(userId, shipping.state, shipping.method || "standard");
      const items = totals.items;

      for (const item of items) {
        const [productRows] = await pool.query("SELECT stock FROM products WHERE product_id = ?", [
          item.product_id,
        ]);

        if (productRows[0] && item.quantity > productRows[0].stock) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product: ${item.name}`,
          });
        }
      }

      const orderId = await Order.create({
        userId,
        items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxes: totals.taxes,
        shipping: totals.shippingCost,
        total: totals.total,
        shippingAddressId: shipping.addressId,
        paymentMethod: payment.method,
      });

      for (const item of items) {
        await pool.query("UPDATE products SET stock = stock - ? WHERE product_id = ?", [
          item.quantity,
          item.product_id,
        ]);
      }

      res.json({
        success: true,
        message: "Purchase completed successfully.",
        orderId,
        totalCharged: totals.total,
      });

      void (async () => {
        try {
          const pdfPath = await generatePDF({
            id: orderId,
            customerName: shipping.recipientName,
            items,
            subtotal: totals.subtotal,
            discount: totals.discount,
            tax: totals.taxes,
            shipping: totals.shippingCost,
            total: totals.total,
          });

          await sendEmail({
            to: req.user.email,
            subject: "Thank you for your purchase!",
            html: `
              <h1>Purchase successful</h1>
              <p>Your receipt is attached.</p>
              <img src="cid:tokioona-logo" width="120" />
              <p>Tokioona - <i>"Recordar es volver a jugar"</i></p>
            `,
            attachments: [
              { filename: "receipt.pdf", path: pdfPath },
              {
                filename: "logo_mock.png",
                path: path.join(IMAGES_DIR, "logo_mock.png"),
                cid: "tokioona-logo",
              },
            ],
          });

          await Cart.clearCart(userId);
          await pool.query("DELETE FROM cart_coupons WHERE user_id = ?", [userId]);
        } catch (asyncError) {
          console.error("Post-checkout async error:", asyncError);
        }
      })();
    } catch (error) {
      console.error("Checkout error:", error);
      return res.status(500).json({
        success: false,
        message: "Error processing purchase.",
      });
    }
  },
};

module.exports = cartController;
