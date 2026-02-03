import React, { useState, useEffect, useCallback, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const LEAVE_COLORS = {
  Casual: "bg-yellow-200 text-yellow-800",
  Sick: "bg-red-200 text-red-800",
  Earned: "bg-blue-200 text-blue-800",
  "Work From Home": "bg-cyan-200 text-cyan-800",
  "Comp Off": "bg-purple-200 text-purple-800",
  "Loss of Pay": "bg-gray-300 text-gray-800",
};

const LeaveCalendar = ({ isCollapsed = false, onToggle }) => {
  const { user } = useContext(AuthContext);

  const isEmployee = user?.role === "employee";
  const employeeId = user?.employeeId;

  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  /* ---------------- FETCH DATA ---------------- */
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/leaves/calendar/data?month=${selectedMonth}&year=${selectedYear}`
      );

      let data = response.data.calendarData || {};

      // ✅ FILTER FOR EMPLOYEE LOGIN
      if (isEmployee && employeeId) {
        Object.keys(data).forEach((date) => {
          data[date] = data[date].filter(
            (l) => l.employeeId === employeeId || l.employeeId?._id === employeeId
          );
          if (data[date].length === 0) delete data[date];
        });
      }

      setCalendarData(data);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, isEmployee, employeeId]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  /* ---------------- CALENDAR HELPERS ---------------- */
  const getDaysInMonth = (month, year) =>
    new Date(year, month, 0).getDate();

  const getFirstDayOfMonth = (month, year) =>
    new Date(year, month - 1, 1).getDay();

  /* ---------------- RENDER CALENDAR ---------------- */
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const calendarDays = [];

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="h-24 border bg-gray-50"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayLeaves = calendarData[dateStr] || [];
      const isToday = new Date().toISOString().slice(0, 10) === dateStr;

      calendarDays.push(
        <div
          key={day}
          className={`h-24 border p-1 cursor-pointer hover:bg-blue-50 ${
            isToday ? "bg-blue-100 border-blue-300" : "bg-white"
          }`}
          onClick={() => setSelectedDate(dateStr)}
        >
          <div className="text-sm font-medium mb-1">{day}</div>

          {dayLeaves.slice(0, 2).map((leave, idx) => (
            <div
              key={idx}
              className={`text-xs px-1 py-0.5 rounded truncate ${
                LEAVE_COLORS[leave.leaveType] || "bg-gray-200"
              }`}
            >
              {leave.leaveType}
            </div>
          ))}

          {dayLeaves.length > 2 && (
            <div className="text-xs text-gray-500">
              +{dayLeaves.length - 2} more
            </div>
          )}
        </div>
      );
    }

    return calendarDays;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">
          {isEmployee ? "My Leave Calendar" : "Leave Calendar"}
        </h2>

        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border p-2 rounded"
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border p-2 rounded"
          >
            {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-gray-100 text-center text-sm font-medium">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="p-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 border">
        {loading ? (
          <div className="col-span-7 p-10 text-center text-gray-500">
            Loading calendar...
          </div>
        ) : (
          renderCalendar()
        )}
      </div>

      {/* DETAILS */}
      {selectedDate && calendarData[selectedDate] && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">
            {new Date(selectedDate).toDateString()}
          </h3>

          {calendarData[selectedDate].map((leave, i) => (
            <div
              key={i}
              className={`p-2 mb-2 rounded ${
                LEAVE_COLORS[leave.leaveType] || "bg-gray-200"
              }`}
            >
              <div className="font-medium">{leave.leaveType}</div>
              <div className="text-xs">
                Status: {leave.status || "Pending"}
              </div>

              {!isEmployee && (
                <div className="text-xs text-gray-600">
                  {leave.employeeName} ({leave.employeeId})
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveCalendar;
