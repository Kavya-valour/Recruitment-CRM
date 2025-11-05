import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";

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
    const errors = await validateAttendance({ employeeId, date, status, inTime, outTime });

    if (errors.length > 0) return res.status(400).json({ error: errors.join(" ") });

    const record = new Attendance({ employeeId, date, status, inTime, outTime });
    const saved = await record.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add attendance." });
  }
};

// ------------------- Get all attendance -------------------
export const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate("employeeId", "name employee_id");
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance." });
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
          errors.push(`Row for Employee ${employeeId}: ${rowErrors.join(" ")}`);
          continue;
        }

        try {
          const attendance = new Attendance({ employeeId, date, status, inTime, outTime });
          await attendance.save();
          created++;
        } catch (err) {
          errors.push(`Failed to save row for Employee ${employeeId}.`);
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
