import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Payroll from "../models/Payroll.js";

export const getDashboardData = async (req, res) => {
  try {
    // 1️⃣ Totals
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: "Active" });
    const onLeave = await Attendance.countDocuments({ date: new Date().toISOString().slice(0, 10), status: "Leave" });
    const payrollGenerated = await Payroll.countDocuments();

    // 2️⃣ Employee Stats (Joins per month)
    const employeeStats = await Employee.aggregate([
      {
        $group: {
          _id: { $month: "$joiningDate" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Convert month numbers to labels
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const formattedEmployeeStats = employeeStats.map(item => ({
      month: monthNames[item._id - 1],
      count: item.count,
    }));

    // 3️⃣ Payroll Stats (Salary processed per month)
    const payrollStats = await Payroll.aggregate([
      {
        $group: {
          _id: { $month: "$generatedAt" },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const formattedPayrollStats = payrollStats.map(item => ({
      month: monthNames[item._id - 1],
      amount: item.amount,
    }));

    // ✅ Response Shape (matches your frontend)
    res.json({
      totals: { totalEmployees, activeEmployees, onLeave, payrollGenerated },
      employeeStats: formattedEmployeeStats,
      payrollStats: formattedPayrollStats,
    });

  } catch (error) {
    console.error("Error in getDashboardData:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
  }
};
