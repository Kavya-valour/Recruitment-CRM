import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    ...(role === "employee"
      ? [
          { path: "/employee-dashboard", label: "Dashboard" },
          { path: "/employee-attendance", label: "My Attendance" },
        ]
      : []),

    ...(role === "hr" || role === "admin"
      ? [
          { path: "/dashboard", label: "Dashboard" },
          { path: "/attendance", label: "Attendance" },
          { path: "/leaves", label: "Leave Approval" },
        ]
      : []),

    ...(role === "admin"
      ? [
          { path: "/employees", label: "Employees" },
          { path: "/payroll", label: "Payroll" },
          { path: "/offerletters", label: "Offer Letters" },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        HR Panel
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? "bg-gray-700" : "hover:bg-gray-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
};

export default Sidebar;
