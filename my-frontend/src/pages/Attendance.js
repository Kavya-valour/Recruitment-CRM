import React, { useContext, useEffect } from "react";
import { AttendanceContext } from "../context/AttendanceContext";
import { AuthContext } from "../context/AuthContext";
import AttendanceTable from "../components/AttendanceTable";
import MonthlyReport from "../components/MonthlyReport";

const AttendancePage = () => {
  const { attendance, getAttendance } = useContext(AttendanceContext);
  const { user } = useContext(AuthContext);

  // Fetch attendance once on mount
  useEffect(() => {
  getAttendance();
}, [getAttendance]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Attendance Tracking</h1>

      {/* Attendance Table with CSV upload */}
      <AttendanceTable records={attendance} reload={getAttendance} />

      {/* Admin-only Reports */}
      {user?.role === "admin" && (
        <>
          <h2 className="text-xl font-semibold mt-6">Attendance Reports</h2>
          <MonthlyReport />
        </>
      )}
    </div>
  );
};

export default AttendancePage;
