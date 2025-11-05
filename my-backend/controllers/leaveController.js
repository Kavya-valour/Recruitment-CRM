import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";

// GET all leaves (HR/Admin)
export const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employeeId", "name employeeId");
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply Leave
export const applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, fromDate, toDate, reason } = req.body;
    const leave = new Leave({ employeeId, leaveType, fromDate, toDate, reason });
    const saved = await leave.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Leave Status + Adjust Balance
export const updateLeave = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Adjust only if status changes
    if (status === "Approved" && leave.status !== "Approved") {
      const emp = await Employee.findById(leave.employeeId);
      if (emp) {
        const leaveKey = leave.leaveType.toLowerCase();
        const validTypes = ["sick", "casual", "earned"];
        if (!validTypes.includes(leaveKey))
          return res.status(400).json({ message: `Invalid leave type: ${leave.leaveType}` });

        const days =
          (new Date(leave.toDate) - new Date(leave.fromDate)) /
            (1000 * 60 * 60 * 24) +
          1;

        const currentBalance = emp.leaveBalance?.[leaveKey] || 0;
        emp.leaveBalance[leaveKey] = Math.max(currentBalance - days, 0);

        await emp.save();
      }
    }

    // Restore if rejected after approval
    if (status === "Rejected" && leave.status === "Approved") {
      const emp = await Employee.findById(leave.employeeId);
      if (emp) {
        const leaveKey = leave.leaveType.toLowerCase();
        const days =
          (new Date(leave.toDate) - new Date(leave.fromDate)) /
            (1000 * 60 * 60 * 24) +
          1;
        emp.leaveBalance[leaveKey] += days;
        await emp.save();
      }
    }

    leave.status = status;
    const updated = await leave.save();
    const updatedEmp = await Employee.findById(leave.employeeId).select("name leaveBalance");

    res.json({ leave: updated, employee: updatedEmp });
  } catch (error) {
    console.error("Error updating leave:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Leave
export const deleteLeave = async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: "Leave record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
