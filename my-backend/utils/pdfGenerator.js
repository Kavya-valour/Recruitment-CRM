import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const uploadDir = path.join(process.cwd(), "uploads");

//---------------- DRAW KEY/VALUE HELPER ----------------
const drawRow = (doc, y, label, value) => {
  doc.font("Helvetica-Bold").text(label, 60, y);
  doc.font("Helvetica").text(value, 250, y);
};

// ------------------- PAYSLIP GENERATOR -------------------
export const generatePayslip = async (data) => {
  try {
    // Convert values safely
    data.basic = Number(data.basic || 0);
    data.hra = Number(data.hra || 0);
    data.da = Number(data.da || 0);
    data.specialAllowance = Number(data.specialAllowance || 0);
    data.tds = Number(data.tds || 0);

    const payslipDir = path.join(uploadDir, "payslips");
    ensureDir(payslipDir);

    const safeEmployeeId = data.employeeId.replace(/\//g, "-");
    const fileName = `${safeEmployeeId}_${data.month}_${data.year}.pdf`;
    const filePath = path.join(payslipDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // Logo
    const logoPath = path.join(process.cwd(), "public/images/logo.png");
    if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 45, { width: 70 });

    // Header
    doc.fontSize(18).fillColor("#2c3e50").text("Valour Technologies Pvt Ltd", 150, 50);
    doc.fontSize(10).fillColor("#555").text(
      "No. 502, Vcollab, Capital Park, Image Gardens Road, Madhapur, Hyderabad, Telangana - 500081",
      150,
      75
    );
    doc.moveDown(2);
    doc.fontSize(14).fillColor("#000").text(`Salary Slip - ${data.month} ${data.year}`, { align: "center" });
    doc.moveDown(1);

    // Employee Details Table (2 column)
    const details = [
      ["Employee Name", data.employeeName],
      ["Designation", data.designation],
      ["Employee ID", data.employeeId],
      ["Joining Date", new Date(data.joiningDate).toLocaleDateString("en-GB")],
      ["Work Location", data.workLocation || "Remote / Office"],
    ];

    let tableTop = doc.y;
    let rowHeight = 22;
    let col1 = 60, col2 = 250, colWidth = 300;

    details.forEach((row) => {
      doc.rect(col1, tableTop, colWidth, rowHeight).stroke();
      doc.rect(col2, tableTop, colWidth, rowHeight).stroke();
      doc.fontSize(11).fillColor("#000").text(row[0], col1 + 5, tableTop + 5);
      doc.text(row[1], col2 + 5, tableTop + 5);
      tableTop += rowHeight;
    });

    doc.moveDown(3);

    // Earnings / Deductions
    const employerPf = Math.round(data.basic * 0.12);

    const earnings = [
      ["Basic Salary", data.basic],
      ["HRA", data.hra],
      ["Dearness Allowance", data.da],
      ["Special Allowance", data.specialAllowance],
    ];

    const deductions = [
      ["Employee PF (12%)", data.employerPF || employerPf],
      ["TDS", data.tds],
      ["Absence Deductions", data.absenceDeductions || 0],
    ];

    const maxRows = Math.max(earnings.length, deductions.length);

    let y = doc.y + 10;
    const colX = [60, 200, 350, 500];
    const rowH = 24;

    // Header Row
    doc.fontSize(12).fillColor("#000");
    doc.rect(colX[0], y, 460, rowH).fill("#eaeaea").stroke();
    doc.fillColor("#000")
      .text("Earnings", colX[0] + 5, y + 6)
      .text("Amount (₹)", colX[1] + 5, y + 6)
      .text("Deductions", colX[2] + 5, y + 6)
      .text("Amount (₹)", colX[3] + 5, y + 6);

    y += rowH;

    // Row Data
    for (let i = 0; i < maxRows; i++) {
      doc.rect(colX[0], y, 460, rowH).stroke();
      if (earnings[i]) {
        doc.text(earnings[i][0], colX[0] + 5, y + 6);
        doc.text(earnings[i][1].toLocaleString("en-IN"), colX[1] + 5, y + 6);
      }
      if (deductions[i]) {
        doc.text(deductions[i][0], colX[2] + 5, y + 6);
        doc.text(deductions[i][1].toLocaleString("en-IN"), colX[3] + 5, y + 6);
      }
      y += rowH;
    }

    // Total row highlighted
    const totalEarnings = earnings.reduce((s, e) => s + e[1], 0);
    const totalDeductions = deductions.reduce((s, d) => s + d[1], 0);
    const netPay = totalEarnings - totalDeductions;

    doc.rect(colX[0], y + 5, 460, rowH).fill("#f5f5f5").stroke();
    doc.font("Helvetica-Bold")
      .fillColor("#000")
      .text(`Total Earnings: ₹${totalEarnings.toLocaleString("en-IN")}`, colX[0] + 5, y + 11)
      .text(`Total Deductions: ₹${totalDeductions.toLocaleString("en-IN")}`, colX[2] + 5, y + 11);

    y += rowH + 10;

    // Net Take-home
    doc.rect(colX[0], y, 460, rowH).stroke();
    doc.text(`Net Take-Home Pay: ₹${netPay.toLocaleString("en-IN")}`, colX[0] + 5, y + 6);

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

    // Company Header
    doc.fontSize(18).fillColor("#000").text("Valour Technologies Pvt Ltd", { align: "center" });
    doc.fontSize(10).fillColor("#444").text("No. 502, Vcollab, Capital Park, Image Gardens road,", { align: "center" });
    doc.text("Madhapur, Hyderabad, Telangana 500081", { align: "center" });
    doc.moveDown(2);

    // Candidate Details
    doc.fontSize(12).fillColor("#000");
    doc.text(`${data.employeeName}`);
    doc.text(`${data.relationPrefix} ${data.fatherName}`);
    data.employeeAddress.forEach(line => doc.text(line));
    doc.moveDown(1.5);

    // Subject & Date
    doc.font("Helvetica-Bold").text("Sub: Letter of Offer and Terms of Employment");
    doc.moveDown(1);

    doc.font("Helvetica").text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
    doc.moveDown(1.5);

    // Greeting
    doc.text(`Dear ${data.employeeName},`);
    doc.moveDown(1);

    // Body
    doc.text(
      `With reference to your interview with us, we are pleased to offer you the position of ` +
      `${data.designation} at our Company as per the terms & conditions discussed with you.`
    );
    doc.moveDown(1);

    doc.text(
      `We look forward to you joining us at the earliest. We are certain that you will find challenge, satisfaction ` +
      `and opportunity in your association with the Company. If you are agreeable to the said terms, you are requested ` +
      `to report for duty on ${new Date(data.joiningDate).toLocaleDateString()}.`
    );
    doc.moveDown(1.5);

    // Documents List
    doc.text("On the aforesaid date of joining, you are required to submit:");
    doc.text("1. Academic / Professional certificates and experience proofs.");
    doc.text("2. Two passport sized colour photographs.");
    doc.text("3. Aadhaar & PAN photocopies.");
    doc.text("4. No Dues / Clearance letter from previous employer (if applicable).");
    doc.text("5. Form 16 / Investment Declaration (if applicable).");
    doc.moveDown(1.5);

    // Terms & Conditions Section
    doc.font("Helvetica-Bold").text("Terms & Conditions of Employment:");
    doc.moveDown(0.5);
    doc.font("Helvetica").text(
      `• You will be appointed as ${data.designation}.\n` +
      `• A probation period of 3 months applies.\n` +
      `• Work location: Remote, subject to company & project requirements.\n` +
      `• Confidentiality & Non-Disclosure must be strictly followed.\n` +
      `• Either party may terminate employment with 30 days notice.\n`
    );
    doc.moveDown(1.5);

    // Salary Table
    const monthly = (amount) => Math.round(amount / 12).toLocaleString();

    doc.font("Helvetica-Bold").text("Proposed CTC for the Year");
    doc.moveDown(1);

    const salaryRows = [
      ["Basic Salary", data.basic, monthly(data.basic)],
      ["House Rent Allowance (HRA)", data.hra, monthly(data.hra)],
      ["Dearness Allowance (DA)", data.da, monthly(data.da)],
      ["Special Allowance", data.specialAllowance, monthly(data.specialAllowance)],
    ];

    salaryRows.forEach(([label, annual, mn]) => {
      doc.font("Helvetica").text(`${label}   ${annual.toLocaleString()} pa   ${mn} pm`);
    });

    doc.moveDown(1);
    doc.text(`Total Cost to Company: ₹${data.offeredCtc.toLocaleString()} per annum`);
    doc.moveDown(1);

    const guaranteed = data.offeredCtc - data.tds;
    doc.text(`TDS deduction: ₹${data.tds.toLocaleString()} pa`);
    doc.text(`Net Pay (approx): ₹${guaranteed.toLocaleString()} pa`);
    doc.moveDown(2);

    // Acceptance Section
    doc.font("Helvetica-Bold").text("Acceptance & Acknowledgment:");
    doc.moveDown(0.5);
    doc.font("Helvetica").text(
      `I, ${data.employeeName}, hereby confirm acceptance of the offer and agree to the terms stated above.`
    );
    doc.moveDown(2);
    doc.text("Signature: ___________________________");
    doc.text("Date: _______________________________");
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).fillColor("gray").text(
      "This is a computer-generated document and does not require a signature.",
      { align: "center" }
    );

    // Finalize
    doc.end();
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    return `/uploads/offerLetters/${fileName}`;
  } catch (error) {
    console.error("Offer Letter PDF generation error:", error);
    return null;
  }
};


export default { generatePayslip, generateOfferLetter };
