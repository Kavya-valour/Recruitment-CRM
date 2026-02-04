import React, { useRef, useState, useContext } from "react";
import { uploadCsv } from "../services/attendanceService";
import { AttendanceContext } from "../context/AttendanceContext";

const AttendanceTable = ({ records = [], reload }) => {
  const { addAttendance } = useContext(AttendanceContext);
  const fileRef = useRef();

  // UI States
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [manual, setManual] = useState({
    employeeId: "",
    status: "Present",
    date: "",
    inTime: "",
    outTime: "",
  });
  const [manualError, setManualError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ---------------- CSV Upload ----------------
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    setSuccessMsg("");
    setManualError("");

    try {
      const res = await uploadCsv(file);
      if (res.error) {
        setUploadResult({ error: res.error });
        alert(res.error || "❌ Attendance upload failed");
      } else {
        setUploadResult({ created: res.created });
        setSuccessMsg(`✅ ${res.created} attendance records uploaded successfully!`);
        alert(`✅ ${res.created} attendance records uploaded successfully!`);
      }
      reload();
    } catch (err) {
      console.error("CSV upload failed:", err);
      setUploadResult({ error: "Upload failed, please check your file." });
      alert("❌ Upload failed, please check your file.");
    } finally {
      setUploading(false);
      fileRef.current.value = "";
    }
  };

  // ---------------- Manual Attendance Submit ----------------
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manual.employeeId || !manual.date) {
      setManualError("❌ Employee ID and Date are required.");
      return;
    }

    setSaving(true);
    setManualError("");
    setSuccessMsg("");

    try {
      await addAttendance({
        employeeId: manual.employeeId,
        date: manual.date,
        status: manual.status,
        inTime: manual.inTime,
        outTime: manual.outTime,
      });

      setSuccessMsg("✅ Attendance added successfully!");
      alert("✅ Attendance added successfully!");
      setManual({ employeeId: "", status: "Present", date: "", inTime: "", outTime: "" });
      reload();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Failed to add attendance.";
      setManualError(`❌ ${errorMsg}`);
      alert(`❌ ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white shadow rounded p-4 space-y-4">
      {/* Manual Attendance Form */}
      <form onSubmit={handleManualSubmit} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm font-medium">Employee ID</label>
          <input
            type="text"
            value={manual.employeeId}
            onChange={(e) => setManual({ ...manual, employeeId: e.target.value })}
            className="border rounded px-2 py-1"
            disabled={uploading}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            value={manual.date}
            onChange={(e) => setManual({ ...manual, date: e.target.value })}
            className="border rounded px-2 py-1"
            disabled={uploading}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            value={manual.status}
            onChange={(e) => setManual({ ...manual, status: e.target.value })}
            className="border rounded px-2 py-1"
            disabled={uploading}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">In Time</label>
          <input
            type="time"
            value={manual.inTime}
            onChange={(e) => setManual({ ...manual, inTime: e.target.value })}
            className="border rounded px-2 py-1"
            disabled={uploading}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Out Time</label>
          <input
            type="time"
            value={manual.outTime}
            onChange={(e) => setManual({ ...manual, outTime: e.target.value })}
            className="border rounded px-2 py-1"
            disabled={uploading}
          />
        </div>

        <button
          type="submit"
          className={`px-3 py-1 rounded text-white ${
            saving || uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={saving || uploading}
        >
          {saving ? "Saving..." : "Mark"}
        </button>
      </form>

      {/* Feedback Messages */}
      {manualError && <p className="text-red-500 text-sm">{manualError}</p>}
      {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

      {/* CSV Upload */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Upload CSV:</label>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleUpload}
            disabled={saving}
            className="border rounded px-2 py-1"
          />
          {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
        </div>
        {uploadResult && (
          <div
            className={`text-sm ${
              uploadResult.error ? "text-red-500" : "text-green-600"
            }`}
          >
            {uploadResult.error ||
              `✅ ${uploadResult.created} records processed successfully`}
          </div>
        )}
      </div>

      {/* Attendance Table */}
      <div className="overflow-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Employee</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">In Time</th>
              <th className="p-2 text-left">Out Time</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="p-2">{r.employeeId?.name || r.employeeId}</td>
                  <td
                    className={`p-2 font-semibold ${
                      r.status === "Present"
                        ? "text-green-600"
                        : r.status === "Absent"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {r.status || "-"}
                  </td>
                  <td className="p-2">{r.inTime || "-"}</td>
                  <td className="p-2">{r.outTime || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
