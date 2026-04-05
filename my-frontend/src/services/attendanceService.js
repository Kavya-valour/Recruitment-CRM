import api from "./api"; // axios instance


// ---------------- CSV Upload ----------------
export const uploadCsv = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/attendance/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // { created: number } or { error: string }
  } catch (error) {
    console.error("CSV upload failed:", error.response?.data || error.message);
    return {
      error:
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Upload failed",
    };
  }
};

// ---------------- Add Manual Attendance ----------------
export const addAttendance = async (attendanceData) => {
  try {
    const response = await api.post("/attendance", attendanceData);
    return response.data;
  } catch (error) {
    console.error("Add attendance failed:", error.response?.data || error.message);
    throw error;
  }
};

// ---------------- Get Attendance Records ----------------
export const getAttendanceRecords = async () => {
  try {
    const response = await api.get("/attendance");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    throw error;
  }
};

// ---------------- Get Attendance by Employee and Date ----------------
export const getAttendanceByEmployeeDate = async (employeeId, date) => {
  try {
    const response = await api.get("/attendance", { params: { employeeId, date } });
    return response.data; // array of matching records
  } catch (error) {
    console.error("Failed to fetch attendance by employee/date:", error);
    throw error;
  }
};

// ---------------- Update Attendance ----------------
export const updateAttendance = async (id, attendanceData) => {
  try {
    const response = await api.put(`/attendance/${id}`, attendanceData);
    return response.data;
  } catch (error) {
    console.error("Update attendance failed:", error.response?.data || error.message);
    throw error;
  }
};

// ---------------- Delete Attendance Record (optional) ----------------
export const deleteAttendance = async (id) => {
  try {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete attendance failed:", error);
    throw error;
  }
};

// ---------------- Get Weekly / Monthly / Yearly Report ----------------
export const getAttendanceReport = async (params) => {
  const token = localStorage.getItem("token");

  const response = await api.get("/attendance/report", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ---------------- Download Report as Excel ----------------
export const downloadAttendanceReportExcel = async (params) => {
  try {
    const token = localStorage.getItem("token");

    const response = await api.get("/attendance/report/export", {
      params,
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `attendance-${params.type || "monthly"}.xlsx`
    );

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error.response?.data || error.message);
    throw error;
  }
};