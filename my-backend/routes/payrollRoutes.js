import express from "express";
import {
  getPayrolls,
  addPayroll,
  updatePayrollStatus,
  deletePayroll,
  generatePayslipPDF, // ✅ Import added
} from "../controllers/payrollController.js";

const router = express.Router();

router.get("/", getPayrolls);
router.post("/", addPayroll);
router.put("/:id", updatePayrollStatus);
router.delete("/:id", deletePayroll);
router.get("/:id/payslip", generatePayslipPDF); // ✅ Add route

export default router;
