import express from "express";
import multer from "multer";
import { addAttendance, getAttendance, uploadCsv } from "../controllers/attendanceController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getAttendance);
router.post("/", addAttendance);           // Manual
router.post("/upload", upload.single("file"), uploadCsv);  // CSV

export default router;
