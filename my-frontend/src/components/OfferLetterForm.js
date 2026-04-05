import React, { useEffect, useState } from "react";
import api from "../services/api";

const OfferLetterDashboardForm = () => {
  const [employees, setEmployees] = useState([]);
  const [ctc, setCtc] = useState(1700000);
  const [loading, setLoading] = useState(false);   
  const [pdfUrl, setPdfUrl] = useState("");        
  const [form, setForm] = useState({
    relationPrefix: "",   // default N/A
    employeeName: "",
    fatherName: "",
    employeeAddress: "",
    designation: "",
    joiningDate: "",
    basic: "",
    hra: "",
    da: "",
    specialAllowance: "",
    tds: "",
  });

  // Fetch employees
  useEffect(() => {
    api.get("/employees").then((res) => setEmployees(res.data));
  }, []);

  // Auto-calculate salary on CTC change
  useEffect(() => {
    const basic = ctc * 0.4;
    const hra = basic * 0.5;
    const da = basic * 0.035;
    const employerPF = basic * 0.12;
    const specialAllowance = ctc - (basic + hra + da + employerPF);
    const tds = ctc * 0.04;

    setForm((prev) => ({
      ...prev,
      basic: Math.round(basic),
      hra: Math.round(hra),
      da: Math.round(da),
      specialAllowance: Math.round(specialAllowance),
      tds: Math.round(tds),
    }));
  }, [ctc]);

  const handleEmployeeSelect = (id) => {
    const emp = employees.find((e) => e._id === id);
    if (emp) {
      setForm((prev) => ({
        ...prev,
        employeeName: emp.name,
        designation: emp.designation || "",
        employeeAddress: emp.address || "",
      }));
    }
  };

  const calculateCTC = () =>
    Number(form.basic || 0) +
    Number(form.hra || 0) +
    Number(form.da || 0) +
    Number(form.specialAllowance || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      relationPrefix: form.relationPrefix || "",   // N/A → empty
      fatherName: form.relationPrefix ? form.fatherName : "",
      employeeAddress: form.employeeAddress
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== ""),
      offeredCtc: calculateCTC(),
      basic: Number(form.basic),
      hra: Number(form.hra),
      da: Number(form.da),
      specialAllowance: Number(form.specialAllowance),
      tds: Number(form.tds),
    };

    try {
      const res = await api.post("/offer", payload);

      setPdfUrl(res.data.pdfUrl);   // ✅ preview
      window.open(res.data.pdfUrl, "_blank");

      alert("✅ Offer letter generated successfully");
    } catch {
      alert("❌ Failed to generate offer letter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <h1 className="text-2xl font-bold text-center mb-6">Generate Offer Letter</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Left Column: Employee Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Employee Information */}
          <div className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="font-semibold text-gray-700 mb-2">Employee Information</h2>
            <div>
              <label className="text-sm text-gray-600">Select Employee</label>
              <select
                className="w-full border rounded p-2 mt-1"
                onChange={(e) => handleEmployeeSelect(e.target.value)}
              >
                <option value="">-- Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employee_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-600">Relation Prefix</label>
                <select
                  value={form.relationPrefix}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      relationPrefix: e.target.value,
                      fatherName: e.target.value ? form.fatherName : "", // clear if N/A
                    })
                  }
                  className="w-full border rounded p-2 mt-1"
                >
                  <option value="">N/A</option>
                  <option value="S/O">S/O</option>
                  <option value="D/O">D/O</option>
                  <option value="W/O">W/O</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600">Father/Guardian Name</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.fatherName}
                  disabled={!form.relationPrefix}   // ✅ THIS LINE ADDED
                  onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Address</label>
              <textarea
                rows="3"
                className="w-full border rounded p-2 mt-1"
                value={form.employeeAddress}
                onChange={(e) => setForm({ ...form, employeeAddress: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Designation</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Joining Date</label>
                <input
                  type="date"
                  className="w-full border rounded p-2 mt-1"
                  value={form.joiningDate}
                  onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Salary Structure */}
          <div className="bg-white rounded shadow p-6 space-y-4">
            <h2 className="font-semibold text-gray-700 mb-2">Salary Structure</h2>
            <div>
              <label className="text-sm text-gray-600">CTC (₹)</label>
              <input
                type="number"
                className="w-full border rounded p-2 mt-1"
                value={ctc}
                onChange={(e) => setCtc(Number(e.target.value))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {["basic", "hra", "da", "specialAllowance", "tds"].map((key) => (
                <div key={key}>
                  <label className="text-sm text-gray-600">
                    {key === "basic" ? "Basic Salary" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type="number"
                    value={form[key]}
                    readOnly
                    className="w-full border rounded p-2 mt-1 bg-gray-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: CTC Dashboard */}
        <aside className="bg-white rounded shadow p-6 h-fit flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-center mb-4">CTC Summary</h3>
          <div className="space-y-2">
            <p>Basic: ₹{form.basic}</p>
            <p>HRA: ₹{form.hra}</p>
            <p>DA: ₹{form.da}</p>
            <p>Special Allowance: ₹{form.specialAllowance}</p>
            <p>TDS: ₹{form.tds}</p>
          </div>
          <hr className="my-3" />
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">₹ {calculateCTC().toLocaleString()}</p>
            <p className="text-gray-500 text-sm">Total CTC / Year</p>
          </div>
        </aside>

        {/* Submit Button */}
        <div className="md:col-span-3 text-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-md text-md hover:bg-blue-700"
          >
            {loading ? "Generating..." : "Generate Offer Letter"}
          </button>
          {pdfUrl && (
            <div className="mt-6 col-span-3">
              <h3 className="font-semibold mb-2">Preview</h3>
              <iframe src={pdfUrl} className="w-full h-[500px] border rounded"></iframe>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default OfferLetterDashboardForm;
