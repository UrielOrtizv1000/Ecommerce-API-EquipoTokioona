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

        const subtotal = items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);

        return res.json({
            success: true,
            items,
            subtotal: Number(subtotal.toFixed(2)) 
        });

    } catch (error) {
        console.error("Error en getCart:", error);
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

      // Limpiar productos del carrito
      await Cart.clearCart(userId);

      // Limpiar cupón aplicado (opcional pero recomendado)
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

      // 1. Get cart items
      const items = await Cart.getUserCart(userId);
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty"
        });
      }

      // 2. Calculate subtotal
      const subtotal = items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);

      // 3. Get applied coupon (if any)
      let discountAmount = 0;
      let appliedCoupon = null;
      try {
        const [rows] = await pool.query(
          `SELECT coupon_code, discount_amount FROM cart_coupons WHERE user_id = ? LIMIT 1`,
          [userId]
        );
        if (rows.length > 0) {
          appliedCoupon = rows[0].coupon_code;
          discountAmount = Number(rows[0].discount_amount);
        }
      } catch (err) {
        console.error("Error fetching applied coupon:", err);
      }

      // 4. Shipping info from frontend
      const { state, shippingMethod = "standard" } = req.body;
      if (!state) {
        return res.status(400).json({
          success: false,
          message: "State is required"
        });
      }

      // 5. Shipping cost logic 
      let shippingCost = 129; // Base national shipping

      // Extended Zones 
      const extendedZones = ["baja california sur", "chiapas", "quintana roo", "yucatán"];
      if (extendedZones.includes(state.toLowerCase())) {
        shippingCost = 199;
      }

      if (shippingMethod === "express") {
        shippingCost += 120;
      }

      if (subtotal >= 799) {
        shippingCost = 0; // Free shipping over $799 MXN
      }

      // 6. Mexico VAT 16% (only on taxable amount after discount)
      const taxableAmount = subtotal - discountAmount;
      const taxes = taxableAmount > 0 ? taxableAmount * 0.16 : 0;

      // 7. Final total
      const total = taxableAmount + taxes + shippingCost;

      // 8. Response
      return res.json({
        success: true,
        itemsCount: items.length,
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discountAmount.toFixed(2)),
        appliedCoupon,
        shippingCost,
        freeShipping: shippingCost === 0,
        shippingDetails: {
          state,
          method: shippingMethod
        },
        taxes: Number(taxes.toFixed(2)),
        total: Number(total.toFixed(2))
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
    const { shipping } = req.body;

    const state = shipping?.state;
    if (!state) {
      return res.status(400).json({
        success: false,
        message: "Shipping state is required"
      });
    }

    // 1. Calculate totals with reusable util
    const totals = await calculateTotals(userId, state, "standard");
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
          message: `Insufficient stock for product ID ${item.product_id}`
        });
      }
    }

    // 3. Create order in DB
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

    // 5. Generate PDF & send email
    const pdfPath = await generatePDF({
      id: orderId,
      customerName: shipping?.name || "Customer",
      items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxes: totals.taxes,
      shipping: totals.shippingCost,
      total: totals.total
    });

    await sendEmail({
      to: req.user.email,
      subject: "¡Gracias por tu compra en Tiokioona!",
      html: `<h1>Compra exitosa</h1><p>Adjuntamos tu recibo.</p>`,
      attachments: [{ filename: "recibo.pdf", path: pdfPath }]
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