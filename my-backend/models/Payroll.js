import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  basic: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  grossSalary: { type: Number },
  netSalary: { type: Number },
  status: { type: String, enum: ["Generated", "Paid"], default: "Generated" },
  payslipUrl: { type: String }, // optional PDF link
}, { timestamps: true });

export default mongoose.model("Payroll", payrollSchema);
