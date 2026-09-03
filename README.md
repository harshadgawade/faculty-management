# 🎓 Faculty Management System

A full-stack **Faculty Management Dashboard** built for academic institutions and universities.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5 · CSS3 · Tailwind CSS · JavaScript ES6+ · Chart.js |
| **Backend** | Java 17 · Spring Boot 3.2 · Spring Security · Spring Data JPA · Lombok |
| **Database** | MySQL 8.0 / PostgreSQL 14 |
| **Auth** | JWT (JJWT 0.12) + 2FA OTP via JavaMailSender |
| **Reports** | iTextPDF · Apache POI |

---

## Features

- 🔐 **Two-Factor Login** — Institutional email OTP (60-second countdown, account lockout)
- 📊 **Live Dashboard** — KPI cards, attendance trend, department distribution, salary charts
- 🗂 **Faculty Directory** — Search, filter by dept/role, org hierarchy tree
- 📅 **Academic Calendar** — Events, holidays, exams with visual markers
- ✅ **Attendance Tracking** — Punch-in/out lecture logger, monthly log table
- 🏖 **Leave Management** — Apply, approve/reject workflow with pending queue
- 💰 **Payroll Module** — Salary tier breakdown, monthly payroll, salary slip generation
- 📋 **Task Board** — Kanban-style To-Do with priority badges
- 📄 **Reports** — Export attendance, payroll, NBA/NAAC, workload, leave, research data
- 🔔 **Notice Board** — Internal announcements with categories
- 🌐 **Multi-Language** — English / Hindi / Marathi selector

---

## Project Structure

```
faculty-management-system/
├── database/
│   └── schema.sql              # MySQL schema — 17 tables, 6 triggers, seed data
├── backend/                    # Spring Boot Maven project
│   ├── pom.xml
│   └── src/main/java/com/university/fms/
│       ├── config/             # SecurityConfig (JWT, CORS, RBAC)
│       ├── controller/         # REST controllers (Auth, Faculty, Attendance, Leave, Dashboard)
│       ├── dto/                # Request/Response DTOs
│       ├── entity/             # JPA entities (12 entities)
│       ├── repository/         # Spring Data JPA repositories
│       ├── security/           # JwtTokenProvider, JwtAuthenticationFilter
│       ├── service/            # Business logic (Auth, Faculty, Attendance, Leave, Payroll, Dashboard)
│       ├── util/               # OtpUtil
│       └── exception/          # GlobalExceptionHandler (RFC 9457 ProblemDetail)
└── frontend/
    ├── login.html              # Glassmorphic 2-step OTP login page
    ├── dashboard.html          # Full dashboard — 8 sections, 5 charts
    └── assets/js/
        └── api.js              # Centralised API client (window.Api, window.Auth)
```

---

## Database Schema

17 tables: `roles`, `departments`, `users`, `faculty_details`, `subjects`,
`faculty_subject_assignments`, `lecture_logs`, `attendance`, `leave_types`,
`leave_requests`, `payroll_grades`, `payroll`, `budget_grants`,
`academic_calendar`, `announcements`, `tasks`, `audit_logs`

6 triggers: payroll auto-calculation, email domain guard, OTP cleanup, leave audit trail, duplicate attendance prevention.

---

## Setup & Run

### 1. Database
```sql
-- Import the schema
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend

# Configure environment variables (or edit application.yml)
export DB_USER=root
export DB_PASS=yourpassword
export MAIL_USER=noreply@university.edu
export MAIL_PASS=yourapppassword
export JWT_SECRET=your64charbase64secret

mvn spring-boot:run
# API runs at http://localhost:8080/api
```

### 3. Frontend
Open `frontend/login.html` directly in a browser, or serve via Live Server (VS Code) on port 5500.

> **Demo login:** Any `@university.edu` email registered in the `users` table — OTP is sent to that email.

---

## REST API Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/send-otp` | Public | Send OTP to institutional email |
| POST | `/api/auth/verify-otp` | Public | Verify OTP → receive JWT |
| GET | `/api/dashboard/stats` | Any auth | KPIs + chart data |
| GET | `/api/faculty` | Any auth | Search/list faculty (paginated) |
| POST | `/api/faculty` | Dean/Admin | Create faculty |
| PUT | `/api/faculty/{id}` | HOD+ | Update faculty |
| DELETE | `/api/faculty/{id}` | Dean/Admin | Soft-delete faculty |
| POST | `/api/attendance` | Any auth | Mark attendance |
| GET | `/api/attendance/monthly` | Any auth | Monthly attendance log |
| POST | `/api/leaves` | Any auth | Apply for leave |
| GET | `/api/leaves/pending` | HOD+ | Pending approval queue |
| POST | `/api/leaves/{id}/approve` | HOD+ | Approve leave |
| POST | `/api/leaves/{id}/reject` | HOD+ | Reject leave |

---

## RBAC Roles

`SUPER_ADMIN` → `DEAN` → `HOD` → `PROFESSOR` → `ASSOC_PROFESSOR` → `ASST_PROFESSOR` → `GUEST_LECTURER`

---

## License

MIT © 2026 University FMS
