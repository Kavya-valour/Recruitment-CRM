import Employee from "../models/Employee.js";
import fs from "fs";
import path from "path";

// Generate sequential Employee IDs (VT0001, VT0002...)
const generateEmployeeId = async () => {
  const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
  let nextNumber = 1;

  if (lastEmployee && lastEmployee.employee_id) {
    const numPart = parseInt(lastEmployee.employee_id.replace("VT", ""), 10);
    nextNumber = numPart + 1;
  }

  return `VT${nextNumber.toString().padStart(4, "0")}`;
};

// Get all employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find(); // full data
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single employee
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new employee with auto-generated VT000X ID
export const addEmployee = async (req, res) => {
  try {
    const existing = await Employee.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const employee_id = await generateEmployeeId();

    const employee = new Employee({
      employee_id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      designation: req.body.designation,
      department: req.body.department,
      joining_date: req.body.joining_date,
      leaving_date: req.body.leaving_date || null,
      current_ctc: req.body.current_ctc,
      status: req.body.status || "Active",
    });

    const saved = await employee.save();
    res.status(201).json({
      message: "Employee added successfully",
      employee: saved,
    });
  } catch (err) {
    console.error("Error in addEmployee:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update employee including education & experience with optional files
export const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Update basic fields
    const basicFields = [
      "name",
      "email",
      "phone",
      "designation",
      "department",
      "joining_date",
      "leaving_date",
      "current_ctc",
      "status",
    ];
    basicFields.forEach((field) => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });

    // Update education if provided
    if (req.body.education) {
      const eduArray = JSON.parse(req.body.education);
      employee.education = eduArray;
    }

    // Update experience if provided
    if (req.body.experience) {
      const expArray = JSON.parse(req.body.experience);
      employee.experience = expArray;
    }

    await employee.save();
    res.json({ message: "Employee updated successfully", employee });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
