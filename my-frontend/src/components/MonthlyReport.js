import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getAttendanceReport,
  downloadAttendanceReportExcel,
} from "../services/attendanceService";

const MonthlyReport = () => {
  const currentYear = new Date().getFullYear();

  const [type, setType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const queryParams = useMemo(() => ({
    type,
    year: selectedYear,
    ...(type === "monthly" ? { month: selectedMonth } : {}),
    ...(type === "weekly"
      ? { month: selectedMonth, week: selectedWeek }
      : {}),
  }), [type, selectedYear, selectedMonth, selectedWeek]);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data = await getAttendanceReport(queryParams);
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch attendance report:", error);
      setReport(null);
      setErrorMsg(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load report"
      );
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDownloadExcel = async () => {
    try {
      await downloadAttendanceReportExcel(queryParams);
    } catch (error) {
      console.error("Failed to download attendance report:", error);
      alert("Failed to download attendance report in Excel format");
    }
  };

  return (
    <div className="bg-white shadow rounded p-4 space-y-4">

      {/* 🔹 FILTERS ALWAYS VISIBLE */}
      <div className="flex flex-wrap gap-4 items-end">

        <div>
          <label className="text-sm font-medium">Report Type:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded px-2 py-1 ml-2"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {(type === "monthly" || type === "weekly") && (
          <div>
            <label className="text-sm font-medium">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border rounded px-2 py-1 ml-2"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
        )}

        {type === "weekly" && (
          <div>
            <label className="text-sm font-medium">Week:</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="border rounded px-2 py-1 ml-2"
            >
              {Array.from({ length: 7 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Week {i + 1}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-2 py-1 ml-2"
          >
            {Array.from({ length: 7 }, (_, i) => currentYear - 3 + i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleDownloadExcel}
          className="bg-emerald-600 text-white px-4 py-2 rounded"
        >
          Download Excel
        </button>
      </div>

      {/* 🔴 ERROR */}
      {errorMsg && <p className="text-red-600">{errorMsg}</p>}

      {/* ⏳ LOADING */}
      {loading && <p className="text-gray-500">Loading attendance report...</p>}

      {/* 📊 REPORT */}
      {report ? (
        <>
          {/* SUMMARY */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded">
              <h3>Total Employees</h3>
              <p>{report.summary.totalEmployees}</p>
            </div>

            <div className="bg-green-50 p-3 rounded">
              <h3>Avg Attendance</h3>
              <p>{report.summary.averageAttendance}%</p>
            </div>

            <div className="bg-indigo-50 p-3 rounded">
              <h3>Report Period</h3>
              <p>{report.periodLabel}</p>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Employee ID</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-center">Working Days</th>
                  <th className="p-2 text-center">Present</th>
                  <th className="p-2 text-center">Absent</th>
                  <th className="p-2 text-center">Leave</th>
                  <th className="p-2 text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {report.report.map((emp) => (
                  <tr key={emp.employeeId} className="border-t hover:bg-gray-50">
                    <td className="p-2">{emp.employeeId}</td>
                    <td className="p-2">{emp.name}</td>
                    <td className="p-2 text-center">{emp.totalWorkingDays}</td>
                    <td className="p-2 text-center text-green-600">{emp.presentDays}</td>
                    <td className="p-2 text-center text-red-600">{emp.absentDays}</td>
                    <td className="p-2 text-center text-yellow-600">{emp.leaveDays}</td>
                    <td className="p-2 text-center">{emp.attendancePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No report available</p>
      )}
    </div>
  );
};

export default MonthlyReport;