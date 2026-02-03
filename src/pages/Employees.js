import React, { useContext, useEffect, useState } from "react";
import { EmployeeContext } from "../context/EmployeeContext";
import EmployeeList from "../components/EmployeeList";
import EmployeeForm from "../components/EmployeeForm";
import EducationExperienceForm from "../components/EducationExperienceForm";

const Employees = () => {
  const { employees, getEmployees } = useContext(EmployeeContext);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    getEmployees();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Employee Management</h1>

      {/* ➕ Add New Employee */}
      <div className="bg-white p-5 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          ➕ Add New Employee
        </h2>
        <EmployeeForm onSuccess={getEmployees} />
      </div>

      {/* 👥 Employee List */}
      <div className="bg-white p-5 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">
          👥 Existing Employees
        </h2>
        <EmployeeList employees={employees} onSelect={setSelectedEmployee} />
      </div>

      {/* 🎓💼 Education & Experience Section */}
      {selectedEmployee ? (
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">
            🎓💼 Education & Experience for {selectedEmployee.name}
          </h2>
          <EducationExperienceForm employeeId={selectedEmployee._id} />
        </div>
      ) : (
        <p className="text-gray-500 mt-4">
          Select an employee from the list to edit Education & Experience details.
        </p>
      )}
    </div>
  );
};

export default Employees;
