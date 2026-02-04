import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import path from "path";

// Import routes
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import payrollRoutes from "./routes/payrollRoutes.js";
import offerLetterRoutes from "./routes/offerLetterRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import educationExperienceRoutes from "./routes/educationExperience.js";

dotenv.config();
connectDB();

const app = express();

// ✅ Updated CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://recruitment-crm-lyart.vercel.app",
  process.env.FRONTEND_URL, // Add production frontend URL via env var
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(bodyParser.json());

// ✅ Serve uploaded files correctly (important for Render)
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/offer", offerLetterRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/education-experience", educationExperienceRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

console.log("✅ Mounting employee routes...");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
