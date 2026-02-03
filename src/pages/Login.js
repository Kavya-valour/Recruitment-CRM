import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "hr",
    employeeId: "",
  });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        await api.post("/auth/register", {
          ...form,
          email: form.email.trim().toLowerCase(),
        });
        alert("✅ Registered successfully! Please log in.");
        setIsRegister(false);
      } else {
        const res = await api.post("/auth/login", {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });

        let userData = res.data.user;

        if (userData?.role === "employee" && !userData?.employeeId) {
          try {
            const empRes = await api.get("/employees/lookup", {
              params: { email: userData.email },
            });
            if (empRes?.data?.employee_id) {
              userData = { ...userData, employeeId: empRes.data.employee_id };
            }
          } catch (err) {
            console.error("Failed to resolve employee ID:", err);
          }
        }

        login(userData, res.data.token);
        navigate(userData?.role === "employee" ? "/employee-dashboard" : "/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2">
        {/* Left side - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isRegister ? "Create an account" : "Welcome Back"}
            </h1>
            <p className="text-gray-500">
              {isRegister
                ? "Fill in the information below to create your account"
                : "Log in to access your recruitment dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="hr">HR Manager</option>
                    <option value="admin">Administrator</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>
                {form.role === "employee" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      placeholder="VT000101"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                      onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="username@company.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle password visibility"
                >
                {showPassword ? (
                  /* Eye Off */
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 3L21 21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M9.88 5.09A9.77 9.77 0 0112 5c5 0 9.27 3.11 11 7-0.72 1.61-1.85 3.06-3.23 4.19"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M6.53 6.53C4.47 7.78 2.77 9.74 1 12c1.73 3.89 6 7 11 7 1.21 0 2.38-.19 3.48-.53"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  /* Eye */
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
                </button>
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-yellow-600 hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50"
            >
              {loading
                ? isRegister
                  ? "Creating Account..."
                  : "Signing In..."
                : isRegister
                ? "Create Account"
                : "Sign In"}
            </button>

           <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-yellow-600 font-medium hover:underline"
              >
                {isRegister ? "Sign In" : "Create Account"}
              </button>
            </p>
           </div>

          <p className="text-xs text-gray-400 text-center mt-8">
            © 2025 Recruitment CRM. All rights reserved.
          </p>
          </form>
        </div>

        {/* Right side - Image/Brand */}
        <div className="hidden md:block bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 p-12 relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 inline-block mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-yellow-500 font-bold text-xl">R</span>
                  </div>
                  <span className="text-white font-semibold text-lg">Recruitment CRM</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Streamline Your
                <br />
                Recruitment Process
              </h2>
              <p className="text-white/90 text-lg">
                Manage employees, track attendance, process payroll, and handle leaves - all in one powerful platform.
              </p>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Employee Management</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Automated Payroll Processing</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Smart Leave Management</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/80 text-sm">
              <span>Terms & Conditions</span>
              <span>•</span>
              <span>Privacy Policy</span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
