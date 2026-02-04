import React, { useContext, useEffect } from "react";
import { LeaveContext } from "../context/LeaveContext";

const LeaveApproval = () => {
  const { leaves, getLeaves, updateLeaveStatus } = useContext(LeaveContext);

  useEffect(() => {
    getLeaves();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingLeaves = leaves.filter((l) => l.status === "Pending");

  const handleStatus = async (id, status) => {
    await updateLeaveStatus(id, status);
    getLeaves(); // refresh after action
  };

  if (!pendingLeaves.length) return <p>No pending leave requests.</p>;

  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="font-semibold mb-3">Pending Leave Approvals</h3>
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Employee</th>
            <th className="p-2 text-left">Leave Type</th>
            <th className="p-2 text-left">From</th>
            <th className="p-2 text-left">To</th>
            <th className="p-2 text-left">Reason</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingLeaves.map((leave) => (
            <tr key={leave._id} className="border-t hover:bg-gray-50">
              <td className="p-2">{leave.employeeId?.name || leave.employeeId}</td>
              <td className="p-2">{leave.leaveType}</td>
              <td className="p-2">{new Date(leave.fromDate).toLocaleDateString()}</td>
              <td className="p-2">{new Date(leave.toDate).toLocaleDateString()}</td>
              <td className="p-2">{leave.reason || "-"}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => handleStatus(leave._id, "Approved")}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatus(leave._id, "Rejected")}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveApproval;
