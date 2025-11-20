//here we can use pdfkit to generate a ticket

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generatePDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const pdfPath = path.join(__dirname, `../tmp/nota_${order.id}.pdf`);

            // Crear carpet tmp if not exist
            if (!fs.existsSync(path.join(__dirname, "../tmp"))) {
                fs.mkdirSync(path.join(__dirname, "../tmp"));
            }

            const doc = new PDFDocument();
            const stream = fs.createWriteStream(pdfPath);
            doc.pipe(stream);

            // HEADER
            doc.fontSize(20).text("Mi Tienda", { align: "center" });
            doc.fontSize(12).text("Lema: Lo mejor para ti", { align: "center" });
            doc.moveDown();

            // INFO CLIENT
            doc.fontSize(14).text("Nota de compra", { underline: true });
            doc.text(`Fecha: ${new Date().toLocaleString()}`);
            doc.text(`Cliente: ${order.customerName || "Cliente registrado"}`);
            doc.moveDown();

            // PRODUCTS
            doc.fontSize(14).text("Productos:");
            order.items.forEach(item => {
                doc.fontSize(12).text(
                    `${item.quantity} x ${item.name}  -  $${item.price * item.quantity}`
                );
            });

            doc.moveDown();

            // TOTAL
            doc.fontSize(14).text("Resumen:");
            doc.fontSize(12).text(`Subtotal: $${order.subtotal}`);
            doc.text(`Impuestos: $${order.tax}`);
            doc.text(`Envío: $${order.shipping}`);
            doc.text(`Total: $${order.total}`);

            doc.end();

            stream.on("finish", () => resolve(pdfPath));
            stream.on("error", reject);

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = generatePDF;
