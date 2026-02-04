import React, { createContext, useState } from "react";
import * as attendanceService from "../services/attendanceService";

export const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [attendance, setAttendance] = useState([]);

  // Fetch all attendance records from backend
  const getAttendance = async () => {
    try {
      const data = await attendanceService.getAttendanceRecords();
      setAttendance(data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  // Add a single attendance record (manual entry)
  const addAttendance = async (record) => {
    try {
      const newRecord = await attendanceService.addAttendance(record);
      setAttendance((prev) => [...prev, newRecord]);
    } catch (err) {
      console.error("Error adding attendance:", err);
    }
  };
  
  return (
    <AttendanceContext.Provider value={{ attendance, getAttendance, addAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
};
