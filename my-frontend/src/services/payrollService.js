import api from "./api";

export const getAllPayrolls = async () => {
  try {
    const res = await api.get("/payroll");
    return res.data;
  } catch (err) {
    console.error("Error fetching payrolls:", err);
    throw err;
  }
};

export const addPayroll = async (record) => {
  try {
    const res = await api.post("/payroll", record);
    return res.data;
  } catch (err) {
    console.error("Error adding payroll record:", err);
    throw err;
  }
};

// ✅ New function: Download payslip PDF
export const downloadPayslip = async (payrollId) => {
  try {
    const response = await api.get(`/payroll/${payrollId}/payslip`, {
      responseType: "blob", // important for downloading files
    });

    // create a temporary link to download the file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Payslip.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Error downloading payslip:", err);
    throw err;
  }
};
