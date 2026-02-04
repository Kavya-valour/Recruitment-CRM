import React, { useContext, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { LeaveContext } from "../context/LeaveContext";

const LeaveSchema = Yup.object().shape({
  employeeId: Yup.string().required("Employee ID required"),
  leaveType: Yup.string().required("Leave Type required"),
  fromDate: Yup.date().required("From Date required"),
  toDate: Yup.date()
    .required("To Date required")
    .min(Yup.ref("fromDate"), "End date must be after start date"),
  reason: Yup.string(),
});

const LeaveForm = ({ initialLeaveType = "Casual", onApplied }) => {
  const { addLeave, getLeaves } = useContext(LeaveContext);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/employees")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h3 className="font-semibold mb-3">Apply Leave</h3>

      <Formik
        initialValues={{
          employeeId: "",
          leaveType: initialLeaveType,
          fromDate: "",
          toDate: "",
          reason: "",
        }}
        validationSchema={LeaveSchema}
        onSubmit={async (vals, { setSubmitting, resetForm }) => {
          try {
            await addLeave({
              employeeId: vals.employeeId,
              leaveType: vals.leaveType,
              fromDate: vals.fromDate,
              toDate: vals.toDate,
              reason: vals.reason,
              status: "Pending",
            });
            resetForm();
            getLeaves(); // refresh list
            if (onApplied) onApplied();
            alert("✅ Leave applied successfully");
          } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "❌ Failed to apply leave");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm">Employee</label>
              <Field as="select" name="employeeId" className="mt-1 block w-full border px-2 py-1 rounded">
                <option value="">-- Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp.employee_id}>
                    {emp.name} ({emp.employee_id})
                  </option>
                ))}
              </Field>
              <ErrorMessage name="employeeId" component="div" className="text-xs text-red-500" />
            </div>

            <div>
              <label className="text-sm">Leave Type</label>
              <Field as="select" name="leaveType" className="mt-1 block w-full border px-2 py-1 rounded">
                <option>Casual</option>
                <option>Sick</option>
                <option>Earned</option>
              </Field>
            </div>

            <div>
              <label className="text-sm">From</label>
              <Field type="date" name="fromDate" className="mt-1 block w-full border px-2 py-1 rounded" />
            </div>

            <div>
              <label className="text-sm">To</label>
              <Field type="date" name="toDate" className="mt-1 block w-full border px-2 py-1 rounded" />
            </div>

            <div className="md:col-span-3">
              <label className="text-sm">Reason</label>
              <Field as="textarea" name="reason" rows="3" className="mt-1 block w-full border px-2 py-1 rounded" />
            </div>

            <div className="md:col-span-3 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Apply Leave
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LeaveForm;
