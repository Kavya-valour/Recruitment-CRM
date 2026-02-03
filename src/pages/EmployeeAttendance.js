import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import LeaveBalanceCards from "../components/LeaveBalanceCards";
import EmployeeLeaveCalendar from "../components/EmployeeLeaveCalendar";
import EmployeeAttendanceCalendar from "../components/EmployeeAttendanceCalendar";

/* Leave labels for UI clarity */
const LEAVE_LABELS = {
  Casual: "Casual Leave",
  Sick: "Sick Leave",
  Earned: "Earned Leave",
  "Comp Off": "Compensatory Off",
  "Work From Home": "Work From Home",
  Maternity: "Maternity Leave",
  Paternity: "Paternity Leave",
  Marriage: "Marriage Leave",
  Bereavement: "Bereavement Leave",
  "Loss of Pay": "Loss of Pay",
};

const EmployeeAttendance = () => {
  const { user } = useContext(AuthContext);
  const employeeId = user?.employeeId;

  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (!employeeId) {
    return <div className="p-6 text-red-600">Employee info missing</div>;
  }

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const today = new Date().toISOString().slice(0, 10);

  /* Fetch attendance + leaves */
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [attRes, leaveRes] = await Promise.all([
          api.get("/attendance", { params: { employeeId } }),
          api.get("/leaves"),
        ]);

        if (!mounted) return;

        const empLeaves = leaveRes.data.filter(
          (l) => l.employeeId?.employee_id === employeeId
        );

        setAttendance(attRes.data);
        setLeaves(empLeaves);

        setTodayRecord(
          attRes.data.find(
            (a) =>
              new Date(a.date).toISOString().slice(0, 10) === today
          ) || null
        );
      } catch {
        setError("Failed to load attendance data");
      } finally {
        mounted && setLoading(false);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, [employeeId, today]);

  /* Find leave for a date */
  const getLeaveForDate = (dateStr) =>
    leaves.find((l) => {
      const from = new Date(l.fromDate).toISOString().slice(0, 10);
      const to = new Date(l.toDate).toISOString().slice(0, 10);
      return dateStr >= from && dateStr <= to;
    });

  /* Monthly filter */
  const monthlyAttendance = useMemo(
    () =>
      attendance.filter((a) => {
        const d = new Date(a.date);
        return (
          d.getMonth() === selectedMonth &&
          d.getFullYear() === selectedYear
        );
      }),
    [attendance, selectedMonth, selectedYear]
  );

  /* Summary */
  const summary = useMemo(
    () => ({
      present: monthlyAttendance.filter((a) => a.status === "Present").length,
      absent: monthlyAttendance.filter((a) => a.status === "Absent").length,
      leave: monthlyAttendance.filter((a) => a.status === "Leave").length,
    }),
    [monthlyAttendance]
  );

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Attendance</h1>

      {/* Month selector */}
      <div className="flex gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
            .map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SummaryCard title="Present" value={summary.present} bg="bg-green-100" />
        <SummaryCard title="Absent" value={summary.absent} bg="bg-red-100" />
        <SummaryCard title="Leave" value={summary.leave} bg="bg-yellow-100" />
      </div>

      {/* ✅ Leave Balance */}
      <LeaveBalanceCards leaves={leaves} />

       <EmployeeLeaveCalendar
         cleaves={leaves}
         refreshLeaves={() => window.location.reload()}
        />



      {/* ✅ Employee Calendar */}
      <EmployeeAttendanceCalendar
        attendance={attendance}
        leaves={leaves}
      />

      {/* Attendance history */}
      <div className="bg-white p-5 rounded shadow">
        <h2 className="font-semibold mb-3">Attendance History</h2>

        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {monthlyAttendance.map((a) => {
              const dateStr = new Date(a.date).toISOString().slice(0, 10);
              const leave = a.status === "Leave" && getLeaveForDate(dateStr);

              return (
                <tr key={a._id}>
                  <td className="border p-2">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    {leave
                      ? LEAVE_LABELS[leave.leaveType]
                      : a.status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, bg }) => (
  <div className={`p-4 rounded shadow ${bg}`}>
    <p className="text-sm">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default EmployeeAttendance;
