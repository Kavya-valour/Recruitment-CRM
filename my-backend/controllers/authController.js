import User from "../models/User.js";
import Employee from "../models/Employee.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ✅ Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role, employeeId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role, employeeId });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, employeeId: user.employeeId },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin resets user password
export const resetUserPassword = async (req, res) => {
  try {
    const { email, userId, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (!email && !userId) {
      return res.status(400).json({ message: "Email or userId is required" });
    }

    const query = {};
    if (email) query.email = email.toLowerCase();
    if (userId) query._id = userId;

    let user = await User.findOne(query);

    if (!user && email) {
      const employee = await Employee.findOne({ email: email.toLowerCase() });
      if (employee) {
        user = await User.findOneAndUpdate(
          { email: email.toLowerCase() },
          {
            name: employee.name,
            email: employee.email,
            role: "employee",
            employeeId: employee.employee_id,
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      }
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
