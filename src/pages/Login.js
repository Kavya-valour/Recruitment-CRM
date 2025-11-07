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
  });
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // ✅ Register new user
        await api.post("/auth/register", form);
        alert("✅ Registered successfully! Please log in.");
        setIsRegister(false);
      } else {
        // ✅ Login existing user
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });
        login(res.data.user, res.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          {isRegister ? "Create Account" : "Recruitment CRM Login"}
        </h2>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full p-2 border rounded mb-3"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <select
                className="w-full p-2 border rounded mb-3"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border rounded mb-3"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded mb-3"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading
              ? isRegister
                ? "Registering..."
                : "Logging in..."
              : isRegister
              ? "Register"
              : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-600">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:underline"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
