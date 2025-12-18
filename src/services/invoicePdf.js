const PDFDocument = require("pdfkit");
const path = require("path");

function formatCOP(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function buildInvoicePdfBuffer({ company, invoiceNo, roomNumber, dateStr, timeStr, items, total }, logoAbsPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks = [];

    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = doc.page.width;
    const margin = doc.page.margins.left;

    const headerY = 40;
    const logoW = 70;

    doc.font("Helvetica-Bold").fontSize(20).text("CUENTA DE COBRO", margin, headerY, {
      width: pageW - margin * 2 - logoW - 12,
      align: "left"
    });

    if (logoAbsPath) {
      const xLogo = pageW - margin - logoW;
      doc.image(logoAbsPath, xLogo, headerY - 6, { width: logoW });
    }

    let y = headerY + 42;

    doc.font("Helvetica").fontSize(10);
    doc.text(`Empresa: ${company || ""}`, margin, y);
    y += 14;
    doc.text(`Cuenta No: ${invoiceNo}`, margin, y);
    y += 14;
    doc.text(`Habitación: ${roomNumber}`, margin, y);
    y += 14;
    doc.text(`Fecha: ${dateStr}   Hora: ${timeStr}`, margin, y);

    y += 18;
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor("#BDBDBD").stroke();
    y += 18;

    const colDetalleX = margin;
    const colCantX = 350;
    const colValorX = 420;
    const colTotalX = 500;

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Detalle", colDetalleX, y, { width: colCantX - colDetalleX - 10, align: "left" });
    doc.text("Cant.", colCantX, y, { width: 50, align: "center" });
    doc.text("Valor", colValorX, y, { width: 70, align: "right" });
    doc.text("Total", colTotalX, y, { width: 70, align: "right" });

    y += 14;
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor("#D0D0D0").stroke();
    y += 14;

    doc.font("Helvetica").fontSize(10);

    for (const it of items) {
      const lineTotal = Number(it.quantity) * Number(it.price);
      const rowH = 16;

      doc.text(String(it.name || ""), colDetalleX, y, {
        width: colCantX - colDetalleX - 10,
        align: "left"
      });

      doc.text(String(it.quantity || 0), colCantX, y, { width: 50, align: "center" });
      doc.text(formatCOP(it.price || 0), colValorX, y, { width: 70, align: "right" });
      doc.text(formatCOP(lineTotal), colTotalX, y, { width: 70, align: "right" });

      y += rowH;

      if (y > doc.page.height - 120) {
        doc.addPage();
        y = 80;
      }
    }

    y += 10;
    doc.moveTo(margin, y).lineTo(pageW - margin, y).strokeColor("#BDBDBD").stroke();
    y += 18;

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("TOTAL A PAGAR:", colTotalX - 40, y, { width: 110, align: "right" });
    y += 16;
    doc.text(formatCOP(total), colTotalX - 40, y, { width: 110, align: "right" });

    doc.font("Helvetica").fontSize(9);
    doc.text("Documento generado por el sistema de minibar.", margin, doc.page.height - 70, {
      width: pageW - margin * 2,
      align: "left"
    });

    doc.end();
  });
}

module.exports = { buildInvoicePdfBuffer };
