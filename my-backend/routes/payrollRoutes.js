import express from "express";
import {
  getPayrolls,
  addPayroll,
  updatePayrollStatus,
  deletePayroll,
  generatePayslipPDF,
} from "../controllers/payrollController.js";

const router = express.Router();

router.get("/", getPayrolls);
router.post("/", addPayroll);
router.put("/:id", updatePayrollStatus);
router.get("/:id/payslip", generatePayslipPDF);
router.delete("/:id", deletePayroll);

export default router;
