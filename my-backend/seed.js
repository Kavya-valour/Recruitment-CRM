import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "./models/Employee.js";
import Attendance from "./models/Attendance.js";
import Leave from "./models/Leave.js";
import Payroll from "./models/Payroll.js";
import OfferLetter from "./models/OfferLetter.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for seeding");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await Employee.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Payroll.deleteMany();
    await OfferLetter.deleteMany();
    await User.deleteMany();

    console.log("🧹 Cleared existing data");

    // Create sample employees
    const employees = [
      {
        employee_id: "VT0001",
        name: "Rajesh Kumar",
        email: "rajesh.kumar@valourtech.com",
        phone: "+91-9876543210",
        designation: "Senior Software Engineer",
        department: "Development",
        joining_date: "2024-01-15",
        current_ctc: 850000,
        status: "Active",
        education: [
          {
            degree: "B.Tech Computer Science",
            institute: "IIT Delhi",
            startDate: "2016-08-01",
            endDate: "2020-05-30"
          },
          {
            degree: "M.Tech Software Engineering",
            institute: "IIT Bombay",
            startDate: "2020-08-01",
            endDate: "2022-05-30"
          }
        ],
        experience: [
          {
            company: "Tech Solutions Pvt Ltd",
            role: "Software Engineer",
            startDate: "2022-06-01",
            endDate: "2023-12-31"
          }
        ]
      },
      {
        employee_id: "VT0002",
        name: "Priya Sharma",
        email: "priya.sharma@valourtech.com",
        phone: "+91-9876543211",
        designation: "HR Manager",
        department: "HR",
        joining_date: "2023-08-10",
        current_ctc: 650000,
        status: "Active",
        education: [
          {
            degree: "MBA Human Resources",
            institute: "Delhi University",
            startDate: "2018-08-01",
            endDate: "2020-05-30"
          },
          {
            degree: "B.Com",
            institute: "Delhi University",
            startDate: "2014-08-01",
            endDate: "2017-05-30"
          }
        ],
        experience: [
          {
            company: "Global HR Solutions",
            role: "HR Executive",
            startDate: "2020-06-01",
            endDate: "2023-07-31"
          }
        ]
      },
      {
        employee_id: "VT0003",
        name: "Amit Singh",
        email: "amit.singh@valourtech.com",
        phone: "+91-9876543212",
        designation: "UI/UX Designer",
        department: "Design",
        joining_date: "2024-03-01",
        current_ctc: 550000,
        status: "Active",
        education: [
          {
            degree: "B.Des Visual Communication",
            institute: "NID Ahmedabad",
            startDate: "2017-08-01",
            endDate: "2021-05-30"
          }
        ],
        experience: [
          {
            company: "Creative Design Studio",
            role: "Junior Designer",
            startDate: "2021-06-01",
            endDate: "2023-02-28"
          }
        ]
      },
      {
        employee_id: "VT0004",
        name: "Sneha Patel",
        email: "sneha.patel@valourtech.com",
        phone: "+91-9876543213",
        designation: "Project Manager",
        department: "Development",
        joining_date: "2023-11-15",
        current_ctc: 750000,
        status: "Active",
        education: [
          {
            degree: "M.Tech Computer Science",
            institute: "IIT Madras",
            startDate: "2015-08-01",
            endDate: "2017-05-30"
          },
          {
            degree: "B.Tech Information Technology",
            institute: "NIT Trichy",
            startDate: "2011-08-01",
            endDate: "2015-05-30"
          }
        ],
        experience: [
          {
            company: "Software Innovations Ltd",
            role: "Senior Developer",
            startDate: "2017-06-01",
            endDate: "2021-10-31"
          },
          {
            company: "TechCorp Solutions",
            role: "Team Lead",
            startDate: "2021-11-01",
            endDate: "2023-10-31"
          }
        ]
      },
      {
        employee_id: "VT0005",
        name: "Vikram Joshi",
        email: "vikram.joshi@valourtech.com",
        phone: "+91-9876543214",
        designation: "DevOps Engineer",
        department: "Infrastructure",
        joining_date: "2024-06-01",
        current_ctc: 700000,
        status: "Active",
        education: [
          {
            degree: "B.Tech Computer Engineering",
            institute: "VIT Vellore",
            startDate: "2016-08-01",
            endDate: "2020-05-30"
          }
        ],
        experience: [
          {
            company: "CloudTech Systems",
            role: "System Administrator",
            startDate: "2020-06-01",
            endDate: "2022-12-31"
          },
          {
            company: "DataFlow Solutions",
            role: "DevOps Engineer",
            startDate: "2023-01-01",
            endDate: "2024-05-31"
          }
        ]
      }
    ];

    const createdEmployees = await Employee.insertMany(employees);
    console.log(`✅ Created ${createdEmployees.length} employees`);

    // Create sample attendance data for current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const attendanceData = [];
    const workingDays = [1, 2, 3, 4, 5]; // Monday to Friday

    for (const employee of createdEmployees) {
      // Generate attendance for last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(currentYear, currentMonth, currentDate.getDate() - i);
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];

        // Only create attendance for working days and skip weekends/holidays
        if (workingDays.includes(dayOfWeek)) {
          try {
            const isPresent = Math.random() > 0.1; // 90% attendance rate
            await Attendance.create({
              employeeId: employee.employee_id,
              date: dateStr,
              status: isPresent ? "Present" : "Absent",
              inTime: isPresent ? "09:30" : null,
              outTime: isPresent ? "18:30" : null
            });
            attendanceData.push({
              employeeId: employee.employee_id,
              date: dateStr,
              status: isPresent ? "Present" : "Absent"
            });
          } catch (error) {
            // Skip if duplicate (attendance already exists for this date)
            if (error.code !== 11000) {
              console.error(`Error creating attendance for ${employee.employee_id} on ${dateStr}:`, error.message);
            }
          }
        }
      }
    }

    console.log(`✅ Created ${attendanceData.length} attendance records`);

    // Create sample leave requests (including current month)
    const now = new Date();
    const leaveMonth = now.getMonth() + 1; // 1-based
    const leaveYear = now.getFullYear();

    const getLeaveSubType = (leaveType) => {
      switch (leaveType) {
        case "Casual":
          return "Personal";
        case "Sick":
          return "Medical Test";
        case "Earned":
          return "Vacation";
        default:
          return "Other";
      }
    };

    const leaveData = [
      {
        employeeId: createdEmployees[0]._id,
        leaveType: "Casual",
        leaveSubType: getLeaveSubType("Casual"),
        fromDate: `${leaveYear}-${String(leaveMonth).padStart(2, '0')}-15`,
        toDate: `${leaveYear}-${String(leaveMonth).padStart(2, '0')}-16`,
        status: "Approved",
        reason: "Family function"
      },
      {
        employeeId: createdEmployees[1]._id,
        leaveType: "Sick",
        leaveSubType: getLeaveSubType("Sick"),
        fromDate: `${leaveYear}-${String(leaveMonth).padStart(2, '0')}-20`,
        toDate: `${leaveYear}-${String(leaveMonth).padStart(2, '0')}-20`,
        status: "Approved",
        reason: "Medical checkup"
      },
      {
        employeeId: createdEmployees[2]._id,
        leaveType: "Casual",
        leaveSubType: getLeaveSubType("Casual"),
        fromDate: `${leaveYear}-${String(leaveMonth).padStart(2, '0')}-25`,
        toDate: `${leaveYear}-${String(leaveMonth).padStart(2, '0')}-26`,
        status: "Approved",
        reason: "Personal work"
      },
      {
        employeeId: createdEmployees[3]._id,
        leaveType: "Earned",
        leaveSubType: getLeaveSubType("Earned"),
        fromDate: `${leaveYear}-${String(leaveMonth).padStart(2, '0')}-10`,
        toDate: `${leaveYear}-${String(leaveMonth).padStart(2, '0')}-10`,
        status: "Approved",
        reason: "Family emergency"
      },
      {
        employeeId: createdEmployees[4]._id,
        leaveType: "Sick",
        leaveSubType: getLeaveSubType("Sick"),
        fromDate: `${leaveYear}-${String(leaveMonth).padStart(2, '0')}-28`,
        toDate: `${leaveYear}-${String(leaveMonth).padStart(2, '0')}-28`,
        status: "Pending",
        reason: "Doctor appointment"
      }
    ];

    await Leave.insertMany(leaveData);
    console.log(`✅ Created ${leaveData.length} leave requests`);

    // Create sample payroll data
    const payrollData = [];
    createdEmployees.forEach(employee => {
      payrollData.push({
        employeeId: employee._id,
        formattedEmployeeId: employee.employee_id,
        month: "November",
        year: 2024,
        ctc: employee.current_ctc,
        basic: Math.round(employee.current_ctc * 0.4 / 12),
        hra: Math.round(employee.current_ctc * 0.4 * 0.5 / 12),
        da: Math.round(employee.current_ctc * 0.4 * 0.035 / 12),
        specialAllowance: Math.round(employee.current_ctc * 0.6 / 12),
        employerPF: Math.round(employee.current_ctc * 0.4 * 0.12 / 12),
        tds: Math.round(employee.current_ctc * 0.04 / 12),
        totalEarnings: Math.round(employee.current_ctc / 12),
        totalDeductions: Math.round((employee.current_ctc * 0.04 + employee.current_ctc * 0.4 * 0.12) / 12),
        netSalary: Math.round(employee.current_ctc / 12 * 0.96),
        grossSalary: Math.round(employee.current_ctc / 12),
        status: "Generated"
      });
    });

    await Payroll.insertMany(payrollData);
    console.log(`✅ Created ${payrollData.length} payroll records`);

    // Create sample offer letters
    const offerData = [
      {
        employeeName: "Rahul Verma",
        designation: "Full Stack Developer",
        joiningDate: "2025-01-15",
        offeredCtc: 600000,
        basic: 240000,
        hra: 72000,
        da: 8400,
        specialAllowance: 279600,
        tds: 24000,
        employeeAddress: ["123 MG Road", "Bangalore, Karnataka - 560001"],
        relationPrefix: "S/O",
        fatherName: "Mr. Ramesh Verma"
      },
      {
        employeeName: "Kavita Reddy",
        designation: "Business Analyst",
        joiningDate: "2025-02-01",
        offeredCtc: 550000,
        basic: 220000,
        hra: 66000,
        da: 7700,
        specialAllowance: 255300,
        tds: 22000,
        employeeAddress: ["456 Brigade Road", "Bangalore, Karnataka - 560025"],
        relationPrefix: "D/O",
        fatherName: "Mr. Suresh Reddy"
      }
    ];

    await OfferLetter.insertMany(offerData);
    console.log(`✅ Created ${offerData.length} offer letters`);

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin User",
      email: "admin@valourtech.com",
      password: hashedPassword,
      role: "admin"
    });
    console.log("✅ Created admin user (admin@valourtech.com / admin123)");

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Employees: ${createdEmployees.length}`);
    console.log(`   Attendance Records: ${attendanceData.length}`);
    console.log(`   Leave Requests: ${leaveData.length}`);
    console.log(`   Payroll Records: ${payrollData.length}`);
    console.log(`   Offer Letters: ${offerData.length}`);
    console.log(`   Users: 1`);

  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
};

const runSeeder = async () => {
  await connectDB();
  await seedData();
  process.exit(0);
};

runSeeder();