import express from "express";
import { getLeaves, applyLeave, updateLeave, deleteLeave } from "../controllers/leaveController.js";

const router = express.Router();

// Existing routes
router.get("/", getLeaves);
router.post("/", applyLeave);
router.put("/:id", updateLeave);
router.delete("/:id", deleteLeave);

// ✅ Add this new route
router.get("/:id", async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate("employeeId", "name employeeId");
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
