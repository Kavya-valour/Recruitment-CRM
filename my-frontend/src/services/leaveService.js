import api from "./api";

// Fetch all leaves
export const getAllLeaves = async () => {
  try {
    const res = await api.get("/leaves");
    return res.data;
  } catch (err) {
    console.error("Error fetching leave records:", err);
    throw err;
  }
};

// Add a leave
export const addLeave = async (leave) => {
  try {
    const res = await api.post("/leaves", leave);
    return res.data;
  } catch (err) {
    console.error("Error adding leave record:", err);
    throw err;
  }
};

// ✅ Update leave status (approve/reject)
export const updateLeave = async (leaveId, status) => {
  try {
    const res = await api.put(`/leaves/${leaveId}`, { status });
    return res.data;
  } catch (err) {
    console.error("Error updating leave:", err);
    throw err;
  }
};
