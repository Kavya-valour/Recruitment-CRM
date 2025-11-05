export const isValidEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
};

export const isValidDate = (dateStr) => {
  return !isNaN(Date.parse(dateStr));
};

export const isPositiveNumber = (num) => {
  return typeof num === "number" && num >= 0;
};
