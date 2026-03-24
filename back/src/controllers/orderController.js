const Order = require("../models/Order");
const { calculateTotals } = require("../utils/calculateTotals");
const generatePDF = require("../utils/generatePDF");
const sendEmail = require("../utils/sendEmail");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shipping_address_id: shippingAddressId,
      payment_method: paymentMethod,
      state,
      shipping_method: shippingMethod,
    } = req.body;

    const totals = await calculateTotals(userId, state, shippingMethod);
    const orderId = await Order.create({
      userId,
      items: totals.items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxes: totals.taxes,
      shipping: totals.shippingCost,
      total: totals.total,
      shippingAddressId,
      paymentMethod,
    });

    const pdfPath = await generatePDF({
      id: orderId,
      customerName: req.user.email,
      items: totals.items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.taxes,
      shipping: totals.shippingCost,
      total: totals.total,
    });

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
          type: "application/pdf",
        },
      ],
    });

    return res.status(201).json({
      ok: true,
      message: "Purchase registered successfully.",
      order_id: orderId,
    });
  } catch (error) {
    console.error("Error processing order:", error);
    return res.status(500).json({
      ok: false,
      message: "Error processing purchase.",
    });
  }
};
