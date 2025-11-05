import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Draw a key-value pair neatly
const drawRow = (doc, y, label, value) => {
  doc.font("Helvetica-Bold").text(label, 60, y);
  doc.font("Helvetica").text(value, 250, y);
};

// Draw a line separator
const drawLine = (doc, y) => {
  doc.moveTo(50, y).lineTo(550, y).stroke();
};

// ------------------- PAYSLIP GENERATOR -------------------
const generatePayslip = async (data) => {
  try {
    const payslipDir = path.join(uploadDir, "payslips");
    ensureDir(payslipDir);

    const fileName = `${data.employeeId}_${data.month}_${data.year}.pdf`;
    const filePath = path.join(payslipDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // ---- Header ----
    doc
      .fontSize(20)
      .fillColor("#2c3e50")
      .text("Valour Technologies Pvt. Ltd.", { align: "center" });
    doc.moveDown(0.2);
    doc
      .fontSize(14)
      .fillColor("#34495e")
      .text("PAYSLIP", { align: "center", underline: true });
    doc.moveDown(1);

    // ---- Employee Details ----
    doc.fontSize(11).fillColor("black");
    let y = doc.y;

    const details = [
      ["Employee Name:", data.employeeName || "N/A"],
      ["Employee ID:", data.employeeId],
      ["Designation:", data.designation || "Employee"],
      ["Month:", data.month],
      ["Year:", data.year],
    ];

    details.forEach(([label, value], idx) => {
      drawRow(doc, y + idx * 16, label, value);
    });

    y += details.length * 16 + 10;
    drawLine(doc, y);
    y += 15;

    // ---- Earnings & Deductions ----
    doc.fontSize(12).fillColor("#2c3e50").text("Earnings & Deductions", 60, y, {
      underline: true,
    });
    y += 20;

    const earnings = [
      ["Basic Salary:", `₹${data.basic}`],
      ["HRA:", `₹${data.hra}`],
      ["Allowances:", `₹${data.allowances}`],
      ["Bonus:", `₹${data.bonus}`],
      ["Deductions:", `₹${data.deductions}`],
    ];

    earnings.forEach(([label, value], idx) => {
      drawRow(doc, y + idx * 16, label, value);
    });

    y += earnings.length * 16 + 10;
    drawLine(doc, y);
    y += 15;

    // ---- Salary Summary ----
    doc.fontSize(12).fillColor("#2c3e50").text("Salary Summary", 60, y, {
      underline: true,
    });
    y += 20;

    const summary = [
      ["Gross Salary:", `₹${data.grossSalary}`],
      ["Net Salary (After Deductions):", `₹${data.netSalary}`],
    ];

    summary.forEach(([label, value], idx) => {
      drawRow(doc, y + idx * 16, label, value);
    });

    y += summary.length * 16 + 20;
    drawLine(doc, y);
    y += 30;

    // ---- Footer ----
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "This is a computer-generated payslip and does not require signature.",
        60,
        y,
        { align: "center", oblique: true }
      );
    doc.text("© Valour Technologies Pvt. Ltd.", 60, y + 15, {
      align: "center",
    });

    doc.end();
    return `/uploads/payslips/${fileName}`;
  } catch (error) {
    console.error("PDF generation error:", error);
    return null;
  }
};


// ------------------- OFFER LETTER GENERATOR -------------------
export const generateOfferLetter = async (data) => {
  try {
    const offerDir = path.join(uploadDir, "offerLetters");
    ensureDir(offerDir);

    const safeName = data.employeeName.replace(/\s+/g, "_");
    const fileName = `${safeName}_OfferLetter.pdf`;
    const filePath = path.join(offerDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ---- HEADER ----
    doc
      .fontSize(22)
      .fillColor("#2c3e50")
      .text("Valour Technologies Pvt. Ltd.", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(16)
      .fillColor("#34495e")
      .text("OFFER LETTER", { align: "center", underline: true });
    doc.moveDown(2);

    // ---- BODY ----
    doc.fontSize(12).fillColor("black");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
    doc.moveDown(1);
    doc.text(`To,`);
    doc.text(`${data.employeeName}`);
    doc.moveDown(1);
    doc.font("Helvetica-Bold").text(`Subject: Appointment as ${data.designation}`);
    doc.moveDown(1);
    doc.font("Helvetica").text(`Dear ${data.employeeName},`);
    doc.moveDown(0.5);
    doc.text(
      `We are pleased to offer you the position of ${data.designation} at Valour Technologies Pvt. Ltd. ` +
      `Your joining date will be ${new Date(data.joiningDate).toLocaleDateString()}, and your total compensation (CTC) ` +
      `will be ₹${data.offeredCtc.toLocaleString()} per annum.`
    );
    doc.moveDown(1.5);
    doc.text(`We look forward to welcoming you to our organization and believe your contribution will be valuable.`);
    doc.moveDown(1.5);
    doc.text(`Please sign and return this letter to confirm your acceptance.`);
    doc.moveDown(3);
    doc.text(`Sincerely,`);
    doc.text(`HR Manager`);
    doc.text(`Valour Technologies Pvt. Ltd.`);
    doc.moveDown(2);
    doc.fontSize(10).fillColor("gray").text(
      "This is a computer-generated document and does not require a signature.",
      { align: "center" }
    );

    // ✅ Ensure writing completes
    doc.end();
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    return `/uploads/offerLetters/${fileName}`;
  } catch (error) {
    console.error("Offer letter PDF generation error:", error);
    return null;
  }
};

export default { generatePayslip, generateOfferLetter };
