import axios from "axios";

// Support both Vite and legacy CRA env vars
const viteUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_BACKEND_URL : undefined;
const legacyUrl = typeof process !== 'undefined' ? process.env?.REACT_APP_BACKEND_URL : undefined;

const api = axios.create({
  baseURL: (viteUrl || legacyUrl || "http://localhost:5000/api").replace(/\/$/, ""),
  transformResponse: [
    (data) => {
      if (data === "" || data === null || data === undefined) return data;
      if (typeof data !== "string") return data;
      try {
        return JSON.parse(data);
      } catch (err) {
        return data;
      }
    },
  ],
});

// ✅ Intercept all requests to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
