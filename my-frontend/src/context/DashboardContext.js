// src/context/DashboardContext.js
import React, { createContext, useState, useEffect } from "react";
import { getDashboardData } from "../services/dashboardService";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardContext.Provider value={{ data, loading, fetchDashboardData }}>
      {children}
    </DashboardContext.Provider>
  );
};
