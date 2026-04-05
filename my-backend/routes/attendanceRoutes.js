import express from "express";
import multer from "multer";
import {
  addAttendance,
  getAttendance,
  uploadCsv,
  updateAttendance,
  getAttendanceReport,
  exportAttendanceReportExcel,
} from "../controllers/attendanceController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ BASIC ROUTE
router.get("/", getAttendance);

// ✅ REPORT ROUTES (KEEP ABOVE DYNAMIC ROUTES)
router.get("/report", protect, authorize("admin", "hr"), getAttendanceReport);
router.get("/report/export", protect, authorize("admin", "hr"), exportAttendanceReportExcel);

// ✅ CREATE
router.post("/", protect, authorize("admin", "hr"), addAttendance);

// ✅ UPLOAD
router.post(
  "/upload",
  protect,
  authorize("admin", "hr"),
  upload.single("file"),
  uploadCsv
);

// ❗ ALWAYS KEEP PARAM ROUTES LAST
router.put("/:id", protect, authorize("admin", "hr"), updateAttendance);

export default router;