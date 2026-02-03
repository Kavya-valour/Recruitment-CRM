import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import { validateAttendanceData } from "../utils/validators.js";

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
    const existing = await Attendance.findOne({ employeeId, date });
    if (existing) {
      return res.status(400).json({ message: "Attendance already marked for this employee on this date" });
    }

    const record = new Attendance({
      employee_id: employeeId,
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
    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" });
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // Get all attendance records for the month
    const attendanceRecords = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate("employeeId", "name employee_id");

    // Get all employees
    const employees = await Employee.find({ status: "Active" });

    // Create a map of employee attendance
    const report = employees.map(employee => {
      const employeeAttendance = attendanceRecords.filter(
        record => record.employeeId && record.employeeId._id.toString() === employee._id.toString()
      );

      const presentDays = employeeAttendance.filter(r => r.status === "Present").length;
      const absentDays = employeeAttendance.filter(r => r.status === "Absent").length;
      const leaveDays = employeeAttendance.filter(r => r.status === "Leave").length;
      const totalWorkingDays = presentDays + absentDays + leaveDays;

      return {
        employeeId: employee.employee_id,
        name: employee.name,
        totalWorkingDays,
        presentDays,
        absentDays,
        leaveDays,
        attendancePercentage: totalWorkingDays > 0 ? ((presentDays / totalWorkingDays) * 100).toFixed(2) : 0
      };
    });

    res.json({
      month,
      year,
      report,
      summary: {
        totalEmployees: employees.length,
        averageAttendance: report.length > 0 ? (report.reduce((sum, emp) => sum + parseFloat(emp.attendancePercentage), 0) / report.length).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error("Monthly report error:", error);
    res.status(500).json({ error: "Failed to generate monthly report" });
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
