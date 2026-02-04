// src/components/Navbar.js
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-blue-700">
          Recruitment CRM
        </h1>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {user && (
            <>
              <span className="text-gray-700 text-sm">
                👋 Hi, <b>{user.name}</b> ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && user && (
        <div className="md:hidden bg-gray-100 px-6 py-3 flex flex-col gap-3">
          <span className="text-gray-700 text-sm">
            👋 Hi, <b>{user.name}</b> ({user.role})
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 text-sm w-full text-left"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
