import React, { useContext, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { PayrollContext } from "../context/PayrollContext";

const SalarySchema = Yup.object().shape({
  employeeId: Yup.string().required("Employee selection is required"),
  month: Yup.string().required("Month is required"),
  year: Yup.number()
    .min(2000, "Year must be >= 2000")
    .max(new Date().getFullYear(), `Year must be <= ${new Date().getFullYear()}`)
    .required("Year is required"),
});

const SalaryUpdateForm = () => {
  const { addPayroll } = useContext(PayrollContext);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [ctc, setCtc] = useState(1700000);
  const [salary, setSalary] = useState({});

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/employees");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  // Auto-calculate salary when CTC changes
  useEffect(() => {
    if (!ctc) return;
    const basic = Math.round(ctc * 0.4);
    const hra = Math.round(basic * 0.5);
    const da = Math.round(basic * 0.035);
    const employerPF = Math.round(basic * 0.12);
    const specialAllowance = Math.round(ctc - (basic + hra + da + employerPF));
    const tds = Math.round(ctc * 0.04);
    const totalEarnings = basic + hra + da + specialAllowance;
    const totalDeductions = employerPF + tds;
    const netPay = totalEarnings - totalDeductions;

    setSalary({ basic, hra, da, specialAllowance, tds, employerPF, totalEarnings, totalDeductions, netPay });
  }, [ctc]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Generate Payroll / Payslip</h3>

      <Formik
        initialValues={{ employeeId: "", month: "", year: new Date().getFullYear() }}
        validationSchema={SalarySchema}
        onSubmit={async (vals, { setSubmitting, resetForm }) => {
          if (!selectedEmployee) return;

          try {
            await addPayroll({
              ...vals,
              ctc,
              ...salary,
              employeeName: selectedEmployee.name,
              designation: selectedEmployee.designation,
              joiningDate: selectedEmployee.joiningDate,
              workLocation: selectedEmployee.workLocation || "Remote",
              status: "Generated",
            });

            resetForm();
            setSelectedEmployee(null);
            alert("✅ Payroll generated successfully");
          } catch (err) {
            console.error(err);
            alert("Error generating payroll");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Employee Selector */}
            <div className="md:col-span-3">
              <label className="text-sm">Employee</label>
              <Field
                as="select"
                name="employeeId"
                className="mt-1 block w-full border px-2 py-1 rounded"
                onChange={(e) => {
                  const id = e.target.value;
                  setFieldValue("employeeId", id);
                  const emp = employees.find(emp => emp._id === id);
                  setSelectedEmployee(emp || null);
                  if (emp?.ctc) setCtc(emp.ctc);
                }}
              >
                <option value="">-- Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.designation})
                  </option>
                ))}
              </Field>
              <ErrorMessage name="employeeId" component="div" className="text-xs text-red-500" />

              {selectedEmployee && (
                <div className="mt-3 p-3 border rounded bg-gray-50 text-sm">
                  <p><strong>Name:</strong> {selectedEmployee.name}</p>
                  <p><strong>Designation:</strong> {selectedEmployee.designation}</p>
                  <p><strong>Joining Date:</strong> {new Date(selectedEmployee.joiningDate).toLocaleDateString()}</p>
                  <p><strong>Work Location:</strong> {selectedEmployee.workLocation || "Remote"}</p>
                </div>
              )}
            </div>

            {/* Month & Year */}
            <div>
              <label>Month</label>
              <Field as="select" name="month" className="mt-1 block w-full border px-2 py-1 rounded">
                <option value="">-- Select Month --</option>
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Field>
              <ErrorMessage name="month" component="div" className="text-xs text-red-500" />
            </div>

            <div>
              <label>Year</label>
              <Field name="year" type="number" className="mt-1 block w-full border px-2 py-1 rounded" />
              <ErrorMessage name="year" component="div" className="text-xs text-red-500" />
            </div>

            {/* CTC input */}
            <div>
              <label>CTC (Annual)</label>
              <input
                type="number"
                value={ctc}
                onChange={(e) => setCtc(Number(e.target.value))}
                className="mt-1 block w-full border px-2 py-1 rounded"
              />
            </div>

            {/* Payslip Preview */}
            <div className="md:col-span-3 mt-4 p-4 border rounded bg-gray-50">
              <h4 className="font-semibold mb-2">Payslip Preview</h4>
              {selectedEmployee && values.month ? (
                <div className="text-sm">
                  <p><strong>Salary Slip - {values.month} {values.year}</strong></p>
                  <p><strong>Employee Name:</strong> {selectedEmployee.name}</p>
                  <p><strong>Designation:</strong> {selectedEmployee.designation}</p>
                  <p><strong>Joining Date:</strong> {new Date(selectedEmployee.joiningDate).toLocaleDateString()}</p>
                  <p><strong>Work Location:</strong> {selectedEmployee.workLocation || "Remote"}</p>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p><strong>Earnings</strong></p>
                      <p>Basic Salary: ₹{salary.basic?.toLocaleString()}</p>
                      <p>HRA: ₹{salary.hra?.toLocaleString()}</p>
                      <p>Dearness Allowance: ₹{salary.da?.toLocaleString()}</p>
                      <p>Special Allowance: ₹{salary.specialAllowance?.toLocaleString()}</p>
                      <p><strong>Total Earnings: ₹{salary.totalEarnings?.toLocaleString()}</strong></p>
                    </div>
                    <div>
                      <p><strong>Deductions</strong></p>
                      <p>Employee PF (12%): ₹{salary.employerPF?.toLocaleString()}</p>
                      <p>TDS: ₹{salary.tds?.toLocaleString()}</p>
                      <p><strong>Total Deductions: ₹{salary.totalDeductions?.toLocaleString()}</strong></p>
                      <p className="mt-2 text-green-600 font-bold">Net Take-Home Pay: ₹{salary.netPay?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Select employee and month to preview payslip</p>
              )}
            </div>

            <div className="md:col-span-3 text-right mt-3">
              <button
                type="submit"
                disabled={isSubmitting || !selectedEmployee || !values.month}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Generate Payslip
              </button>
            </div>

          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SalaryUpdateForm;
