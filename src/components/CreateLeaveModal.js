import React, { useContext, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../services/api";
import { LeaveContext } from "../context/LeaveContext";
import { AuthContext } from "../context/AuthContext";

const LeaveSchema = Yup.object().shape({
  employeeId: Yup.string().required("Employee ID required"),
  leaveType: Yup.string().required("Leave Type required"),
  fromDate: Yup.date().required("Start date required"),
  toDate: Yup.date()
    .required("End date required")
    .min(Yup.ref("fromDate"), "End date must be after start date"),
  manager: Yup.string(),
  note: Yup.string(),
});

const CreateLeaveModal = ({ isOpen, onClose, initialLeaveType = "Earned" }) => {
  const { addLeave, getLeaves } = useContext(LeaveContext);
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [isMultiDay, setIsMultiDay] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api
        .get("/employees")
        .then((res) => setEmployees(res.data || []))
        .catch((err) => console.error("Error fetching employees:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Type mapping: Annual → Earned, Client Call → Casual
  const typeMap = {
    Annual: "Earned",
    Sick: "Sick",
    "Client Call": "Casual",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Select leave type</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <Formik
            initialValues={{
              employeeId: "",
              leaveType: typeMap[initialLeaveType] || "Earned",
              fromDate: "",
              toDate: "",
              manager: "",
              note: "",
            }}
            validationSchema={LeaveSchema}
            onSubmit={async (vals, { setSubmitting, resetForm }) => {
              try {
                const payload = {
                  employeeId: vals.employeeId,
                  leaveType: vals.leaveType,
                  fromDate: vals.fromDate,
                  toDate: isMultiDay ? vals.toDate : vals.fromDate,
                  reason: vals.note,
                  status: "Pending",
                };
                await addLeave(payload);
                resetForm();
                getLeaves();
                onClose();
              } catch (err) {
                console.error("Error submitting leave:", err);
                alert(err.response?.data?.message || "Failed to submit leave request");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="space-y-6">
                {/* Leave Type - styled like sketch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      name="leaveType"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Earned">Annual</option>
                      <option value="Sick">Sick</option>
                      <option value="Casual">Client Call</option>
                    </Field>
                  </div>
                  <ErrorMessage name="leaveType" component="div" className="text-xs text-red-500 mt-1" />
                </div>

                {/* Employee Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    name="employeeId"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp.employee_id}>
                        {emp.name} ({emp.employee_id})
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="employeeId" component="div" className="text-xs text-red-500 mt-1" />
                </div>

                {/* One leave / More than one toggle */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMultiDay(false);
                      setFieldValue("toDate", values.fromDate);
                    }}
                    className={`px-4 py-2 rounded-lg border ${
                      !isMultiDay
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    • one leave
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMultiDay(true)}
                    className={`px-4 py-2 rounded-lg border ${
                      isMultiDay
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    • More than 1
                  </button>
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      start date <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="date"
                      name="fromDate"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        setFieldValue("fromDate", e.target.value);
                        if (!isMultiDay) {
                          setFieldValue("toDate", e.target.value);
                        }
                      }}
                    />
                    <ErrorMessage name="fromDate" component="div" className="text-xs text-red-500 mt-1" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      end date <span className="text-red-500">*</span>
                    </label>
                    <Field
                      type="date"
                      name="toDate"
                      disabled={!isMultiDay}
                      className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isMultiDay ? "bg-gray-100" : ""
                      }`}
                    />
                    <ErrorMessage name="toDate" component="div" className="text-xs text-red-500 mt-1" />
                    {!isMultiDay && (
                      <p className="text-xs text-gray-500 mt-1">(Will update Automatically)</p>
                    )}
                  </div>
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager
                  </label>
                  <Field
                    as="select"
                    name="manager"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Manager --</option>
                    {employees
                      .filter((e) => e.designation?.toLowerCase().includes("manager") || e.designation?.toLowerCase().includes("lead"))
                      .map((mgr) => (
                        <option key={mgr._id} value={mgr.employee_id}>
                          {mgr.name} ({mgr.designation})
                        </option>
                      ))}
                  </Field>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <Field
                    as="textarea"
                    name="note"
                    rows="3"
                    placeholder="Add reason or notes..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default CreateLeaveModal;
