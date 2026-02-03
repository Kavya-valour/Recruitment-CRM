import express from "express";
import Employee from "../models/Employee.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Add Education
router.put("/:id", upload.fields([
  { name: "education", maxCount: 10 },
  { name: "experience", maxCount: 10 },
]), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Parse JSON from formData
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

    // Attach uploaded files if any
    if (req.files["education"]) {
      req.files["education"].forEach((file, i) => {
        employee.education[i].document = file.path;
      });
    }
    if (req.files["experience"]) {
      req.files["experience"].forEach((file, i) => {
        employee.experience[i].document = file.path;
      });
    }

    await employee.save();
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
