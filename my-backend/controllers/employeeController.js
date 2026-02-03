import Employee from "../models/Employee.js";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { validateEmployeeData } from "../utils/validators.js";

// Generate sequential Employee IDs (VT000101, VT000102...)
const generateEmployeeId = async () => {
  const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
  let nextNumber = 101; // Start from 101

  if (lastEmployee && lastEmployee.employee_id) {
    const numPart = parseInt(lastEmployee.employee_id.replace("VT", ""), 10);
    nextNumber = numPart + 1;
  }

  return `VT${nextNumber.toString().padStart(6, "0")}`;
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

// Get employee by email or employee_id
export const getEmployeeByLookup = async (req, res) => {
  try {
    const { email, employeeId } = req.query;

    if (!email && !employeeId) {
      return res.status(400).json({ message: "Email or employeeId is required" });
    }

    const query = {};
    if (email) query.email = email.toLowerCase();
    if (employeeId) query.employee_id = employeeId;

    const employee = await Employee.findOne(query);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new employee with auto-generated OR manual VT000X ID
export const addEmployee = async (req, res) => {
  try {
    // Validate input data
    const validationErrors = validateEmployeeData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Check for existing email
    const existing = await Employee.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // Use manual ID if provided, otherwise auto-generate
    let employee_id = req.body.employee_id;
    if (!employee_id) {
      employee_id = await generateEmployeeId();
    } else {
      // Validate manual employee ID format (VT000001, VT000002, etc.)
      const idRegex = /^VT\d{6}$/;
      if (!idRegex.test(employee_id)) {
        return res.status(400).json({ message: "Employee ID must be in format VT000001" });
      }
      // Check if manual ID already exists
      const existingId = await Employee.findOne({ employee_id });
      if (existingId) return res.status(400).json({ message: "Employee ID already exists" });
    }

    const employee = new Employee({
      employee_id,
      name: req.body.name.trim(),
      email: req.body.email.toLowerCase(),
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
    
    // Handle MongoDB validation errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    res.status(500).json({ message: err.message || "Internal server error" });
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
    if (req.body.education !== undefined) {
      const rawEducation = req.body.education;
      if (typeof rawEducation === "string" && rawEducation.trim() !== "") {
        try {
          employee.education = JSON.parse(rawEducation);
        } catch (parseErr) {
          return res.status(400).json({ message: "Invalid education data" });
        }
      }
    }

    // Update experience if provided
    if (req.body.experience !== undefined) {
      const rawExperience = req.body.experience;
      if (typeof rawExperience === "string" && rawExperience.trim() !== "") {
        try {
          employee.experience = JSON.parse(rawExperience);
        } catch (parseErr) {
          return res.status(400).json({ message: "Invalid experience data" });
        }
      }
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
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ message: err.message });
  }
};

// Export employees to Excel
export const exportEmployeesToExcel = async (req, res) => {
  try {
    const employees = await Employee.find().select(
      "employee_id name email phone designation department joining_date leaving_date current_ctc status"
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employees");

    // Add headers
    worksheet.columns = [
      { header: "Employee ID", key: "employee_id", width: 15 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Department", key: "department", width: 20 },
      { header: "Joining Date", key: "joining_date", width: 15 },
      { header: "Leaving Date", key: "leaving_date", width: 15 },
      { header: "Current CTC", key: "current_ctc", width: 15 },
      { header: "Status", key: "status", width: 10 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6E6FA" },
    };

    // Add data rows
    employees.forEach((employee) => {
      worksheet.addRow({
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone || "",
        designation: employee.designation || "",
        department: employee.department || "",
        joining_date: employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : "",
        leaving_date: employee.leaving_date ? new Date(employee.leaving_date).toLocaleDateString() : "",
        current_ctc: employee.current_ctc || "",
        status: employee.status,
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=employees.xlsx"
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({ message: "Failed to export employees to Excel" });
  }
};
