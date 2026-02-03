import React, { useMemo } from "react";

/**
 * Company Leave Policy
 * You can change numbers without touching logic
 */
const LEAVE_POLICY = {
  Casual: 12,
  Sick: 10,
  Earned: 15,
  "Comp Off": 10,
  "Work From Home": 20,
  Maternity: 90,
  Paternity: 15,
  Marriage: 7,
  Bereavement: 7,
  "Loss of Pay": 0,
};

const LeaveBalanceCards = ({ leaves = [] }) => {
  /**
   * Calculate leave usage from approved leaves
   */
  const balances = useMemo(() => {
    const result = {};

    Object.keys(LEAVE_POLICY).forEach((type) => {
      result[type] = {
        total: LEAVE_POLICY[type],
        used: 0,
        remaining: LEAVE_POLICY[type],
      };
    });

    leaves.forEach((leave) => {
      if (leave.status !== "Approved") return;

      const type = leave.leaveType;
      if (!result[type]) return;

      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);

      const days =
        Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

      result[type].used += days;
      result[type].remaining =
        result[type].total - result[type].used;
    });

    return result;
  }, [leaves]);

  return (
    <div className="bg-white p-5 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">
        Leave Balance
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(balances).map(([type, data]) => (
          <div
            key={type}
            className="border rounded p-4 bg-gray-50"
          >
            <p className="font-medium text-gray-800">
              {type}
            </p>

            <div className="mt-2 text-sm">
              <p>
                Used:{" "}
                <span className="font-semibold">
                  {data.used}
                </span>
              </p>
              <p>
                Remaining:{" "}
                <span
                  className={`font-semibold ${
                    data.remaining < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {data.remaining}
                </span>
              </p>
            </div>

            {type === "Loss of Pay" && (
              <p className="text-xs text-gray-500 mt-2">
                Unpaid leave
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBalanceCards;
