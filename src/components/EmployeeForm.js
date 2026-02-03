import React, { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { EmployeeContext } from "../context/EmployeeContext";

const EmployeeSchema = Yup.object().shape({
  employee_id: Yup.string().matches(/^VT\d{6}$/, "Format: VT000001").notRequired(),
  name: Yup.string().min(2, "Min 2 characters").required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().nullable(),
  designation: Yup.string(),
  department: Yup.string(),
  joining_date: Yup.string().required("Joining date required"),
  leaving_date: Yup.string().nullable(),
  current_ctc: Yup.number().min(10000, "Min 10,000").nullable(),
  status: Yup.string().oneOf(["Active", "Left"]).required("Status required"),
});

const EmployeeForm = ({ initialValues = null, onClose }) => {
  const { addEmployee, updateEmployee } = useContext(EmployeeContext);
  const [autoGenerate, setAutoGenerate] = useState(true);

  const startValues = initialValues || {
    employee_id: "",
    name: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    joining_date: "",
    leaving_date: "",
    current_ctc: "",
    status: "Active",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Add / Edit Employee</h3>

      <div className="mb-4 flex items-center gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={autoGenerate}
            onChange={(e) => setAutoGenerate(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">
            {autoGenerate ? "✅ Auto-Generate Employee ID" : "❌ Manual Employee ID"}
          </span>
        </label>
      </div>

      <Formik
        initialValues={startValues}
        validationSchema={EmployeeSchema}
        enableReinitialize
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            const payload = autoGenerate ? { ...values, employee_id: undefined } : values;

            if (initialValues && initialValues._id) {
              await updateEmployee(initialValues._id, payload);
              alert("✅ Employee updated successfully");
              if (onClose) onClose();
            } else {
              await addEmployee(payload);
              alert("✅ Employee added successfully");
              resetForm();
            }
          } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "❌ Failed to save employee");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3">Employee ID</h4>
              {!autoGenerate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="employee_id"
                    type="text"
                    placeholder="VT000101"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="employee_id"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: VT followed by 6 digits (e.g., VT000042)</p>
                </div>
              )}
              {autoGenerate && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  ✅ System will auto-generate Employee ID (VT000101, VT000102, etc.)
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Name", name: "name", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Phone", name: "phone", type: "tel" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label} {f.name === "name" || f.name === "email" ? <span className="text-red-500">*</span> : ""}
                    </label>
                    <Field
                      name={f.name}
                      type={f.type}
                      placeholder={f.label}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage
                      name={f.name}
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Job Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Designation", name: "designation", type: "text" },
                  { label: "Department", name: "department", type: "text" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label}
                    </label>
                    <Field
                      name={f.name}
                      type={f.type}
                      placeholder={f.label}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Employment Dates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Joining Date", name: "joining_date" },
                  { label: "Leaving Date (Optional)", name: "leaving_date" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label} {f.name === "joining_date" ? <span className="text-red-500">*</span> : ""}
                    </label>
                    <Field
                      name={f.name}
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage
                      name={f.name}
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Salary & Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current CTC
                  </label>
                  <Field
                    name="current_ctc"
                    type="number"
                    placeholder="1200000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="current_ctc"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Field
                    as="select"
                    name="status"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Left">Left</option>
                  </Field>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onClose && onClose()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Employee"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EmployeeForm;
