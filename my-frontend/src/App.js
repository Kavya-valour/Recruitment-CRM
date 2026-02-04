// src/App.js
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";
import OfferLetters from "./pages/OfferLetters";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeAttendance from "./pages/EmployeeAttendance";

import { AuthContext } from "./context/AuthContext";

const App = () => {
  const { user } = useContext(AuthContext);

  /* ---------- AUTHENTICATED LAYOUT ---------- */
  const AuthenticatedLayout = ({ children }) => (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );

  return (
    <Routes>
      {/* ---------- ROOT ---------- */}
      <Route
        path="/"
        element={
          user ? (
            user.role === "employee" ? (
              <Navigate to="/employee-dashboard" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* ---------- LOGIN ---------- */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />}
      />

      {/* ---------- EMPLOYEE ROUTES ---------- */}
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee-attendance"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <AuthenticatedLayout>
              <EmployeeAttendance />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* ---------- HR + ADMIN ROUTES ---------- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["hr", "admin"]}>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AuthenticatedLayout>
              <Employees />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={["hr", "admin"]}>
            <AuthenticatedLayout>
              <Attendance />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaves"
        element={
          <ProtectedRoute allowedRoles={["hr", "admin"]}>
            <AuthenticatedLayout>
              <Leaves />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payroll"
        element={
          <ProtectedRoute allowedRoles={["hr", "admin"]}>
            <AuthenticatedLayout>
              <Payroll />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/offerletters"
        element={
          <ProtectedRoute allowedRoles={["hr", "admin"]}>
            <AuthenticatedLayout>
              <OfferLetters />
            </AuthenticatedLayout>
          </ProtectedRoute>
        }
      />

      {/* ---------- FALLBACK ---------- */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
