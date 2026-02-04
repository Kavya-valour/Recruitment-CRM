// src/components/Charts.js
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const COLORS = ["#4F46E5", "#22C55E", "#EAB308", "#EF4444", "#06B6D4", "#F97316", "#A855F7"];

const Charts = ({ employeeStats = [], payrollStats = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {/* Employee Joins by Month */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          Monthly Employee Joins
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={employeeStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#4F46E5" name="Joins" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Payroll Radial Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          Monthly Payroll Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="90%"
            barSize={15}
            data={payrollStats}
            startAngle={180}
            endAngle={-180}
          >
            <PolarAngleAxis type="number" domain={[0, 'dataMax']} angleAxisId={0} tick={false} />
            <Tooltip />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" />
            {payrollStats.map((entry, index) => (
              <RadialBar
                key={`radial-${index}`}
                minAngle={15}
                background
                clockWise
                dataKey="amount"
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
