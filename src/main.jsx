import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { EmployeeProvider } from './context/EmployeeContext'
import { AttendanceProvider } from './context/AttendanceContext'
import { LeaveProvider } from './context/LeaveContext'
import { PayrollProvider } from './context/PayrollContext'
import { OfferLetterProvider } from './context/OfferLetterContext'
import { DashboardProvider } from './context/DashboardContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <EmployeeProvider>
            <AttendanceProvider>
              <LeaveProvider>
                <PayrollProvider>
                  <OfferLetterProvider>
                    <App />
                  </OfferLetterProvider>
                </PayrollProvider>
              </LeaveProvider>
            </AttendanceProvider>
          </EmployeeProvider>
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
