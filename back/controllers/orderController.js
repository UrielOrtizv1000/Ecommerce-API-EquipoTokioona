/*Here you will control the order for clients
Receives: cart, shipping details, payment method, country.
Calculates: subtotal, taxes (by country), shipping (by country), applies coupon.
Generates PDF using generatePDF.js.
Sends email with receipt/note.
Decreases inventory (product.stock -= quantity).

Handles: Order generation, totals, taxes, shipping, PDF, email, inventory.
*/

// src/controllers/orderController.js
const Order = require("../models/Order");
const { calculateTotals } = require("../utils/calculateTotals");
const sendEmail = require("../utils/sendEmail");
const generatePDF = require("../utils/generatePDF");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      shipping_address_id,
      payment_method,
      state,
      shipping_method
    } = req.body;

    // 1. Calculate all totals
    const totals = await calculateTotals(userId, state, shipping_method);

    // 2. Save order in DB
    const order = await Order.create({
      user_id: userId,
      shipping_address_id,
      payment_method,
      totals
    });

    // 3. Generate PDF
    const pdfPath = await generatePDF(order);

    // 4. Send receipt email
    await sendEmail({
      to: req.user.email,
      subject: "Your purchase receipt",
      html: `
        <h1>Thank you for your purchase</h1>
        <p>We have attached your purchase receipt.</p>
      `,
      attachments: [
        {
          filename: "purchase-receipt.pdf",
          path: pdfPath,
          contentType: "application/pdf"
        }
      ]
    });

    res.status(201).json({
      ok: true,
      message: "Purchase registered successfully",
      order_id: order.order_id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error processing purchase"
    });
  }
};

