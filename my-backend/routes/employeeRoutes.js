import express from "express";
import multer from "multer";
import {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

// ✅ Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => Date.now() + "-" + file.originalname,
});
const upload = multer({ storage });

// Routes
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.post("/", addEmployee);

// ✅ Update employee with education & experience file support
router.put(
  "/:id",
  upload.fields([
    { name: "education", maxCount: 10 },
    { name: "experience", maxCount: 10 },
  ]),
  updateEmployee
);

router.delete("/:id", deleteEmployee);

export default router;
