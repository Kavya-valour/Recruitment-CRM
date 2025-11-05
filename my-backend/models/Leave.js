import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId,ref: "Employee", required: true },
  leaveType: { type: String, enum: ["Casual", "Sick", "Earned"], default: "Casual" },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  reason: { type: String },
  appliedOn: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Leave", leaveSchema);
