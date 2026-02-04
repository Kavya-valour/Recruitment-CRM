// src/components/EmployeeAttendanceCalendar.js
import React, { useMemo } from "react";

const EmployeeAttendanceCalendar = ({ attendance = [], leaves = [] }) => {
  const today = new Date();

  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  const month = today.getMonth();
  const year = today.getFullYear();

  /* ---- Map attendance by date ---- */
  const attendanceMap = useMemo(() => {
    const map = {};
    attendance.forEach((a) => {
      const d = new Date(a.date).toISOString().slice(0, 10);
      map[d] = a;
    });
    return map;
  }, [attendance]);

  /* ---- Find leave for a date ---- */
  const getLeaveForDate = (dateStr) => {
    return leaves.find((l) => {
      const from = new Date(l.fromDate).toISOString().slice(0, 10);
      const to = new Date(l.toDate).toISOString().slice(0, 10);
      return dateStr >= from && dateStr <= to && l.status === "Approved";
    });
  };

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="font-semibold mb-4">
        Attendance Calendar ({today.toLocaleString("default", { month: "long" })})
      </h2>

      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="font-medium text-gray-600">
            {d}
          </div>
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(year, month, i + 1);
          const dateStr = date.toISOString().slice(0, 10);

          const att = attendanceMap[dateStr];
          const leave = getLeaveForDate(dateStr);

          let bg = "bg-gray-100";
          let label = "";

          if (leave) {
            bg = "bg-yellow-200";
            label = leave.leaveType;
          } else if (att?.status === "Present") {
            bg = "bg-green-200";
          } else if (att?.status === "Absent") {
            bg = "bg-red-200";
          }

          return (
            <div
              key={dateStr}
              className={`p-2 rounded h-16 flex flex-col justify-between ${bg}`}
            >
              <span className="font-medium">{i + 1}</span>
              {label && (
                <span className="text-xs truncate">{label}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-200 rounded"></span> Present
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-200 rounded"></span> Leave
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-200 rounded"></span> Absent
        </span>
      </div>
    </div>
  );
};

export default EmployeeAttendanceCalendar;
