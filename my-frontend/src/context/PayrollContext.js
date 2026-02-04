import React, { createContext, useState } from "react";
import * as payrollService from "../services/payrollService";

export const PayrollContext = createContext();

export const PayrollProvider = ({ children }) => {
  const [payrolls, setPayrolls] = useState([]);

  const getPayrolls = async () => {
    try {
      const data = await payrollService.getAllPayrolls();
      setPayrolls(data);
    } catch (err) {
      console.error(err);
    }
  };

  const addPayroll = async (record) => {
    try {
      const newRec = await payrollService.addPayroll(record);
      setPayrolls((prev) => [...prev, newRec]);
      return newRec;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <PayrollContext.Provider value={{ payrolls, getPayrolls, addPayroll }}>
      {children}
    </PayrollContext.Provider>
  );
};
