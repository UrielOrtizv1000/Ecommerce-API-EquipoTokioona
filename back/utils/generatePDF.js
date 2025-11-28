// utils/generatePDF.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generatePDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const pdfPath = path.join(__dirname, `../tmp/nota_${order.id}.pdf`);

            // Create file if no exists
            const tmpDir = path.join(__dirname, "../tmp");
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir);
            }

            const doc = new PDFDocument({ margin: 40 });
            const stream = fs.createWriteStream(pdfPath);
            doc.pipe(stream);

            // HEADER
            doc.fontSize(22).text("Tokioona", { align: "center" });
            doc.fontSize(12).text("Recordar es volver a jugar", { align: "center" });
            doc.moveDown();

            // CUSTOMER INFO
            doc.fontSize(16).text("Purchase Receipt", { underline: true });
            doc.fontSize(12).text(`Date: ${new Date().toLocaleString()}`);
            doc.text(`Cliente: ${order.customerName || "Registered Customer"}`);
            doc.moveDown();

            // PRODUCT
            doc.fontSize(14).text("Products:");
            doc.moveDown(0.5);

            order.items.forEach(item => {
                const name = item.name || "Unnamed product";
                const price = Number(item.price || 0);
                const qty = Number(item.quantity || 0);

                doc.fontSize(12).text(
                    `${qty} x ${name} - $${(price * qty).toFixed(2)}`
                );
            });

            doc.moveDown();

            // TOTAL
            doc.fontSize(14).text("Summary:");
            doc.fontSize(12).text(`Subtotal: $${Number(order.subtotal || 0).toFixed(2)}`);
            doc.text(`Discount: $${Number(order.discount || 0).toFixed(2)}`);
            doc.text(`Taxes: $${Number(order.tax || 0).toFixed(2)}`);
            doc.text(`Shipping: $${Number(order.shipping || 0).toFixed(2)}`);

            doc.moveDown(0.5);
            doc.fontSize(14).text(`TOTAL: $${Number(order.total || 0).toFixed(2)}`, {
                underline: true
            });

            doc.end();

            stream.on("finish", () => resolve(pdfPath));
            stream.on("error", reject);

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = generatePDF;
