import PDFDocument from "pdfkit";

const GOLD = "#B96D08";
const GOLD_DARK = "#5C1010";
const INK = "#2A2A28";
const MUTED = "#8A8578";
const BORDER = "#EDE1C0";

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Generates a one-page-ish animal report as a Buffer, using pdfkit (pure JS,
// no headless browser required).
export function generateAnimalPdf(animal, vaccinations, weights) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const left = doc.page.margins.left;

      // ---- Header ----
      doc
        .fillColor(GOLD)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("NOORI CATTLE FARM", left, 40, { characterSpacing: 1.5 });

      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("Animal Report", left, 56);

      // Ear tag badge, top right
      const tagText = animal.animalId;
      doc.font("Helvetica-Bold").fontSize(13);
      const tagWidth = doc.widthOfString(tagText) + 24;
      const tagX = left + pageWidth - tagWidth;
      doc.roundedRect(tagX, 42, tagWidth, 26, 5).fill(GOLD);
      doc.fillColor("#FFFFFF").text(tagText, tagX, 50, { width: tagWidth, align: "center" });

      doc.moveTo(left, 92).lineTo(left + pageWidth, 92).lineWidth(2).strokeColor(GOLD).stroke();

      // ---- Info grid ----
      let y = 110;
      const colWidth = pageWidth / 2;
      const rows = [
        ["Tag / Nickname", animal.tag || "—"],
        ["Owner", animal.ownerName],
        ["Owner Contact", animal.ownerContact],
        ["Breed", animal.breed || "—"],
        ["Rate", animal.rate != null ? `PKR ${Number(animal.rate).toLocaleString()}` : "—"],
        ["Palai Charges", `PKR ${Number(animal.palaiCharges || 0).toLocaleString()}`],
        ["Arrival Date", fmtDate(animal.arrivalDate)],
        ["Initial Weight", animal.initialWeight ? `${animal.initialWeight} kg` : "—"],
      ];


      rows.forEach((row, i) => {
        const col = i % 2;
        const rowY = y + Math.floor(i / 2) * 34;
        const x = left + col * colWidth;
        doc
          .fillColor(MUTED)
          .font("Helvetica")
          .fontSize(8)
          .text(row[0].toUpperCase(), x, rowY, { characterSpacing: 0.5 });
        doc
          .fillColor(INK)
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(row[1], x, rowY + 11);
      });

      y = y + Math.ceil(rows.length / 2) * 34 + 20;

      // ---- Vaccination History ----
      doc
        .fillColor(GOLD_DARK)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("VACCINATION HISTORY", left, y, { characterSpacing: 0.5 });
      y += 18;
      doc.moveTo(left, y).lineTo(left + pageWidth, y).lineWidth(1).strokeColor(BORDER).stroke();
      y += 8;

      const vaccColWidths = [0.34, 0.24, 0.42].map((f) => f * pageWidth);
      const vaccHeaders = ["Vaccine", "Date Given", "Notes"];

      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(MUTED);
      let x = left;
      vaccHeaders.forEach((h, i) => {
        doc.text(h.toUpperCase(), x, y, { width: vaccColWidths[i] });
        x += vaccColWidths[i];
      });
      y += 16;
      doc.moveTo(left, y).lineTo(left + pageWidth, y).lineWidth(0.5).strokeColor(BORDER).stroke();
      y += 6;

      if (vaccinations.length === 0) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor(MUTED).text("No vaccination records yet", left, y);
        y += 20;
      } else {
        vaccinations.forEach((v) => {
          x = left;
          doc.font("Helvetica").fontSize(9).fillColor(INK);
          doc.text(v.vaccineName, x, y, { width: vaccColWidths[0] });
          x += vaccColWidths[0];
          doc.text(fmtDate(v.dateGiven), x, y, { width: vaccColWidths[1] });
          x += vaccColWidths[1];
          doc.fillColor(INK).text(v.notes || "—", x, y, { width: vaccColWidths[2] });
          y += 18;
        });
      }

      y += 14;

      // ---- Weight History ----
      doc
        .fillColor(GOLD_DARK)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("WEIGHT HISTORY", left, y, { characterSpacing: 0.5 });
      y += 18;
      doc.moveTo(left, y).lineTo(left + pageWidth, y).lineWidth(1).strokeColor(BORDER).stroke();
      y += 8;

      const wColWidths = [0.34, 0.33, 0.33].map((f) => f * pageWidth);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(MUTED);
      x = left;
      ["Month", "Date Logged", "Weight"].forEach((h, i) => {
        doc.text(h.toUpperCase(), x, y, { width: wColWidths[i] });
        x += wColWidths[i];
      });
      y += 16;
      doc.moveTo(left, y).lineTo(left + pageWidth, y).lineWidth(0.5).strokeColor(BORDER).stroke();
      y += 6;

      if (weights.length === 0) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor(MUTED).text("No weight records yet", left, y);
        y += 20;
      } else {
        weights.forEach((w) => {
          x = left;
          doc.font("Helvetica").fontSize(9).fillColor(INK);
          doc.text(w.month, x, y, { width: wColWidths[0] });
          x += wColWidths[0];
          doc.text(fmtDate(w.date), x, y, { width: wColWidths[1] });
          x += wColWidths[1];
          doc.text(`${w.weight} kg`, x, y, { width: wColWidths[2] });
          y += 18;
        });
      }

      // ---- Footer ----
      doc
        .fontSize(8)
        .fillColor(MUTED)
        .text(`Generated on ${fmtDate(new Date())} · Noori Cattle Farm`, left, doc.page.height - 50, {
          width: pageWidth,
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
