import api from "./api";

// Named exports
export const getEmployees = async () => {
  const res = await api.get("/employees");
  return res.data;
};

export const addEmployee = async (data) => {
  const res = await api.post("/employees", data);
  return res.data?.employee || res.data;
};

export const updateEmployee = async (id, data) => {
  const res = await api.put(`/employees/${id}`, data);
  return res.data?.employee || res.data;
};

export const deleteEmployee = async (id) => {
  await api.delete(`/employees/${id}`);
};

export const getEmployee = async (id) => {
  const res = await api.get(`/employees/${id}`);
  return res.data;
};

// Default export for EmployeeContext
const employeeService = {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
};

export default employeeService;
