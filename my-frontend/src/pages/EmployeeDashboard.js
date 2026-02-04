import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  addAttendance,
  getAttendanceByEmployeeDate,
  updateAttendance,
} from "../services/attendanceService";

/* LEAVE SUB TYPES */
const LEAVE_SUB_TYPES = {
  Casual: ["Personal", "Emergency", "Travel"],
  Sick: ["Fever", "Hospital", "Medical Test"],
  Earned: ["Vacation", "Family Function", "Other"],
};

const EmployeeDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    leaveType: "Casual",
    leaveSubType: "Personal",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [attendanceSubmitting, setAttendanceSubmitting] = useState(false);

  const [attendanceState, setAttendanceState] = useState({
    mode: "create",
    recordId: null,
    date: "",
    status: "Present",
    inTime: "",
    outTime: "",
  });

  /* LOGOUT */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* LOAD DATA */
  useEffect(() => {
    loadEmployeeData();

    const today = new Date().toISOString().slice(0, 10);
    setAttendanceState((s) => ({
      ...s,
      date: today,
      status: "Present",
    }));
  }, []);

  const refreshAttendanceForDate = async (employeeId, date) => {
    if (!employeeId || !date) return;
    try {
      const records = await getAttendanceByEmployeeDate(employeeId, date);
      if (records?.length) {
        const r = records[0];
        setAttendanceState((s) => ({
          ...s,
          mode: "edit",
          recordId: r._id,
          date,
          status: r.status,
          inTime: r.inTime || "",
          outTime: r.outTime || "",
        }));
      } else {
        setAttendanceState((s) => ({
          ...s,
          mode: "create",
          recordId: null,
          date,
          status: "Present",
          inTime: "",
          outTime: "",
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadEmployeeData = async () => {
    try {
      setLoading(true);

      /* EMPLOYEE */
      const empRes = await api.get("/employees/lookup", {
        params: {
          employeeId: user.employeeId,
          email: user.email,
        },
      });
      const myEmployee = empRes.data;
      setEmployee(myEmployee);

      /* LEAVES */
      const leaveRes = await api.get("/leaves");
      const myLeaves = leaveRes.data.filter(
        (l) => {
          // Handle both populated and non-populated employeeId
          const empId = l.employeeId?.employee_id || l.employeeId;
          const targetId = myEmployee?.employee_id || user.employeeId;
          
          // If employeeId is ObjectId string, compare with employee._id
          if (typeof empId === 'string' && empId.length === 24 && empId === myEmployee?._id) {
            return true;
          }
          
          return empId === targetId;
        }
      );
      setLeaves(myLeaves);

      /* ATTENDANCE */
      if (myEmployee) {
        const today = new Date().toISOString().slice(0, 10);
        await refreshAttendanceForDate(myEmployee.employee_id, today);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* APPLY LEAVE */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const resolvedEmployeeId = employee?.employee_id || user?.employeeId;
      await api.post("/leaves", {
        employeeId: resolvedEmployeeId, // ✅ FIXED
        leaveType: formData.leaveType,
        leaveSubType: formData.leaveSubType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason,
        status: "Pending",
      });

      alert("✅ Leave applied successfully");

      setFormData({
        leaveType: "Casual",
        leaveSubType: "Personal",
        fromDate: "",
        toDate: "",
        reason: "",
      });

      loadEmployeeData();
    } catch (err) {
      alert(err.response?.data?.message || "Validation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto">

        {/* HEADER - Always visible */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-b-xl shadow-lg flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">
              Hi, {employee?.name || user?.name || "Employee"}
            </h1>
            <div className="flex items-center gap-4 text-blue-100">
              <span className="text-lg">
                <span className="font-semibold">Employee ID:</span> {employee?.employee_id || user?.employeeId || "Loading..."}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="bg-white p-12 rounded-xl shadow text-center">
              <p className="text-gray-600 text-lg">Loading your dashboard...</p>
            </div>
          ) : (
            <>

        {/* LEAVE BALANCE */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Leave Balance</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-sm text-green-700">Casual Leave</div>
              <div className="text-2xl font-bold text-green-800">
                {employee?.leaveBalance?.casual ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-sm text-blue-700">Sick Leave</div>
              <div className="text-2xl font-bold text-blue-800">
                {employee?.leaveBalance?.sick ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="text-sm text-yellow-700">Earned Leave</div>
              <div className="text-2xl font-bold text-yellow-800">
                {employee?.leaveBalance?.earned ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* APPLY LEAVE */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Apply for Leave</h2>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <select
              value={formData.leaveType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  leaveType: e.target.value,
                  leaveSubType: LEAVE_SUB_TYPES[e.target.value][0],
                })
              }
              className="border p-3 rounded"
            >
              <option>Casual</option>
              <option>Sick</option>
              <option>Earned</option>
            </select>

            <select
              value={formData.leaveSubType}
              onChange={(e) =>
                setFormData({ ...formData, leaveSubType: e.target.value })
              }
              className="border p-3 rounded"
            >
              {LEAVE_SUB_TYPES[formData.leaveType].map((sub) => (
                <option key={sub}>{sub}</option>
              ))}
            </select>

            <input
              type="date"
              value={formData.fromDate}
              onChange={(e) =>
                setFormData({ ...formData, fromDate: e.target.value })
              }
              className="border p-3 rounded"
              required
            />

            <input
              type="date"
              value={formData.toDate}
              onChange={(e) =>
                setFormData({ ...formData, toDate: e.target.value })
              }
              className="border p-3 rounded"
              required
            />

            <input
              type="text"
              placeholder="Reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="border p-3 rounded md:col-span-2"
            />

            <div className="md:col-span-2 text-right">
              <button
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                {submitting ? "Submitting..." : "Submit Leave"}
              </button>
            </div>
          </form>
        </div>

        {/* MARK ATTENDANCE */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (attendanceState.mode === "edit") {
                alert("Attendance already submitted for this date.");
                return;
              }
              setAttendanceSubmitting(true);

              try {
                const payload = {
                  employeeId: employee?.employee_id || user?.employeeId,
                  date: attendanceState.date,
                  status: attendanceState.status,
                  inTime: attendanceState.inTime,
                  outTime: attendanceState.outTime,
                };

                await addAttendance(payload);

                // If status is "Leave", auto-create a leave entry
                if (attendanceState.status === "Leave") {
                  try {
                    await api.post("/leaves", {
                      employeeId: payload.employeeId,
                      leaveType: "Casual",
                      leaveSubType: "Personal",
                      fromDate: attendanceState.date,
                      toDate: attendanceState.date,
                      reason: "Auto-generated from attendance",
                      status: "Approved",
                    });
                  } catch (leaveErr) {
                    console.error("Auto-leave creation failed:", leaveErr);
                  }
                }

                alert("✅ Attendance saved successfully");
                await refreshAttendanceForDate(
                  payload.employeeId,
                  attendanceState.date
                );
                loadEmployeeData(); // Refresh leave data
              } catch (err) {
                alert("❌ Error: " + (err.response?.data?.message || "Failed to save attendance"));
              } finally {
                setAttendanceSubmitting(false);
              }
            }}
            className="grid md:grid-cols-5 gap-4"
          >
            <input
              type="text"
              value={employee?.employee_id || user?.employeeId || ""}
              readOnly
              placeholder="Employee ID"
              className="border p-3 rounded bg-gray-50"
            />
            <input
              type="date"
              value={attendanceState.date}
              onChange={async (e) => {
                const selectedDate = e.target.value;
                const employeeId = employee?.employee_id || user?.employeeId;
                await refreshAttendanceForDate(employeeId, selectedDate);
              }}
              className="border p-3 rounded"
              required
            />
            <select
              value={attendanceState.status}
              onChange={(e) =>
                setAttendanceState({ ...attendanceState, status: e.target.value })
              }
              className="border p-3 rounded"
              disabled={attendanceState.mode === "edit"}
            >
              <option>Present</option>
              <option>Absent</option>
              <option>Leave</option>
            </select>
            <input
              type="time"
              value={attendanceState.inTime}
              onChange={(e) =>
                setAttendanceState({ ...attendanceState, inTime: e.target.value })
              }
              className="border p-3 rounded"
              disabled={attendanceState.mode === "edit"}
            />
            <input
              type="time"
              value={attendanceState.outTime}
              onChange={(e) =>
                setAttendanceState({
                  ...attendanceState,
                  outTime: e.target.value,
                })
              }
              className="border p-3 rounded"
              disabled={attendanceState.mode === "edit"}
            />

            <div className="md:col-span-5 flex justify-end">
              <button 
                type="submit"
                disabled={attendanceSubmitting || attendanceState.mode === "edit"}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {attendanceSubmitting ? "Submitting..." : "Submit Attendance"}
              </button>
            </div>
            {attendanceState.mode === "edit" && (
              <div className="md:col-span-5 text-right text-sm text-gray-500">
                Attendance already submitted for this date. Choose another date to submit again.
              </div>
            )}
          </form>
        </div>

        {/* LEAVE HISTORY */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">My Leave History</h2>

          {leaves.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No leave records found</p>
              <p className="text-sm mt-2">Apply for leave using the form above</p>
            </div>
          ) : (
            leaves.map((l) => (
              <div
                key={l._id}
                className="border p-4 rounded mb-3 flex justify-between"
              >
                <div>
                  <b>{l.leaveType}</b> – {l.leaveSubType}
                  <div className="text-sm text-gray-500">
                    {new Date(l.fromDate).toLocaleDateString()} →{" "}
                    {new Date(l.toDate).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded ${
                  l.status === "Approved" ? "bg-green-100 text-green-700" :
                  l.status === "Rejected" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {l.status}
                </span>
              </div>
            ))
          )}
        </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
