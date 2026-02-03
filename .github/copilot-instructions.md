# Copilot Instructions for Recruitment CRM

## Architecture Overview

This is a **full-stack HR/Recruitment CRM** with clear separation of concerns:

- **Frontend**: React 19 with Context API (no Redux), Vite build, Tailwind CSS, Formik validation
- **Backend**: Express.js with MongoDB/Mongoose, modular route→controller→model pattern
- **Key separation**: Authentication via JWT tokens (bearer), role-based access control (HR Admin/Manager/Executive/Employee roles)

### Data Flow Pattern
1. React components dispatch context actions → API calls via Axios
2. API hits Express routes (protected by authMiddleware)
3. Routes invoke controllers that validate input, query Mongoose models
4. Controllers return structured JSON responses with explicit status codes

## Key Files & Patterns

### Backend Structure
- **Routes** ([my-backend/routes/](my-backend/routes/)): Define endpoints, wire middleware, delegate to controllers
  - Example: [employeeRoutes.js](my-backend/routes/employeeRoutes.js) - includes multer for file uploads
  - **Pattern**: All routes use `/api/{resource}` prefix in server.js
  
- **Controllers** ([my-backend/controllers/](my-backend/controllers/)): Business logic, validation, DB operations
  - Example: [employeeController.js](my-backend/controllers/employeeController.js) - auto-generates `VT000X` IDs, validates data, handles Excel export
  - **Pattern**: Try-catch blocks, explicit error messages, validation before DB writes

- **Models** ([my-backend/models/](my-backend/models/)): Mongoose schemas with nested subdocuments
  - Example: [Employee.js](my-backend/models/Employee.js) - nested `education` and `experience` arrays, `leaveBalance` tracking

- **Auth**: [authMiddleware.js](my-backend/middleware/authMiddleware.js) uses JWT from `Authorization: Bearer <token>` header
  - Functions: `protect()` (validates token), `authorize(...roles)` (checks user.role)

### Frontend Structure
- **Context** ([my-frontend/src/context/](my-frontend/src/context/)): Global state (AuthContext, EmployeeContext, etc.)
  - Pattern: Stores user + token in localStorage, provides login/logout/actions
  
- **Pages** ([my-frontend/src/pages/](my-frontend/src/pages/)): Route-level components
  - Example: EmployeeDashboard.js (employee view), Employees (admin view)
  - Pattern: Use context hooks to fetch data on mount, conditional rendering based on user.role

- **Components** ([my-frontend/src/components/](my-frontend/src/components/)): Reusable UI elements
  - Navbar, Sidebar, Forms (EmployeeForm, LeaveForm, etc.), Tables (EmployeeList, AttendanceTable)

## Critical Workflows

### Employee Lifecycle
1. **Add Employee**: Form validates → POST `/api/employees` → Backend auto-generates `VT000X` ID → Stored with leaving_date: null, status: "Active"
2. **Education/Experience**: Multipart file upload handled by multer (destination: `uploads/`)
3. **Export**: GET `/api/employees/export/excel` → ExcelJS generates workbook → Returns file

### Attendance & Leave Balance
- Attendance recorded per day (Present/Absent/Leave status)
- Leave types: Casual (10 days), Sick (5 days), Earned (7 days) — stored in `Employee.leaveBalance`
- Payroll deductions: Calculated from attendance (absences reduce salary)

### JWT Token Flow
1. Login endpoint returns `{ token, user: { id, role, ... } }`
2. Frontend stores both in localStorage via AuthContext
3. Every API call includes `Authorization: Bearer <token>`
4. authMiddleware decodes token → attaches `req.user` to request

## Development Commands

### Backend
```bash
npm run dev          # Nodemon for development (auto-reload)
npm run seed         # Populate database with seed data
npm start            # Production mode
```

### Frontend
```bash
npm run dev          # Vite dev server (http://localhost:3000 default)
npm run build        # Production build → build/ directory
npm run preview      # Preview production build locally
npm run test         # Run vitest tests
```

### Environment Setup
Backend `.env` requires:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/recruitment_crm
JWT_SECRET=your_secret_key_here
```

## Validation & Error Handling

- **Backend validators**: [utils/validators.js](my-backend/utils/validators.js) contains `validateEmployeeData()` — check this before adding validation logic
- **Frontend validation**: Formik + Yup schemas (e.g., EmployeeForm.js, LeaveForm.js)
- **Error responses**: Always include `{ message: "...", errors: [...] }` structure
- **Status codes**: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 500 (server error)

## Role-Based Access Patterns

Check [routes/](my-backend/routes/) for examples:
```javascript
// Protect route from unauthenticated users
router.post("/", protect, addEmployee);

// Also restrict by role
router.delete("/:id", protect, authorize("Admin", "Manager"), deleteEmployee);
```

Frontend checks `user.role` to show/hide UI elements (e.g., delete button hidden for "Employee" role).

## File Upload Handling

- **Multer config**: [employeeRoutes.js](my-backend/routes/employeeRoutes.js) uses diskStorage → `uploads/` directory
- **Serving files**: [server.js](my-backend/server.js) exposes `app.use("/uploads", express.static("uploads"))`
- **Frontend**: Get file URL as `${API_URL}/uploads/${filename}` for direct download/preview

## PDF & Excel Generation

- **Payslips & Offer Letters**: PDFKit library — controllers generate PDFs → save to `uploads/` → return file path
- **Employee Export**: ExcelJS creates workbook → columns for all employee fields → download via Express static route

## Common Integration Points

1. **Adding a new module**: Create route → controller → model; add context in frontend for state management
2. **Nested data updates**: Use MongoDB array operations (`$push`, `$pull`, `arrayFilters`) in controllers
3. **CORS**: Configured for `localhost:3000` + production URL in [server.js](my-backend/server.js)
4. **Database**: Ensure MongoDB is running before starting backend; use `.env` MONGO_URI

## When Debugging

- Check browser DevTools Network tab for API call status & response
- Backend logs print to console (check `npm run dev` terminal)
- Verify JWT token format: `Bearer <token>` (with space)
- Confirm user.role is set after login (check localStorage in DevTools)
- For file uploads: ensure multer destination folder exists and is writable
