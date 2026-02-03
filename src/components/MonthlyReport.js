import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const MonthlyReport = ({ records = [] }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attendance/monthly-report?month=${selectedMonth}&year=${selectedYear}`);
      setReport(response.data);
    } catch (error) {
      console.error("Failed to fetch monthly report:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) return <p className="text-gray-500">Loading monthly report...</p>;

  if (!report) return <p className="text-gray-500">No report available.</p>;

  return (
    <div className="bg-white shadow rounded p-4 space-y-4">
      {/* Month/Year Selector */}
      <div className="flex gap-4 items-center">
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
        <div>
          <label className="text-sm font-medium">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-2 py-1 ml-2"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - 2 + i}>
                {new Date().getFullYear() - 2 + i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <h3 className="text-sm font-medium text-blue-700">Total Employees</h3>
          <p className="text-2xl font-bold text-blue-900">{report.summary.totalEmployees}</p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <h3 className="text-sm font-medium text-green-700">Avg Attendance</h3>
          <p className="text-2xl font-bold text-green-900">{report.summary.averageAttendance}%</p>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <h3 className="text-sm font-medium text-purple-700">Report Period</h3>
          <p className="text-lg font-bold text-purple-900">
            {new Date(report.year, report.month - 1).toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Detailed Report Table */}
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
                <td className="p-2 font-medium">{emp.employeeId}</td>
                <td className="p-2">{emp.name}</td>
                <td className="p-2 text-center">{emp.totalWorkingDays}</td>
                <td className="p-2 text-center text-green-600 font-semibold">{emp.presentDays}</td>
                <td className="p-2 text-center text-red-600 font-semibold">{emp.absentDays}</td>
                <td className="p-2 text-center text-yellow-600 font-semibold">{emp.leaveDays}</td>
                <td className={`p-2 text-center font-semibold ${
                  parseFloat(emp.attendancePercentage) >= 85 ? "text-green-600" :
                  parseFloat(emp.attendancePercentage) >= 75 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {emp.attendancePercentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyReport;
