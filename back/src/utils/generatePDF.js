const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const { IMAGES_DIR, TEMP_DIR } = require("../config/paths");

function generatePDF(order) {
  return new Promise((resolve, reject) => {
    try {
      fs.mkdirSync(TEMP_DIR, { recursive: true });

      const pdfPath = path.join(TEMP_DIR, `receipt_${order.id}.pdf`);
      const logoPath = path.join(IMAGES_DIR, "logo_mock.png");

      const doc = new PDFDocument({ margin: 40 });
      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);

      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, {
          fit: [120, 120],
          align: "center",
          valign: "center",
        });
        doc.moveDown(1);
      }

      doc.fontSize(22).text("Tokioona", { align: "center" });
      doc.fontSize(12).text("Recordar es volver a jugar", { align: "center" });
      doc.moveDown();

      doc.fontSize(16).text("Purchase Receipt", { underline: true });
      doc.fontSize(12).text(`Date: ${new Date().toLocaleString()}`);
      doc.text(`Customer: ${order.customerName || "Registered Customer"}`);
      doc.moveDown();

      doc.fontSize(14).text("Products:");
      doc.moveDown(0.5);

      order.items.forEach((item) => {
        const name = item.name || "Unnamed product";
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(
          item.unit_price ??
            item.price ??
            (item.subtotal && quantity ? item.subtotal / quantity : 0)
        );
        const lineTotal = unitPrice * quantity;

        doc.fontSize(12).text(`${quantity} x ${name} - $${lineTotal.toFixed(2)}`);
      });

      doc.moveDown();
      doc.fontSize(14).text("Summary:");
      doc.fontSize(12).text(`Subtotal: $${Number(order.subtotal || 0).toFixed(2)}`);
      doc.text(`Discount: $${Number(order.discount || 0).toFixed(2)}`);
      doc.text(`Taxes: $${Number(order.tax || 0).toFixed(2)}`);
      doc.text(`Shipping: $${Number(order.shipping || 0).toFixed(2)}`);
      doc.moveDown(0.5);
      doc.fontSize(14).text(`TOTAL: $${Number(order.total || 0).toFixed(2)}`, {
        underline: true,
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
