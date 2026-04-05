import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

import { generateOfferHTML } from "./offerTemplate.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(process.cwd(), "logo.png");

const logoBase64 = fs.existsSync(logoPath)
  ? fs.readFileSync(logoPath, { encoding: "base64" })
  : null;

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

    const safeName = (data.employeeName || "Employee")
      .replace(/\s+/g, "_")        // spaces → _
      .replace(/[^a-zA-Z0-9_]/g, ""); // remove special chars

    const fileName = `Offer_Letter-${safeName}.pdf`;
    const filePath = path.join(offerDir, fileName);

    const html = generateOfferHTML({
      ...data,
      logoBase64
    });

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,

      /* 🔥 FINAL PERFECT MARGINS */
      margin: {
        top: "40px",     // space for logo + header
        bottom: "90px",   // bottom breathing space
        left: "70px",
        right: "70px"
      }
    });

    await browser.close();

    return `/uploads/offerLetters/${fileName}`;

  } catch (error) {
    console.error("HTML PDF generation error:", error);
    return null;
  }
};

export default { generatePayslip, generateOfferLetter };