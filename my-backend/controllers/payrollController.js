import Payroll from "../models/Payroll.js";
import pdfGenerator from "../utils/pdfGenerator.js";
import path from "path";

// @desc Get all payroll records
// @route GET /api/payroll
export const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate(
      "employeeId",
      "name employeeId designation"
    );
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Generate payroll for an employee
// @route POST /api/payroll
export const addPayroll = async (req, res) => {
  try {
    const { employeeId, month, year, basic, hra, allowances, bonus, deductions } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: "Employee ID, month, and year are required" });
    }

    const basicNum = Number(basic) || 0;
    const hraNum = Number(hra) || 0;
    const allowancesNum = Number(allowances) || 0;
    const bonusNum = Number(bonus) || 0;
    const deductionsNum = Number(deductions) || 0;

    const grossSalary = basicNum + hraNum + allowancesNum + bonusNum;
    const netSalary = grossSalary - deductionsNum;

    const payroll = new Payroll({
      employeeId,
      month,
      year,
      basic: basicNum,
      hra: hraNum,
      allowances: allowancesNum,
      bonus: bonusNum,
      deductions: deductionsNum,
      grossSalary,
      netSalary,
    });

    // Generate payslip PDF
    const pdfUrl = await pdfGenerator.generatePayslip({
      employeeId,
      month,
      year,
      basic: basicNum,
      hra: hraNum,
      allowances: allowancesNum,
      bonus: bonusNum,
      deductions: deductionsNum,
      grossSalary,
      netSalary,
    });

    payroll.payslipUrl = pdfUrl;

    const savedPayroll = await payroll.save();
    res.status(201).json(savedPayroll);
  } catch (error) {
    console.error("Error in addPayroll:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Update payroll status (Paid / Generated)
// @route PUT /api/payroll/:id
export const updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete payroll record
// @route DELETE /api/payroll/:id
export const deletePayroll = async (req, res) => {
  try {
    await Payroll.findByIdAndDelete(req.params.id);
    res.json({ message: "Payroll record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Generate and download payslip PDF manually
// @route GET /api/payroll/:id/payslip
export const generatePayslipPDF = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate("employeeId");
    if (!payroll) {
      return res.status(404).json({ message: "Payroll not found" });
    }

    // Pass all employee and payroll details to pdfGenerator
    const pdfPath = await pdfGenerator.generatePayslip({
      employeeId: payroll.employeeId._id,
      employeeName: payroll.employeeId.name,
      designation: payroll.employeeId.designation,
      month: payroll.month,
      year: payroll.year,
      basic: payroll.basic,
      hra: payroll.hra,
      allowances: payroll.allowances,
      bonus: payroll.bonus,
      deductions: payroll.deductions,
      grossSalary: payroll.grossSalary,
      netSalary: payroll.netSalary,
    });

    if (!pdfPath) {
      return res.status(500).json({ message: "PDF generation failed" });
    }

    const fullPath = path.resolve(`.${pdfPath}`);
    res.download(fullPath);
  } catch (error) {
    console.error("Payslip PDF generation error:", error);
    res.status(500).json({ message: error.message });
  }
};
