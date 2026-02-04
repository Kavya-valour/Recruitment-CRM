import React, { createContext, useState } from "react";
import axios from "axios";

export const LeaveContext = createContext();

export const LeaveProvider = ({ children }) => {
  const [leaves, setLeaves] = useState([]);

  // Get token once
  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };

  // Fetch all leaves (HR/Admin) OR filtered by backend
  const getLeaves = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/leaves",
        authHeaders
      );
      setLeaves(res.data);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  // Add a new leave (Employee)
  const addLeave = async (leaveData) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/leaves",
        leaveData,
        authHeaders
      );
      setLeaves((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error("Error adding leave:", err);
      throw err;
    }
  };

  // Update leave status (HR/Admin)
  const updateLeaveStatus = async (id, status) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/leaves/${id}`,
        { status },
        authHeaders
      );

      setLeaves((prev) =>
        prev.map((l) => (l._id === id ? res.data : l))
      );
    } catch (err) {
      console.error("Error updating leave status:", err);
    }
  };

  return (
    <LeaveContext.Provider
      value={{
        leaves,
        getLeaves,
        addLeave,
        updateLeaveStatus,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};
