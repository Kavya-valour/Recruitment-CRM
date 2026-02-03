import React, { useContext, useEffect } from "react";
import { PayrollContext } from "../context/PayrollContext";
import SalaryUpdateForm from "../components/SalaryUpdateForm";
import { downloadPayslip } from "../services/payrollService";

const Payroll = () => {
  const { payrolls, getPayrolls } = useContext(PayrollContext);

  useEffect(() => {
    getPayrolls();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payroll Management</h1>

      {/* Generate payroll form */}
      <SalaryUpdateForm />

      {/* Payroll records */}
      <div className="mt-6 grid gap-4">
        {payrolls.length > 0 ? (
          payrolls.map((p) => (
            <div key={p._id} className="p-4 border rounded-lg shadow">
              <p><strong>Employee Name:</strong> {p.employeeName}</p>
              <p><strong>Employee ID:</strong> {p.formattedEmployeeId}</p>
              <p><strong>Designation:</strong> {p.designation}</p>
              <p><strong>Month:</strong> {p.month} {p.year}</p>
              <p><strong>Net Salary:</strong> ₹{p.netSalary?.toLocaleString()}</p>
              <p><strong>Status:</strong> {p.status}</p>

              <button
                onClick={() => downloadPayslip(p._id)}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Payslip (PDF)
              </button>
            </div>
          ))
        ) : (
          <p>No payroll records yet.</p>
        )}
      </div>
    </div>
  );
};

export default Payroll;
