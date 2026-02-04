import React, { useMemo, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

/* Leave colors by TYPE */
const LEAVE_COLORS = {
  Casual: "bg-blue-200",
  Sick: "bg-red-200",
  Earned: "bg-purple-200",
  "Work From Home": "bg-green-200",
  "Loss of Pay": "bg-gray-300",
};

/* Status overlay colors */
const STATUS_COLORS = {
  Pending: "ring-2 ring-yellow-400",
  Approved: "ring-2 ring-green-500",
  Rejected: "ring-2 ring-red-500",
};

const LEAVE_TYPES = Object.keys(LEAVE_COLORS);

const EmployeeLeaveCalendar = ({ leaves = [], refreshLeaves }) => {
  const { user } = useContext(AuthContext);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  /* Modal state */
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [leaveType, setLeaveType] = useState("Casual");
  const [loading, setLoading] = useState(false);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  /* Map leaves by date */
  const leaveMap = useMemo(() => {
    const map = {};
    leaves.forEach((l) => {
      const start = new Date(l.fromDate);
      const end = new Date(l.toDate);

      for (
        let d = new Date(start);
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        map[d.toISOString().slice(0, 10)] = l;
      }
    });
    return map;
  }, [leaves]);

  /* Submit leave */
  const submitLeave = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);

      await api.post("/leaves", {
        employeeId: user.employeeId,
        leaveType,
        fromDate: selectedDate,
        toDate: selectedDate,
        status: "Pending",
      });

      alert("Leave request submitted for approval");
      setShowModal(false);
      setLeaveType("Casual");

      refreshLeaves && refreshLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="font-semibold mb-4">My Leave Calendar</h2>

      {/* Month selector */}
      <div className="flex gap-3 mb-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
            .map((m, i) => (
              <option key={i} value={i}>{m}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {[year, year - 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 text-sm">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="font-medium text-center">{d}</div>
        ))}

        {Array(firstDay).fill(null).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const dateStr = date.toISOString().slice(0, 10);

          const leave = leaveMap[dateStr];
          const isPast = dateStr < todayStr;

          return (
            <div
              key={day}
              onClick={() => {
                if (isPast || leave) return;
                setSelectedDate(dateStr);
                setShowModal(true);
              }}
              className={`h-16 p-1 border rounded text-xs
                ${leave ? LEAVE_COLORS[leave.leaveType] : "bg-gray-50"}
                ${leave?.status ? STATUS_COLORS[leave.status] : ""}
                ${isPast ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-blue-50"}
              `}
            >
              <div className="font-semibold">{day}</div>
              {leave && (
                <>
                  <div className="truncate">{leave.leaveType}</div>
                  <div className="text-[10px]">{leave.status}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-80">
            <h3 className="font-semibold mb-3">
              Apply Leave ({new Date(selectedDate).toDateString()})
            </h3>

            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="border w-full p-2 rounded mb-4"
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitLeave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaveCalendar;
