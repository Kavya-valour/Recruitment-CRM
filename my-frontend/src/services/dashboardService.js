import api from "./api";

export const getDashboardData = async () => {
  try {
    const res = await api.get("/dashboard");
    return res.data;
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    throw err;
  }
};
