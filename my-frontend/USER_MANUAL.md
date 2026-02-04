# Recruitment CRM User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Dashboard Overview](#dashboard-overview)
5. [Employee Management](#employee-management)
6. [Attendance Management](#attendance-management)
7. [Leave Management](#leave-management)
8. [Payroll Management](#payroll-management)
9. [Offer Letter Generation](#offer-letter-generation)
10. [Reports & Analytics](#reports--analytics)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

## Introduction

The Recruitment CRM is a comprehensive web-based application designed to streamline HR operations for Valour Technologies. It provides tools for managing employee data, tracking attendance, processing payroll, and generating official documents.

### Key Features
- Complete employee lifecycle management
- Automated attendance tracking
- Leave request and approval system
- Salary calculation with attendance-based deductions
- PDF document generation (payslips, offer letters)
- Real-time dashboard with analytics
- Excel export capabilities

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- PDF viewer for document downloads

### Login Process
1. Open your web browser and navigate to the application URL
2. Enter your email address and password
3. Click "Login" to access the system

### First Time Setup
- Change your default password upon first login
- Review your user permissions with your administrator
- Familiarize yourself with the navigation menu

## User Roles & Permissions

### HR Administrator
- Full access to all modules
- User management capabilities
- System configuration
- Generate all reports

### HR Manager
- Employee management
- Attendance oversight
- Leave approvals
- Payroll processing
- Report generation

### HR Executive
- View employee data
- Process attendance
- Handle leave requests
- Generate basic reports

## Dashboard Overview

The dashboard provides a quick overview of key HR metrics:

### KPI Cards
- **Total Employees**: Current headcount
- **Active Employees**: Employees currently employed
- **On Leave Today**: Employees on leave
- **Payroll Generated**: Recent payroll processing status

### Charts & Trends
- Monthly employee joining trends
- Payroll processing statistics
- Attendance patterns

### Quick Actions
- Access frequently used functions
- View pending approvals
- Check system notifications

## Employee Management

### Adding New Employees
1. Navigate to **Employees** → **Add Employee**
2. Fill in basic information:
   - Full name
   - Email address
   - Phone number
   - Designation
   - Department
   - Joining date
   - Current CTC
3. Add educational qualifications
4. Add work experience details
5. Upload supporting documents
6. Click **Save**

### Updating Employee Information
1. Go to **Employees** → **Employee List**
2. Search for the employee using filters
3. Click **Edit** next to the employee
4. Modify required information
5. Save changes

### Managing Education & Experience
- **Education**: Add degrees, institutions, dates
- **Experience**: Add previous companies, roles, durations
- **Documents**: Upload certificates and proofs

### Exporting Employee Data
1. Go to **Employees** → **Employee List**
2. Click **Export to Excel**
3. The file will download automatically
4. Open with Excel or similar spreadsheet software

## Attendance Management

### Manual Attendance Entry
1. Navigate to **Attendance** → **Mark Attendance**
2. Enter Employee ID
3. Select date
4. Choose status (Present/Absent/Leave)
5. Add in/out times (optional)
6. Click **Mark Attendance**

### Bulk Attendance Upload
1. Prepare CSV file with columns: employeeId, date, status, inTime, outTime
2. Go to **Attendance** → **Upload CSV**
3. Select your CSV file
4. Click **Upload**
5. Review upload results

### CSV Format Example
```csv
employeeId,date,status,inTime,outTime
VT0001,2024-01-15,Present,09:30,18:30
VT0002,2024-01-15,Present,09:15,18:45
VT0003,2024-01-15,Absent,,
```

### Monthly Reports
1. Go to **Attendance** → **Monthly Report**
2. Select month and year
3. View attendance summary
4. Check individual employee statistics
5. Export report if needed

## Leave Management

### Applying for Leave
1. Navigate to **Leaves** → **Apply Leave**
2. Select leave type (Casual/Sick/Earned)
3. Choose from and to dates
4. Provide reason
5. Click **Submit**

### Processing Leave Requests (HR)
1. Go to **Leaves** → **Leave Requests**
2. Review pending applications
3. Check employee's leave balance
4. Click **Approve** or **Reject**
5. Add comments if needed

### Leave Balance Tracking
- **Casual Leave**: 10 days per year
- **Sick Leave**: 5 days per year
- **Earned Leave**: Accrues monthly (7 days max)

## Payroll Management

### Generating Payroll
1. Navigate to **Payroll** → **Generate Payroll**
2. Select employee
3. Choose month and year
4. Enter CTC (if changed)
5. Click **Generate**

### Salary Calculation Logic
- **Basic**: 40% of CTC
- **HRA**: 50% of Basic
- **DA**: 3.5% of Basic
- **Employer PF**: 12% of Basic
- **TDS**: 4% of annual CTC
- **Absence Deductions**: Calculated from attendance

### Payslip Generation
1. After payroll generation, click **Download Payslip**
2. PDF will open in new tab
3. Save or print as needed

### Payroll Status
- **Generated**: Initial calculation complete
- **Paid**: Salary disbursed to employee

## Offer Letter Generation

### Creating Offer Letters
1. Go to **Offer Letters** → **Generate Offer Letter**
2. Enter candidate details:
   - Full name
   - Designation
   - Joining date
   - Offered CTC
   - Address information
3. Click **Generate**
4. Preview the letter
5. Download PDF

### Offer Letter Template
The system uses a standard company template including:
- Company letterhead
- Candidate details
- Job offer terms
- Salary breakdown
- Joining conditions
- Acceptance section

## Reports & Analytics

### Available Reports
- **Employee Directory**: Complete employee list
- **Attendance Reports**: Monthly attendance summaries
- **Leave Reports**: Leave utilization statistics
- **Payroll Reports**: Salary processing history
- **Joining Trends**: Monthly hiring patterns

### Generating Custom Reports
1. Navigate to **Reports** section
2. Select report type
3. Apply filters (date range, department, etc.)
4. Click **Generate**
5. Export to Excel or PDF

## Troubleshooting

### Common Issues

#### Login Problems
- **Issue**: Cannot log in
- **Solution**: Check email/password, contact administrator

#### File Upload Errors
- **Issue**: Documents not uploading
- **Solution**: Check file size (< 5MB), format (PDF/Image)

#### PDF Generation Fails
- **Issue**: Payslips/offer letters not generating
- **Solution**: Check data completeness, try again

#### Attendance Upload Issues
- **Issue**: CSV upload fails
- **Solution**: Verify CSV format, check employee IDs

### Error Messages
- **"Employee not found"**: Verify employee ID exists
- **"Invalid date format"**: Use YYYY-MM-DD format
- **"Insufficient permissions"**: Contact administrator

## Best Practices

### Data Management
- Keep employee information up-to-date
- Regularly backup important documents
- Use consistent naming conventions

### Attendance Tracking
- Mark attendance daily
- Use CSV upload for bulk entries
- Review monthly reports regularly

### Leave Management
- Encourage advance leave planning
- Monitor leave balances
- Follow company leave policies

### Payroll Processing
- Process payroll on time
- Verify attendance data before payroll
- Keep salary records confidential

### Security
- Use strong passwords
- Log out when not using the system
- Report suspicious activities

### Performance Tips
- Use search filters to find records quickly
- Export data regularly for backup
- Clear browser cache for better performance

## Support & Contact

### Technical Support
- **Email**: support@valourtech.com
- **Phone**: +91-XXXXXXXXXX
- **Hours**: Monday-Friday, 9:00 AM - 6:00 PM IST

### HR Helpdesk
- **Email**: hr@valourtech.com
- **Phone**: +91-XXXXXXXXXX

### Emergency Contact
For system outages or critical issues:
- **Emergency Hotline**: +91-XXXXXXXXXX
- **Available**: 24/7

## Version Information

- **Application Version**: 1.0.0
- **Last Updated**: October 2025
- **Developed by**: Kavya B
- **Client**: Valour Technologies

---

**Note**: This manual is updated regularly. Please check for updates or contact support for the latest version.