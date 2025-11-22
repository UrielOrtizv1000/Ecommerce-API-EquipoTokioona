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

    // NEW: Calculate shipping, taxes, and total (with or without coupon)
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

      // 5. Shipping cost logic for Mexico (realistic example)
      let shippingCost = 129; // Base national shipping

      // Zonas extendidas (más caro)
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
      const { shipping, payment } = req.body;

      // Reuse the same calculation logic as /calculate
      const items = await Cart.getUserCart(userId);
      if (items.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
      }

      const subtotal = items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0);

      // Get applied coupon
let discountAmount = 0;
try {
    const [rows] = await pool.query(
        `SELECT coupon_code, discount_amount 
         FROM cart_coupons 
         WHERE user_id = ? LIMIT 1`,
        [userId]
    );

    if (rows.length > 0) {
        discountAmount = Number(rows[0].discount_amount);
    }
} catch (err) { 
    console.error("Error reading applied coupon:", err); 
}


      const taxableAmount = subtotal - discountAmount;
      const taxes = taxableAmount * 0.16;

      // Shipping (reuse same logic - you can extract to utils later)
      let shippingCost = subtotal >= 799 ? 0 : 129;
      const state = shipping?.state?.toLowerCase() || "";
      const extendedZones = ["baja california sur", "chiapas", "quintana roo", "yucatán"];
      if (extendedZones.includes(state) && subtotal < 799) shippingCost = 199;

      const total = taxableAmount + taxes + shippingCost;

      // Check stock
      for (let item of items) {
        if (item.quantity > item.stock) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for: ${item.name}`
          });
        }
      }
  
  const orderId = await Order.create({
    userId,
    items,
    subtotal,
    taxes,
    shippingCost,
    discountAmount,
    grandTotal: total,
    paymentMethod: payment.method
});


      // Reduce stock
      for (let item of items) {
        await pool.query(
          "UPDATE products SET stock = stock - ? WHERE product_id = ?",
          [item.quantity, item.product_id]
        );
      }

      // Generate PDF & send email
      const pdfPath = await generatePDF({
        id: orderId,
        customerName: shipping?.name || "Customer",
        items,
        subtotal,
        discount: discountAmount,
        taxes,
        shipping: shippingCost,
        total
      });

      await sendEmail({
        to: req.user.email,
        subject: "¡Gracias por tu compra en Tiokioona! 🎉",
        html: `<h1>¡Compra exitosa!</h1><p>Adjuntamos tu recibo digital.</p>`,
        attachments: [{ filename: "recibo_tiokioona.pdf", path: pdfPath }]
      });

      // Clear cart and coupon
      await Cart.clearCart(userId);
      // this line send an error because user_id doesn´t exist in db table coupons
     // await pool.query(`DELETE FROM coupons WHERE user_id = ?`, [userId]);

      return res.json({
        success: true,
        message: "Purchase completed successfully",
        orderId,
        totalCharged: Number(total.toFixed(2))
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