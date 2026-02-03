import React, { useContext, useEffect } from "react";
import { AttendanceContext } from "../context/AttendanceContext";
import AttendanceTable from "../components/AttendanceTable";
import MonthlyReport from "../components/MonthlyReport";

const AttendancePage = () => {
  const { attendance, getAttendance } = useContext(AttendanceContext);

  // Fetch attendance once on mount
  useEffect(() => {
    getAttendance();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Attendance Tracking</h1>

      {/* Attendance Table with CSV upload */}
      <AttendanceTable records={attendance} reload={getAttendance} />

      {/* Monthly Report */}
      <h2 className="text-xl font-semibold mt-6">Monthly Report</h2>
      <MonthlyReport records={attendance} />
    </div>
  );
};

export default AttendancePage;
