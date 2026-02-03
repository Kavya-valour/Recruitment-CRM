import express from "express";
import multer from "multer";
import { addAttendance, getAttendance, uploadCsv, getMonthlyReport, updateAttendance } from "../controllers/attendanceController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getAttendance);
router.get("/monthly-report", getMonthlyReport);
router.post("/", addAttendance);           // Manual
router.post("/upload", upload.single("file"), uploadCsv);  // CSV
router.put("/:id", updateAttendance);

export default router;
