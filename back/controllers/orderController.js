/*Here you will controll the order for clients
Receives: cart, shipping details, payment method, country.
Calculates: subtotal, taxes (by country), shipping (by country), applies coupon.
Generates PDF using generatePDF.js.
Sends email with receipt/note.
Decreases inventory (product.stock -= quantity).

Handles: Order generation, totals, taxes, shipping, PDF, email, inventory.
*/

const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");
const generatePDF = require("../utils/generatePDF");

exports.createOrder = async (req, res) =>{
    try{
        const orderData = req.body;

        // save on DB
        const order = await Order.create(orderData);

        // generate the pdf
        const pdfPath = await generatePDF(order);

        // Send an email
        await sendEmail({
           to: req.user.email,
            subject: "Tu nota de compra",
            html: `
                <h1>Gracias por tu compra</h1>
                <p>Adjuntamos tu nota de compra.</p>
            `,
            attachments: [
                {
                    filename: "nota-compra.pdf",
                    path: pdfPath,
                    contentType: "application/pdf"
                }
            ] 
        });
        res.json({message: "Compra registrada"});
    }catch(error){
      console.error(error);
      res.status(500).json({ message: "Error al procesar compra" });  
    }
};