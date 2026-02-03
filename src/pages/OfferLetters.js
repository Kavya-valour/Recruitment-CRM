import React, { useState, useEffect } from "react";
import axios from "axios";

const OfferLetter = () => {
  const [form, setForm] = useState({
    employeeName: "",
    relationPrefix: "S/O",
    fatherName: "",
    employeeAddress: "",
    designation: "",
    joiningDate: "",
    basic: "",
    hra: "",
    da: "",
    specialAllowance: "",
    offeredCtc: 1700000, // default CTC
    tds: ""
  });

  // Auto-calculate salary whenever CTC changes
  useEffect(() => {
    const ctc = Number(form.offeredCtc) || 0;
    const basic = ctc * 0.4;
    const hra = basic * 0.5;
    const da = basic * 0.035;
    const employerPF = basic * 0.12;
    const specialAllowance = ctc - (basic + hra + da + employerPF);
    const tds = ctc * 0.04;

    setForm(prev => ({
      ...prev,
      basic: Math.round(basic),
      hra: Math.round(hra),
      da: Math.round(da),
      specialAllowance: Math.round(specialAllowance),
      tds: Math.round(tds),
    }));
  }, [form.offeredCtc]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert address textarea to array
    const addressArray = form.employeeAddress
      .split("\n")
      .filter(line => line.trim() !== "");

    const payload = {
      ...form,
      employeeAddress: addressArray,
      basic: Number(form.basic),
      hra: Number(form.hra),
      da: Number(form.da),
      specialAllowance: Number(form.specialAllowance),
      offeredCtc: Number(form.offeredCtc),
      tds: Number(form.tds)
    };

    try {
      const res = await axios.post("/api/offer", payload);
      alert("Offer Letter Generated Successfully ✅");
      window.open(res.data.pdfUrl, "_blank");
    } catch (err) {
      alert("Error: " + err.response?.data?.message || err.message);
    }
  };

  const totalCTC = Number(form.basic) + Number(form.hra) + Number(form.da) + Number(form.specialAllowance);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Create Offer Letter</h2>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Employee Info */}
          <div className="bg-white p-4 rounded shadow space-y-4">
            <h3 className="font-semibold text-gray-700">Employee Information</h3>

            <label>Employee Name</label>
            <input
              name="employeeName"
              value={form.employeeName}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />

            <label>Relation Prefix</label>
            <select
              name="relationPrefix"
              value={form.relationPrefix}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="S/O">S/O</option>
              <option value="D/O">D/O</option>
              <option value="W/O">W/O</option>
            </select>

            <label>Father / Guardian Name</label>
            <input
              name="fatherName"
              value={form.fatherName}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />

            <label>Employee Address</label>
            <textarea
              name="employeeAddress"
              rows="4"
              placeholder="Line 1&#10;Line 2&#10;Line 3"
              value={form.employeeAddress}
              onChange={handleChange}
              className="w-full border rounded p-2"
            ></textarea>

            <label>Designation</label>
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />

            <label>Joining Date</label>
            <input
              type="date"
              name="joiningDate"
              value={form.joiningDate}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />

            {/* Salary input */}
            <label>CTC (Annual)</label>
            <input
              name="offeredCtc"
              type="number"
              value={form.offeredCtc}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        {/* Right Column: Dashboard Summary */}
        <aside className="bg-white rounded shadow p-6 flex flex-col justify-between h-fit">
          <h3 className="text-lg font-semibold text-center mb-4">CTC Summary</h3>
          <div className="space-y-2 text-gray-700">
            <p><strong>Basic:</strong> ₹{form.basic}</p>
            <p><strong>HRA:</strong> ₹{form.hra}</p>
            <p><strong>DA:</strong> ₹{form.da}</p>
            <p><strong>Special Allowance:</strong> ₹{form.specialAllowance}</p>
            <p><strong>TDS:</strong> ₹{form.tds}</p>
          </div>
          <hr className="my-3" />
          <div className="text-center">
            <p className="text-xl font-bold text-green-600">₹ {totalCTC.toLocaleString()}</p>
            <p className="text-gray-500 text-sm">Total CTC / Year</p>
          </div>
        </aside>

        {/* Submit Button */}
        <div className="md:col-span-3 text-center mt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Generate Offer Letter PDF
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferLetter;
