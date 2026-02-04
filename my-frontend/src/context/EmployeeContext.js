// src/context/EmployeeContext.js
import React, { createContext, useState, useEffect } from "react";
import employeeService from "../services/employeeService";

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      const newEmp = await employeeService.addEmployee(employeeData);
      setEmployees((prev) => [...prev, newEmp]);
    } catch (error) {
      console.error("Error adding employee:", error?.response?.data || error);
      throw error;
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      const updated = await employeeService.updateEmployee(id, employeeData);
      setEmployees((prev) => prev.map((emp) => (emp._id === id ? updated : emp)));
      return updated;
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  };

  const removeEmployee = async (id) => {
    try {
      await employeeService.deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    } catch (error) {
      console.error("Error deleting employee:", error?.response?.data || error);
      throw error;
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loading,
        getEmployees,   // ✅ renamed correctly for pages
        addEmployee,
        updateEmployee,
        removeEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
