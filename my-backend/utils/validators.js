export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

export const isPositiveNumber = (num) => {
  return typeof num === "number" && num >= 0;
};

export const isValidPhone = (phone) => {
  const re = /^[\+]?[0-9][\d]{7,15}$/;
  return re.test(phone);
};

export const isValidCTC = (ctc) => {
  return isPositiveNumber(ctc) && ctc >= 10000 && ctc <= 10000000; // Reasonable CTC range
};

export const isValidEmployeeId = (id) => {
  const re = /^VT\d{6}$/;
  return re.test(id);
};

export const isValidTime = (timeStr) => {
  const re = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return re.test(timeStr);
};

export const isValidLeaveType = (type) => {
  const validTypes = ["Casual", "Sick", "Earned"];
  return validTypes.includes(type);
};

export const isValidAttendanceStatus = (status) => {
  const validStatuses = ["Present", "Absent", "Leave"];
  return validStatuses.includes(status);
};

export const isValidEmployeeStatus = (status) => {
  const validStatuses = ["Active", "Left"];
  return validStatuses.includes(status);
};

// List of public holidays (YYYY-MM-DD format)
// In a real application, this would be stored in database or fetched from an API
const PUBLIC_HOLIDAYS = [
  '2025-01-01', // New Year's Day
  '2025-01-26', // Republic Day
  '2025-08-15', // Independence Day
  '2025-10-02', // Gandhi Jayanti
  '2025-12-25', // Christmas
  // Add more holidays as needed
];

export const isWeekend = (dateStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
};

export const isPublicHoliday = (dateStr) => {
  return PUBLIC_HOLIDAYS.includes(dateStr);
};

export const isNonWorkingDay = (dateStr) => {
  return isWeekend(dateStr) || isPublicHoliday(dateStr);
};

export const validateEmployeeData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (!isValidEmail(data.email)) {
    errors.push("Invalid email format");
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push("Invalid phone number format");
  }

  if (!isValidCTC(data.current_ctc)) {
    errors.push("CTC must be between 10,000 and 10,000,000");
  }

  if (!data.joining_date || !isValidDate(data.joining_date)) {
    errors.push("Valid joining date is required");
  }

  if (data.leaving_date && !isValidDate(data.leaving_date)) {
    errors.push("Invalid leaving date format");
  }

  if (data.status && !isValidEmployeeStatus(data.status)) {
    errors.push("Status must be 'Active' or 'Left'");
  }

  return errors;
};

export const validateAttendanceData = (data) => {
  const errors = [];

  if (!data.employeeId || !isValidEmployeeId(data.employeeId)) {
    errors.push("Valid employee ID is required");
  }

  if (!data.date || !isValidDate(data.date)) {
    errors.push("Valid date is required");
  }

  // NOTE: Commented out for testing - can mark attendance any day
  // Check if it's a weekend or public holiday
  // if (isNonWorkingDay(data.date)) {
  //   const dayType = isWeekend(data.date) ? "weekend" : "public holiday";
  //   errors.push(`Cannot mark attendance for ${dayType}. This is a non-working day.`);
  // }

  if (!isValidAttendanceStatus(data.status)) {
    errors.push("Invalid attendance status");
  }

  if (data.inTime && !isValidTime(data.inTime)) {
    errors.push("Invalid in-time format (HH:MM)");
  }

  if (data.outTime && !isValidTime(data.outTime)) {
    errors.push("Invalid out-time format (HH:MM)");
  }

  return errors;
};

export const validateLeaveData = (data) => {
  const errors = [];

  if (!data.employeeId || !isValidEmployeeId(data.employeeId)) {
    errors.push("Valid employee ID is required");
  }

  if (!isValidLeaveType(data.leaveType)) {
    errors.push("Invalid leave type");
  }

  if (!data.fromDate || !isValidDate(data.fromDate)) {
    errors.push("Valid from date is required");
  }

  if (!data.toDate || !isValidDate(data.toDate)) {
    errors.push("Valid to date is required");
  }

  if (new Date(data.fromDate) > new Date(data.toDate)) {
    errors.push("From date cannot be after to date");
  }

  return errors;
};

export const validatePayrollData = (data) => {
  const errors = [];

  if (!data.employeeId) {
    errors.push("Employee ID is required");
  }

  if (!data.month || !data.year) {
    errors.push("Month and year are required");
  }

  if (!isValidCTC(data.ctc)) {
    errors.push("Valid CTC is required");
  }

  return errors;
};
