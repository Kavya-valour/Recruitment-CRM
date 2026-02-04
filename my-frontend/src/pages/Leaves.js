// src/pages/Leaves.js
import React, { useContext, useEffect, useState } from "react";
import { LeaveContext } from "../context/LeaveContext";
import LeaveForm from "../components/LeaveForm";
import LeaveApproval from "../components/LeaveApproval"; // Approval UI (approve/reject)
import LeavesDashboard from "../components/LeavesDashboard";
import LeaveCalendar from "../components/LeaveCalendar";
import CreateLeaveModal from "../components/CreateLeaveModal";

const Leaves = () => {
  const { leaves, getLeaves } = useContext(LeaveContext);
  const [prefillType, setPrefillType] = useState("Casual");
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLeaveType, setModalLeaveType] = useState("Annual");

  useEffect(() => {
    getLeaves();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCalendar = () => {
    setCalendarCollapsed(!calendarCollapsed);
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Leave Management</h1>

      {/* Dashboard (summary + create request) */}
      <LeavesDashboard
        leaves={leaves}
        onOpenModal={(type) => {
          setModalLeaveType(type);
          setIsModalOpen(true);
        }}
      />

      {/* Create Leave Modal */}
      <CreateLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialLeaveType={modalLeaveType}
      />

      {/* Leave Calendar - Main Feature */}
      <LeaveCalendar
        isCollapsed={calendarCollapsed}
        onToggle={toggleCalendar}
      />

      {/* Apply Leave Form */}
      <div id="leave-form" className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Apply for Leave</h2>
        <LeaveForm initialLeaveType={prefillType} />
      </div>

      {/* Pending Approvals (separate component) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Leave Approvals</h2>
        <LeaveApproval />
      </div>

      {/* Leave History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Leave History</h2>
        <div className="grid gap-4">
          {leaves.length === 0 ? (
            <p className="text-gray-500">No leave records found.</p>
          ) : (
            leaves.map((leave) => (
              <div key={leave._id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {leave.employeeId?.name || leave.employeeId}
                    </p>
                    <p className="text-sm text-gray-600">
                      {leave.leaveType} Leave • {leave.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(leave.fromDate).toLocaleDateString()} → {new Date(leave.toDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leave.status}
                  </div>
                </div>
                {leave.reason && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    "{leave.reason}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaves;
 