import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { EmployeeContext } from "../context/EmployeeContext";

const EducationExperienceForm = ({ employeeId }) => {
  const { updateEmployee } = useContext(EmployeeContext);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch employee data when employeeId changes
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
        const emp = res.data;
        setEducation(emp.education || []);
        setExperience(emp.experience || []);
      } catch (err) {
        console.error("Error fetching employee data:", err);
      }
    };
    if (employeeId) fetchEmployee();
  }, [employeeId]);

  // ✅ Handle education/experience field change
  const handleChange = (type, index, field, value) => {
    const list = type === "education" ? [...education] : [...experience];
    list[index][field] = value;
    type === "education" ? setEducation(list) : setExperience(list);
  };

  // ✅ Add new entry
  const handleAdd = (type) => {
    const newEntry =
      type === "education"
        ? { degree: "", institute: "", year: "", document: null }
        : { company: "", role: "", years: "", document: null };
    type === "education"
      ? setEducation([...education, newEntry])
      : setExperience([...experience, newEntry]);
  };

  // ✅ Remove entry
  const handleRemove = (type, index) => {
    const list = type === "education" ? [...education] : [...experience];
    list.splice(index, 1);
    type === "education" ? setEducation(list) : setExperience(list);
  };

  // ✅ Save all details
  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("education", JSON.stringify(education));
      formData.append("experience", JSON.stringify(experience));

      // Attach any uploaded files
      education.forEach((edu, i) => {
        if (edu.document) formData.append(`educationDocs`, edu.document);
      });
      experience.forEach((exp, i) => {
        if (exp.document) formData.append(`experienceDocs`, exp.document);
      });

      await updateEmployee(employeeId, formData);
      alert("✅ Education & Experience updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 🎓 Education Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">🎓 Education</h3>
        {education.map((edu, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border rounded-lg">
            <input
              type="text"
              placeholder="Degree"
              className="border p-2 rounded"
              value={edu.degree}
              onChange={(e) => handleChange("education", i, "degree", e.target.value)}
            />
            <input
              type="text"
              placeholder="Institution"
              className="border p-2 rounded"
              value={edu.institution}
              onChange={(e) => handleChange("education", i, "institution", e.target.value)}
            />
            <input
              type="text"
              placeholder="Year"
              className="border p-2 rounded"
              value={edu.year}
              onChange={(e) => handleChange("education", i, "year", e.target.value)}
            />
            <input
              type="file"
              onChange={(e) => handleChange("education", i, "document", e.target.files[0])}
              className="border p-2 rounded"
            />
            <button
              onClick={() => handleRemove("education", i)}
              className="text-red-500 text-sm mt-1"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => handleAdd("education")}
          className="text-blue-600 text-sm font-medium"
        >
          + Add Education
        </button>
      </div>

      {/* 💼 Experience Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">💼 Experience</h3>
        {experience.map((exp, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border rounded-lg">
            <input
              type="text"
              placeholder="Company"
              className="border p-2 rounded"
              value={exp.company}
              onChange={(e) => handleChange("experience", i, "company", e.target.value)}
            />
            <input
              type="text"
              placeholder="Role"
              className="border p-2 rounded"
              value={exp.role}
              onChange={(e) => handleChange("experience", i, "role", e.target.value)}
            />
            <input
              type="text"
              placeholder="Years"
              className="border p-2 rounded"
              value={exp.years}
              onChange={(e) => handleChange("experience", i, "years", e.target.value)}
            />
            <input
              type="file"
              onChange={(e) => handleChange("experience", i, "document", e.target.files[0])}
              className="border p-2 rounded"
            />
            <button
              onClick={() => handleRemove("experience", i)}
              className="text-red-500 text-sm mt-1"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => handleAdd("experience")}
          className="text-blue-600 text-sm font-medium"
        >
          + Add Experience
        </button>
      </div>

      {/* ✅ Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          {loading ? "Saving..." : "Save Details"}
        </button>
      </div>
    </div>
  );
};

export default EducationExperienceForm;
