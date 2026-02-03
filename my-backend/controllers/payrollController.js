import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import pdfGenerator from "../utils/pdfGenerator.js";
import { validatePayrollData } from "../utils/validators.js";
import path from "path";

// ---------------- GET all payrolls ----------------
export const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate(
      "employeeId",
      "name employeeNumber designation workLocation joiningDate role"
    );
    res.json(payrolls);
  } catch (error) {
    console.error("Error fetching payrolls:", error);
    res.status(500).json({ message: "Failed to fetch payrolls" });
  }
};

// ---------------- ADD payroll ----------------
export const addPayroll = async (req, res) => {
  try {
    const { employeeId, month, year, ctc } = req.body;

    // Validate input data
    const validationErrors = validatePayrollData({ employeeId, month, year, ctc });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Check for duplicate payroll entry
    const existingPayroll = await Payroll.findOne({
      employeeId,
      month,
      year
    });
    if (existingPayroll) {
      return res.status(400).json({
        message: `Payroll already exists for ${employee.name} for ${month} ${year}`
      });
    }

    const ctcNum = Number(ctc);

    // ---- Get attendance and leave data for the month ----
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // Get attendance records
    const attendanceRecords = await Attendance.find({
      employeeId: employee.employee_id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Get approved leaves for the month
    const approvedLeaves = await Leave.find({
      employeeId: employee._id,
      status: "Approved",
      fromDate: { $lte: endOfMonth },
      toDate: { $gte: startOfMonth }
    });

    // Calculate working days (assuming 30 days for simplicity, can be enhanced)
    const totalDaysInMonth = endOfMonth.getDate();
    const workingDays = 22; // Standard working days, can be calculated based on weekends

    // Count present and absent days
    const presentDays = attendanceRecords.filter(r => r.status === "Present").length;
    const absentDays = attendanceRecords.filter(r => r.status === "Absent").length;

    // Calculate leave days (only count as absent if unpaid)
    let unpaidLeaveDays = 0;
    approvedLeaves.forEach(leave => {
      const leaveStart = new Date(Math.max(leave.fromDate, startOfMonth));
      const leaveEnd = new Date(Math.min(leave.toDate, endOfMonth));
      const leaveDays = Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;
      // Assuming all leaves are paid for now, but can add logic for unpaid leaves
      unpaidLeaveDays += leaveDays;
    });

    // ---- Salary calculations ----
    const monthlyBasic = Math.round(ctcNum * 0.4 / 12);
    const basic = Math.round(monthlyBasic * (workingDays / totalDaysInMonth)); // Prorate basic
    const hra = Math.round(basic * 0.5);
    const da = Math.round(basic * 0.035);
    const employerPF = Math.round(basic * 0.12);
    const specialAllowance = Math.round((ctcNum - (basic + hra + da + employerPF)) / 12);

    // Calculate daily rate for deductions
    const dailyRate = monthlyBasic / workingDays;

    // Deductions for absences and unpaid leaves
    const absenceDeductions = Math.round((absentDays + unpaidLeaveDays) * dailyRate);

    const tds = Math.round(ctcNum * 0.04 / 12);

    const totalEarnings = basic + hra + da + specialAllowance;
    const totalDeductions = tds + employerPF + absenceDeductions;
    const netSalary = totalEarnings - totalDeductions;
    const grossSalary = totalEarnings;

    // ---- Formatted Employee ID ----
    const formattedEmployeeId = `VT/${employee.role || "DEV"}/${year}/${String(employee.employeeNumber).padStart(4, '0')}`;

    // ---- Create payroll record ----
    const payroll = new Payroll({
      employeeId,
      formattedEmployeeId,
      month,
      year,
      ctc: ctcNum,
      basic,
      hra,
      da,
      specialAllowance,
      employerPF,
      tds,
      absenceDeductions,
      totalEarnings,
      totalDeductions,
      grossSalary,
      netSalary,
    });

    // ---- Generate PDF payslip ----
    const pdfUrl = await pdfGenerator.generatePayslip({
      employeeName: employee.name,
      designation: employee.designation,
      employeeId: formattedEmployeeId,
      joiningDate: employee.joiningDate,
      workLocation: employee.workLocation || "Remote",
      month,
      year,
      basic,
      hra,
      da,
      specialAllowance,
      employerPF,
      tds,
      absenceDeductions,
      totalEarnings,
      totalDeductions,
      netSalary,
      ctc: ctcNum,
    });

    payroll.payslipUrl = pdfUrl;

    const savedPayroll = await payroll.save();
    res.status(201).json(savedPayroll);

  } catch (error) {
    console.error("Error adding payroll:", error);
    res.status(500).json({ message: "Failed to add payroll" });
  }
};

// ---------------- UPDATE payroll status ----------------
export const updatePayrollStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Generated", "Paid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    res.json(payroll);
  } catch (error) {
    console.error("Error updating payroll status:", error);
    res.status(500).json({ message: "Failed to update payroll status" });
  }
};

// ---------------- DELETE payroll ----------------
export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    res.json({ message: "Payroll deleted successfully" });
  } catch (error) {
    console.error("Error deleting payroll:", error);
    res.status(500).json({ message: "Failed to delete payroll" });
  }
};

// ---------------- GENERATE Payslip PDF ----------------
export const generatePayslipPDF = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate("employeeId");
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });

    const pdfPath = await pdfGenerator.generatePayslip({
      employeeName: payroll.employeeId.name,
      designation: payroll.employeeId.designation,
      employeeId: payroll.formattedEmployeeId,
      joiningDate: payroll.employeeId.joiningDate,
      workLocation: payroll.employeeId.workLocation,
      month: payroll.month,
      year: payroll.year,
      basic: payroll.basic,
      hra: payroll.hra,
      da: payroll.da,
      specialAllowance: payroll.specialAllowance,
      employerPF: payroll.employerPF,
      tds: payroll.tds,
      absenceDeductions: payroll.absenceDeductions,
      totalEarnings: payroll.totalEarnings,
      totalDeductions: payroll.totalDeductions,
      grossSalary: payroll.grossSalary,
      netSalary: payroll.netSalary,
      ctc: payroll.ctc,
    });

    const fullPath = path.resolve(`.${pdfPath}`);
    res.download(fullPath);

  } catch (error) {
    console.error("Payslip PDF error:", error);
    res.status(500).json({ message: "Failed to generate payslip PDF" });
  }
};
