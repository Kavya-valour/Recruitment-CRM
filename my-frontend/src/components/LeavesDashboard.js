import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

// Display mapping for the rough sketch → our backend types
const TYPE_MAP = [
  { display: "Annual", type: "Earned" },
  { display: "Sick", type: "Sick" },
  { display: "Client Call", type: "Casual" },
];

// Default per-employee policy (days/year).
const POLICY_DEFAULTS = { Casual: 10, Sick: 5, Earned: 7 };

const dayDiffInclusive = (from, to) => {
  const start = new Date(from);
  const end = new Date(to);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return isNaN(diff) ? 0 : Math.max(diff, 0);
};

const LeavesDashboard = ({ leaves = [], onCreateRequest, onOpenModal }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(TYPE_MAP[0].display);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const res = await api.get("/employees");
        setEmployees(res.data || []);
      } catch (e) {
        console.error("Failed to load employees", e);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const totals = useMemo(() => {
    const employeeCount = employees.length || 1; // avoid 0 totals when empty

    // Utilized days across all approved leaves per type (org-wide)
    const utilized = { Casual: 0, Sick: 0, Earned: 0 };
    (leaves || []).forEach((l) => {
      if (l.status === "Approved" && (l.leaveType === "Casual" || l.leaveType === "Sick" || l.leaveType === "Earned")) {
        utilized[l.leaveType] += dayDiffInclusive(l.fromDate, l.toDate);
      }
    });

    // Total policy = per-employee policy × employee count
    const total = {
      Casual: POLICY_DEFAULTS.Casual * employeeCount,
      Sick: POLICY_DEFAULTS.Sick * employeeCount,
      Earned: POLICY_DEFAULTS.Earned * employeeCount,
    };

    const remaining = {
      Casual: Math.max(total.Casual - utilized.Casual, 0),
      Sick: Math.max(total.Sick - utilized.Sick, 0),
      Earned: Math.max(total.Earned - utilized.Earned, 0),
    };

    return { total, utilized, remaining, employeeCount };
  }, [employees.length, leaves]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Leaves</h2>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-3 py-2"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {TYPE_MAP.map((t) => (
              <option key={t.display} value={t.display}>
                {t.display}
              </option>
            ))}
          </select>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              if (onOpenModal) onOpenModal(selectedType);
            }}
          >
            Create request
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Leave Type</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Utilized</th>
              <th className="p-2 text-left">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {TYPE_MAP.map((row) => (
              <tr key={row.type} className="border-t">
                <td className="p-2">{row.display}</td>
                <td className="p-2">{totals.total[row.type]}</td>
                <td className="p-2">{totals.utilized[row.type]}</td>
                <td className="p-2">{totals.remaining[row.type]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500 mt-3">
        {loading ? "Loading employees…" : `Based on ${totals.employeeCount} employee(s). Policy per employee: Casual ${POLICY_DEFAULTS.Casual}, Sick ${POLICY_DEFAULTS.Sick}, Earned ${POLICY_DEFAULTS.Earned}.`}
      </div>
    </div>
  );
};

export default LeavesDashboard;
