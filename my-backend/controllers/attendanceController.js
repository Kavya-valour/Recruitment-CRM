import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import csvParser from "csv-parser";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { validateAttendanceData } from "../utils/validators.js";

const buildPeriodRange = ({ type, year, month, week }) => {
  const selectedType = String(type || "monthly").toLowerCase();
  const selectedYear = Number(year);

  if (!["weekly", "monthly", "yearly"].includes(selectedType)) {
    throw new Error("type must be weekly, monthly, or yearly");
  }
  if (!selectedYear || Number.isNaN(selectedYear)) {
    throw new Error("year is required");
  }

  let startDate;
  let endDate;
  let periodLabel;

  if (selectedType === "monthly") {
    const selectedMonth = Number(month);
    if (!selectedMonth || selectedMonth < 1 || selectedMonth > 12) {
      throw new Error("valid month is required for monthly report");
    }

    startDate = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0);
    endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
    periodLabel = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }

  if (selectedType === "yearly") {
    startDate = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
    endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
    periodLabel = String(selectedYear);
  }

  if (selectedType === "weekly") {
    const selectedWeek = Number(week);
    if (!selectedWeek || selectedWeek < 1 || selectedWeek > 53) {
      throw new Error("valid week (1-53) is required for weekly report");
    }

    // ISO week start calculation (Monday)
    const jan4 = new Date(Date.UTC(selectedYear, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const week1Monday = new Date(jan4);
    week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

    const weekStartUTC = new Date(week1Monday);
    weekStartUTC.setUTCDate(week1Monday.getUTCDate() + (selectedWeek - 1) * 7);

    startDate = new Date(
      weekStartUTC.getUTCFullYear(),
      weekStartUTC.getUTCMonth(),
      weekStartUTC.getUTCDate(),
      0,
      0,
      0,
      0
    );

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    periodLabel = `Week ${selectedWeek}, ${selectedYear}`;
  }

  return { selectedType, startDate, endDate, periodLabel };
};

const generateAttendanceReportData = async ({ type, year, month, week }) => {
  const { selectedType, startDate, endDate, periodLabel } = buildPeriodRange({
    type,
    year,
    month,
    week,
  });

  const [attendanceRecords, employees] = await Promise.all([
    Attendance.find({ date: { $gte: startDate, $lte: endDate } }),
    Employee.find({ status: "Active" }).select("employee_id name"),
  ]);

  // 🔥 OPTIMIZED MAP
  const attendanceMap = {};
  attendanceRecords.forEach((rec) => {
    const key = String(rec.employeeId);
    if (!attendanceMap[key]) attendanceMap[key] = [];
    attendanceMap[key].push(rec);
  });

  const report = employees.map((employee) => {
    const employeeAttendance =
      attendanceMap[String(employee.employee_id)] || [];

    const presentDays = employeeAttendance.filter((r) => r.status === "Present").length;
    const absentDays = employeeAttendance.filter((r) => r.status === "Absent").length;
    const leaveDays = employeeAttendance.filter((r) => r.status === "Leave").length;

    const totalWorkingDays = presentDays + absentDays + leaveDays;

    const attendancePercentage =
      totalWorkingDays > 0
        ? (presentDays / totalWorkingDays) * 100
        : 0;

    return {
      employeeId: employee.employee_id,
      name: employee.name,
      totalWorkingDays,
      presentDays,
      absentDays,
      leaveDays,
      attendancePercentage,
    };
  });

  const averageAttendance = report.length
    ? report.reduce((sum, row) => sum + row.attendancePercentage, 0) / report.length
    : 0;

  return {
    type: selectedType,
    year: Number(year),
    month: month ? Number(month) : null,
    week: week ? Number(week) : null,
    periodLabel,
    report,
    summary: {
      totalEmployees: employees.length,
      averageAttendance: averageAttendance.toFixed(2),
    },
  };
};

// Helper to validate attendance object
const validateAttendance = async (att) => {
  const errors = [];

  // Employee exists
  const emp = await Employee.findOne({ employee_id: att.employeeId });
  if (!emp) errors.push(`Employee ID ${att.employeeId} does not exist.`);

  // Date required
  if (!att.date) errors.push("Date is required.");

  // Status validation
  const validStatuses = ["Present", "Absent", "Leave"];
  if (!att.status || !validStatuses.includes(att.status)) {
    errors.push(`Status must be one of ${validStatuses.join(", ")}.`);
  }

  // Optional: validate inTime and outTime
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (att.inTime && !timeRegex.test(att.inTime)) errors.push("Invalid inTime format.");
  if (att.outTime && !timeRegex.test(att.outTime)) errors.push("Invalid outTime format.");

  return errors;
};

// ------------------- Add manual attendance -------------------
export const addAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, inTime, outTime } = req.body;

    // Validate input data
    const validationErrors = validateAttendanceData({ employeeId, date, status, inTime, outTime });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Check for duplicate attendance entry
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

    const existing = await Attendance.findOne({
      employeeId,
      date: { $gte: start, $lt: end },
    });

    if (existing) {
      return res.status(400).json({
        message: "Attendance already marked for this employee on this date",
      });
    }

    const record = new Attendance({
      employeeId,
      date,
      status,
      inTime,
      outTime,
    });
    const saved = await record.save();
    res.status(201).json({
      message: "Attendance marked successfully",
      attendance: saved
    });
  } catch (err) {
    console.error("Error adding attendance:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
};

// ------------------- Get all attendance -------------------
export const getAttendance = async (req, res) => {
  try {
    const { employeeId, date } = req.query;

    const filter = {};
    if (employeeId) filter.employeeId = employeeId;
    if (date) {
      // match date for the whole day
      const d = new Date(date);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const records = await Attendance.find(filter).populate("employeeId", "name employee_id");
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance." });
  }
};

// ------------------- Update attendance -------------------
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, date, status, inTime, outTime } = req.body;

    // Validate input data
    const validationErrors = validateAttendanceData({ employeeId, date, status, inTime, outTime });
    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors: validationErrors });
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ message: "Attendance record not found" });

    // If date or employee changed, ensure no duplicate for that employee on that date
    const newDate = date ? new Date(date) : attendance.date;
    const start = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    const end = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate() + 1);

    const duplicate = await Attendance.findOne({
      employeeId: employeeId || attendance.employeeId,
      date: { $gte: start, $lt: end },
      _id: { $ne: id }
    });
    if (duplicate) {
      return res.status(400).json({ message: "Another attendance entry exists for this employee on the given date" });
    }

    attendance.employeeId = employeeId || attendance.employeeId;
    attendance.date = date ? new Date(date) : attendance.date;
    attendance.status = status || attendance.status;
    attendance.inTime = inTime !== undefined ? inTime : attendance.inTime;
    attendance.outTime = outTime !== undefined ? outTime : attendance.outTime;

    const saved = await attendance.save();
    res.json({ message: "Attendance updated", attendance: saved });
  } catch (err) {
    console.error("Error updating attendance:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------- Get Monthly Attendance Report -------------------
export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const data = await generateAttendanceReportData({ type: "monthly", year, month });

    res.json({
      month,
      year,
      report: data.report,
      summary: {
        totalEmployees: data.summary.totalEmployees,
        averageAttendance: data.summary.averageAttendance,
      },
    });

  } catch (error) {
    console.error("Monthly report error:", error);
    res.status(400).json({ error: error.message || "Failed to generate monthly report" });
  }
};

// ------------------- Get Weekly / Monthly / Yearly Report -------------------
export const getAttendanceReport = async (req, res) => {
  try {
    const { type = "monthly", year, month, week } = req.query;
    const data = await generateAttendanceReportData({ type, year, month, week });
    return res.json(data);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to generate attendance report" });
  }
};

// ------------------- Export Weekly / Monthly / Yearly Report To Excel -------------------
export const exportAttendanceReportExcel = async (req, res) => {
  try {
    const { type = "monthly", year, month, week } = req.query;
    const data = await generateAttendanceReportData({ type, year, month, week });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Report");

    worksheet.columns = [
      { header: "Employee ID", key: "employeeId", width: 16 },
      { header: "Name", key: "name", width: 24 },
      { header: "Period", key: "period", width: 24 },
      { header: "Total Days", key: "totalWorkingDays", width: 14 },
      { header: "Present", key: "presentDays", width: 12 },
      { header: "Absent", key: "absentDays", width: 12 },
      { header: "Leave", key: "leaveDays", width: 12 },
      { header: "Attendance %", key: "attendancePercentage", width: 14 },
    ];

    worksheet.getRow(1).font = { bold: true };

    worksheet.autoFilter = "A1:H1";
    worksheet.columns.forEach((col) => {
      col.alignment = { vertical: "middle", horizontal: "center" };
    });

    data.report.forEach((row) => {
      worksheet.addRow({
        employeeId: row.employeeId,
        name: row.name,
        period: data.periodLabel,
        totalWorkingDays: row.totalWorkingDays,
        presentDays: row.presentDays,
        absentDays: row.absentDays,
        leaveDays: row.leaveDays,
        attendancePercentage: `${row.attendancePercentage}%`,
      });
    });

    worksheet.addRow([]);
    worksheet.addRow(["Total Employees", data.summary.totalEmployees]);
    worksheet.addRow(["Average Attendance", `${data.summary.averageAttendance}%`]);

    const safeType = String(data.type || type || "monthly").toLowerCase();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ); 
    res.setHeader("Content-Disposition", `attachment; filename=attendance-${safeType}-report.xlsx`);

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to export attendance report" });
  }
};

// ------------------- Upload CSV -------------------
export const uploadCsv = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "CSV file is required." });

  const results = [];
  const errors = [];
  const filePath = path.join(req.file.path);

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      let created = 0;

      for (const row of results) {
        const { employeeId, date, status, inTime, outTime } = row;
        const rowErrors = await validateAttendance({ employeeId, date, status, inTime, outTime });

        if (rowErrors.length > 0) {
          errors.push(`Row for Employee ID ${employeeId}: ${rowErrors.join(" ")}`);
          continue;
        }

        try {
          const attendance = new Attendance({ employeeId, date, status, inTime, outTime });
          await attendance.save();
          created++;
        } catch (err) {
          errors.push(`Failed to save row for Employee ID ${employeeId}.`);
        }
      }

      // Delete uploaded file
      fs.unlinkSync(filePath);

      if (errors.length > 0) {
        return res.status(400).json({ created, error: errors.join(" | ") });
      }
      res.json({ created });
    });
};
