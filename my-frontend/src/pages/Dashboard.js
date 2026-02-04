// src/pages/Dashboard.js
import React, { useContext } from "react";
import { DashboardContext } from "../context/DashboardContext";
import Charts from "../components/Charts";

const Dashboard = () => {
  const { data, loading } = useContext(DashboardContext);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="text-center text-red-500 mt-10">Failed to load data</div>;
  }

  const { totals, employeeStats, payrollStats } = data;

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">HR Dashboard</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Employees", value: totals.totalEmployees, color: "bg-indigo-500" },
          { label: "Active Employees", value: totals.activeEmployees, color: "bg-green-500" },
          { label: "On Leave Today", value: totals.onLeave, color: "bg-yellow-500" },
          { label: "Payroll Generated", value: totals.payrollGenerated, color: "bg-pink-500" },
        ].map((item, index) => (
          <div
            key={index}
            className={`${item.color} text-white p-5 rounded-2xl shadow-md text-center`}
          >
            <h3 className="text-lg font-semibold">{item.label}</h3>
            <p className="text-3xl font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <Charts employeeStats={employeeStats} payrollStats={payrollStats} />
    </div>
  );
};

export default Dashboard;
