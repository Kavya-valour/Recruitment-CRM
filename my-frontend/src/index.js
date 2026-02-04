import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { EmployeeProvider } from "./context/EmployeeContext";
import { AttendanceProvider } from "./context/AttendanceContext";
import { LeaveProvider } from "./context/LeaveContext";
import { PayrollProvider } from "./context/PayrollContext";
import { DashboardProvider } from "./context/DashboardContext";
import { OfferLetterProvider } from "./context/OfferLetterContext";
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <DashboardProvider>
      <EmployeeProvider>
        <AttendanceProvider>
          <LeaveProvider>
            <PayrollProvider>
              <OfferLetterProvider>
                <AuthProvider>                  
                    <App />                  
                </AuthProvider>
              </OfferLetterProvider>
            </PayrollProvider>
          </LeaveProvider>
        </AttendanceProvider>
      </EmployeeProvider>
    </DashboardProvider>
  </BrowserRouter>
);


