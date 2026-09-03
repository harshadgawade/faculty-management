-- ============================================================
--  FACULTY MANAGEMENT SYSTEM — COMPLETE DATABASE SCHEMA
--  Compatible: MySQL 8.0+ / PostgreSQL 14+
--  Author : University FMS Architecture Team
--  Version: 1.0.0
-- ============================================================

-- ----------------------------------------------------------------
-- 0. DATABASE SETUP
-- ----------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS faculty_management_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE faculty_management_db;

-- ----------------------------------------------------------------
-- 1. ROLES  (RBAC — Super Admin / Dean / HOD / Faculty / Guest)
-- ----------------------------------------------------------------
CREATE TABLE roles (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    role_name   VARCHAR(50)     NOT NULL UNIQUE,   -- SUPER_ADMIN | DEAN | HOD | PROFESSOR | ASSOC_PROFESSOR | ASST_PROFESSOR | GUEST_LECTURER
    description VARCHAR(255),
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- 2. DEPARTMENTS
-- ----------------------------------------------------------------
CREATE TABLE departments (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    dept_code       VARCHAR(10)     NOT NULL UNIQUE,   -- CS, IT, ME, CE, EE …
    dept_name       VARCHAR(120)    NOT NULL,
    hod_faculty_id  BIGINT,                            -- FK added after faculty table
    established_on  DATE,
    budget_allocated DECIMAL(15,2)  DEFAULT 0.00,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- 3. USERS  (Authentication table — all system users)
-- ----------------------------------------------------------------
CREATE TABLE users (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    email               VARCHAR(150)    NOT NULL UNIQUE,   -- must end in @university.edu / @college.ac.in
    password_hash       VARCHAR(255)    NOT NULL,
    role_id             BIGINT          NOT NULL,
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    is_email_verified   TINYINT(1)      NOT NULL DEFAULT 0,
    otp_code            VARCHAR(6),
    otp_expires_at      TIMESTAMP,
    last_login          TIMESTAMP,
    failed_login_count  INT             NOT NULL DEFAULT 0,
    locked_until        TIMESTAMP,
    preferred_language  VARCHAR(10)     NOT NULL DEFAULT 'en',  -- en | hi | mr
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role_id);

-- ----------------------------------------------------------------
-- 4. FACULTY DETAILS  (Extended profile linked to users)
-- ----------------------------------------------------------------
CREATE TABLE faculty_details (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    user_id             BIGINT          NOT NULL UNIQUE,
    department_id       BIGINT          NOT NULL,
    employee_code       VARCHAR(20)     NOT NULL UNIQUE,
    first_name          VARCHAR(80)     NOT NULL,
    last_name           VARCHAR(80)     NOT NULL,
    designation         VARCHAR(100),   -- Professor / Associate Professor / etc.
    qualification       VARCHAR(200),   -- Ph.D. (CS), M.Tech, etc.
    specialisation      VARCHAR(200),
    date_of_joining     DATE            NOT NULL,
    date_of_birth       DATE,
    gender              ENUM('MALE','FEMALE','OTHER'),
    contact_number      VARCHAR(15),
    alternate_email     VARCHAR(150),
    address             TEXT,
    photo_url           VARCHAR(500),
    experience_years    DECIMAL(4,1)    DEFAULT 0.0,
    publications_count  INT             DEFAULT 0,
    patents_count       INT             DEFAULT 0,
    is_phd_guide        TINYINT(1)      DEFAULT 0,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_fd_user       FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_fd_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE INDEX idx_fd_department  ON faculty_details(department_id);
CREATE INDEX idx_fd_employee    ON faculty_details(employee_code);

-- Back-fill HOD FK on departments (now faculty_details exists)
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_hod
    FOREIGN KEY (hod_faculty_id) REFERENCES faculty_details(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------
-- 5. SUBJECTS / COURSES
-- ----------------------------------------------------------------
CREATE TABLE subjects (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    subject_code    VARCHAR(20)     NOT NULL UNIQUE,
    subject_name    VARCHAR(150)    NOT NULL,
    department_id   BIGINT          NOT NULL,
    semester        TINYINT         NOT NULL,   -- 1–8
    credits         TINYINT         NOT NULL DEFAULT 3,
    subject_type    ENUM('THEORY','PRACTICAL','PROJECT','ELECTIVE') DEFAULT 'THEORY',
    total_lectures_planned INT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_sub_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------
-- 6. FACULTY–SUBJECT ASSIGNMENTS  (Many-to-Many with academic year)
-- ----------------------------------------------------------------
CREATE TABLE faculty_subject_assignments (
    id              BIGINT      NOT NULL AUTO_INCREMENT,
    faculty_id      BIGINT      NOT NULL,
    subject_id      BIGINT      NOT NULL,
    academic_year   VARCHAR(9)  NOT NULL,   -- e.g. 2025-2026
    semester        TINYINT     NOT NULL,
    assigned_on     DATE        NOT NULL,
    is_active       TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uq_assignment (faculty_id, subject_id, academic_year, semester),
    CONSTRAINT fk_fsa_faculty  FOREIGN KEY (faculty_id) REFERENCES faculty_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_fsa_subject  FOREIGN KEY (subject_id) REFERENCES subjects(id)        ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 7. LECTURE LOGS  (Punch-in / Punch-out per lecture)
-- ----------------------------------------------------------------
CREATE TABLE lecture_logs (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    faculty_id          BIGINT          NOT NULL,
    subject_id          BIGINT          NOT NULL,
    lecture_date        DATE            NOT NULL,
    punch_in            TIMESTAMP,
    punch_out           TIMESTAMP,
    duration_minutes    INT             GENERATED ALWAYS AS (
                            TIMESTAMPDIFF(MINUTE, punch_in, punch_out)
                        ) STORED,
    topic_covered       VARCHAR(500),
    lectures_completed  INT             NOT NULL DEFAULT 1,
    syllabus_percentage DECIMAL(5,2)    DEFAULT 0.00,  -- cumulative % after this lecture
    remarks             VARCHAR(255),
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ll_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_ll_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)        ON DELETE CASCADE
);

CREATE INDEX idx_ll_faculty_date ON lecture_logs(faculty_id, lecture_date);

-- ----------------------------------------------------------------
-- 8. ATTENDANCE  (Daily faculty attendance)
-- ----------------------------------------------------------------
CREATE TABLE attendance (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    faculty_id      BIGINT          NOT NULL,
    attendance_date DATE            NOT NULL,
    status          ENUM('PRESENT','ABSENT','ON_DUTY','HALF_DAY','LATE','HOLIDAY') NOT NULL,
    check_in        TIME,
    check_out       TIME,
    remarks         VARCHAR(255),
    marked_by       BIGINT,   -- FK to users (admin/system)
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_att_faculty_date (faculty_id, attendance_date),
    CONSTRAINT fk_att_faculty   FOREIGN KEY (faculty_id) REFERENCES faculty_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_marked_by FOREIGN KEY (marked_by)  REFERENCES users(id)           ON DELETE SET NULL
);

CREATE INDEX idx_att_date      ON attendance(attendance_date);
CREATE INDEX idx_att_faculty   ON attendance(faculty_id);
CREATE INDEX idx_att_status    ON attendance(status);

-- ----------------------------------------------------------------
-- 9. LEAVE TYPES
-- ----------------------------------------------------------------
CREATE TABLE leave_types (
    id              BIGINT      NOT NULL AUTO_INCREMENT,
    type_code       VARCHAR(20) NOT NULL UNIQUE,   -- CL, EL, DL, ML, LOP
    type_name       VARCHAR(80) NOT NULL,
    max_days_year   INT         NOT NULL DEFAULT 12,
    is_paid         TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- 10. LEAVE REQUESTS
-- ----------------------------------------------------------------
CREATE TABLE leave_requests (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    faculty_id      BIGINT          NOT NULL,
    leave_type_id   BIGINT          NOT NULL,
    from_date       DATE            NOT NULL,
    to_date         DATE            NOT NULL,
    total_days      INT             GENERATED ALWAYS AS (DATEDIFF(to_date, from_date) + 1) STORED,
    reason          TEXT            NOT NULL,
    status          ENUM('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    applied_on      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by     BIGINT,          -- HOD/Dean user id
    reviewed_on     TIMESTAMP,
    review_remarks  VARCHAR(500),
    document_url    VARCHAR(500),    -- supporting doc upload
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_lr_faculty    FOREIGN KEY (faculty_id)    REFERENCES faculty_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_lr_type       FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)     ON DELETE RESTRICT,
    CONSTRAINT fk_lr_reviewer   FOREIGN KEY (reviewed_by)   REFERENCES users(id)           ON DELETE SET NULL
);

CREATE INDEX idx_lr_faculty ON leave_requests(faculty_id);
CREATE INDEX idx_lr_status  ON leave_requests(status);

-- ----------------------------------------------------------------
-- 11. PAYROLL GRADES
-- ----------------------------------------------------------------
CREATE TABLE payroll_grades (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    grade_code      VARCHAR(20)     NOT NULL UNIQUE,
    designation     VARCHAR(100)    NOT NULL,
    basic_salary    DECIMAL(12,2)   NOT NULL,
    hra_percent     DECIMAL(5,2)    NOT NULL DEFAULT 24.00,
    da_percent      DECIMAL(5,2)    NOT NULL DEFAULT 12.00,
    ta_fixed        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    pf_percent      DECIMAL(5,2)    NOT NULL DEFAULT 12.00,
    tax_slab_id     INT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ----------------------------------------------------------------
-- 12. PAYROLL RECORDS  (Monthly)
-- ----------------------------------------------------------------
CREATE TABLE payroll (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    faculty_id          BIGINT          NOT NULL,
    grade_id            BIGINT          NOT NULL,
    payroll_month       DATE            NOT NULL,   -- First day of month (2025-07-01)
    basic_salary        DECIMAL(12,2)   NOT NULL,
    hra                 DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    da                  DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    ta                  DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    research_stipend    DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    lecture_allowance   DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    gross_salary        DECIMAL(12,2)   NOT NULL,
    pf_deduction        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    tds_deduction       DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    lop_deduction       DECIMAL(12,2)   NOT NULL DEFAULT 0.00,   -- Loss of Pay
    other_deductions    DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    net_salary          DECIMAL(12,2)   NOT NULL,
    payment_status      ENUM('PENDING','PROCESSED','PAID','HELD') NOT NULL DEFAULT 'PENDING',
    payment_date        DATE,
    payment_reference   VARCHAR(100),
    slip_generated      TINYINT(1)      NOT NULL DEFAULT 0,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payroll_faculty_month (faculty_id, payroll_month),
    CONSTRAINT fk_pay_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_details(id) ON DELETE CASCADE,
    CONSTRAINT fk_pay_grade   FOREIGN KEY (grade_id)   REFERENCES payroll_grades(id)  ON DELETE RESTRICT
);

CREATE INDEX idx_pay_month  ON payroll(payroll_month);
CREATE INDEX idx_pay_status ON payroll(payment_status);

-- ----------------------------------------------------------------
-- 13. BUDGET & GRANTS
-- ----------------------------------------------------------------
CREATE TABLE budget_grants (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    department_id   BIGINT          NOT NULL,
    grant_title     VARCHAR(200)    NOT NULL,
    grant_type      ENUM('RESEARCH','LAB','OPERATIONAL','INFRASTRUCTURE','SCHOLARSHIP') NOT NULL,
    source          VARCHAR(200),   -- Funding agency / govt scheme
    amount          DECIMAL(15,2)   NOT NULL,
    disbursed       DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
    balance         DECIMAL(15,2)   GENERATED ALWAYS AS (amount - disbursed) STORED,
    grant_year      YEAR            NOT NULL,
    approved_by     BIGINT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_bg_dept     FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    CONSTRAINT fk_bg_approver FOREIGN KEY (approved_by)   REFERENCES users(id)       ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- 14. ACADEMIC CALENDAR  (Events / Holidays / Exams)
-- ----------------------------------------------------------------
CREATE TABLE academic_calendar (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    title           VARCHAR(200)    NOT NULL,
    event_type      ENUM('HOLIDAY','EXAM','CLASS','SEMINAR','FDP','WORKSHOP','RECESS','DEADLINE') NOT NULL,
    start_datetime  DATETIME        NOT NULL,
    end_datetime    DATETIME        NOT NULL,
    department_id   BIGINT,    -- NULL = university-wide
    is_recurring    TINYINT(1)  NOT NULL DEFAULT 0,
    color_code      VARCHAR(7),    -- hex color for calendar UI
    description     TEXT,
    created_by      BIGINT,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_cal_dept    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    CONSTRAINT fk_cal_creator FOREIGN KEY (created_by)   REFERENCES users(id)       ON DELETE SET NULL
);

CREATE INDEX idx_cal_dates ON academic_calendar(start_datetime, end_datetime);

-- ----------------------------------------------------------------
-- 15. ANNOUNCEMENTS / NOTICE BOARD
-- ----------------------------------------------------------------
CREATE TABLE announcements (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    title           VARCHAR(200)    NOT NULL,
    body            TEXT            NOT NULL,
    category        ENUM('GENERAL','EXAM','RESEARCH','ACHIEVEMENT','CIRCULAR','URGENT') NOT NULL DEFAULT 'GENERAL',
    target_role     VARCHAR(50),   -- NULL = all; or specific role_name
    department_id   BIGINT,        -- NULL = institute-wide
    is_pinned       TINYINT(1)     NOT NULL DEFAULT 0,
    published_by    BIGINT,
    published_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP,
    attachment_url  VARCHAR(500),
    PRIMARY KEY (id),
    CONSTRAINT fk_ann_dept      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_ann_publisher FOREIGN KEY (published_by)  REFERENCES users(id)       ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- 16. TASKS / TO-DO
-- ----------------------------------------------------------------
CREATE TABLE tasks (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    faculty_id      BIGINT          NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT,
    priority        ENUM('HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
    status          ENUM('PENDING','IN_PROGRESS','COMPLETED','DEFERRED') NOT NULL DEFAULT 'PENDING',
    due_date        DATE,
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_task_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_details(id) ON DELETE CASCADE
);

CREATE INDEX idx_task_priority ON tasks(priority);
CREATE INDEX idx_task_due      ON tasks(due_date);

-- ----------------------------------------------------------------
-- 17. AUDIT LOG  (System-wide action trail)
-- ----------------------------------------------------------------
CREATE TABLE audit_logs (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT,
    action      VARCHAR(100)    NOT NULL,   -- LOGIN, LEAVE_APPROVED, PAYROLL_RUN …
    entity      VARCHAR(80),               -- Table name affected
    entity_id   BIGINT,
    old_value   JSON,
    new_value   JSON,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_time   ON audit_logs(created_at);

-- ================================================================
--  TRIGGERS
-- ================================================================

DELIMITER $$

-- T1: Auto-compute gross & net salary before insert into payroll
CREATE TRIGGER trg_payroll_before_insert
BEFORE INSERT ON payroll
FOR EACH ROW
BEGIN
    SET NEW.gross_salary = NEW.basic_salary + NEW.hra + NEW.da + NEW.ta
                         + NEW.research_stipend + NEW.lecture_allowance;
    SET NEW.net_salary   = NEW.gross_salary - NEW.pf_deduction
                         - NEW.tds_deduction - NEW.lop_deduction - NEW.other_deductions;
END$$

-- T2: Auto-recompute on update
CREATE TRIGGER trg_payroll_before_update
BEFORE UPDATE ON payroll
FOR EACH ROW
BEGIN
    SET NEW.gross_salary = NEW.basic_salary + NEW.hra + NEW.da + NEW.ta
                         + NEW.research_stipend + NEW.lecture_allowance;
    SET NEW.net_salary   = NEW.gross_salary - NEW.pf_deduction
                         - NEW.tds_deduction - NEW.lop_deduction - NEW.other_deductions;
END$$

-- T3: Validate institute email domain before user insert
CREATE TRIGGER trg_users_email_domain_check
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.email NOT REGEXP '(@university\\.edu|@college\\.ac\\.in)$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Email must be an institutional address (@university.edu or @college.ac.in)';
    END IF;
END$$

-- T4: Invalidate OTP after use — clear on successful login (status-based)
CREATE TRIGGER trg_clear_otp_on_login
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.last_login IS NOT NULL AND OLD.last_login IS NULL THEN
        SET NEW.otp_code       = NULL;
        SET NEW.otp_expires_at = NULL;
    END IF;
END$$

-- T5: Audit trail — log leave status changes
CREATE TRIGGER trg_leave_status_audit
AFTER UPDATE ON leave_requests
FOR EACH ROW
BEGIN
    IF NEW.status <> OLD.status THEN
        INSERT INTO audit_logs (user_id, action, entity, entity_id, old_value, new_value)
        VALUES (
            NEW.reviewed_by,
            CONCAT('LEAVE_', NEW.status),
            'leave_requests',
            NEW.id,
            JSON_OBJECT('status', OLD.status),
            JSON_OBJECT('status', NEW.status, 'remarks', NEW.review_remarks)
        );
    END IF;
END$$

-- T6: Auto-mark attendance as ABSENT if no record exists for working day
--     (Called by a scheduled event / batch job — trigger on attendance insert
--      to validate no duplicate date per faculty)
CREATE TRIGGER trg_attendance_no_duplicate
BEFORE INSERT ON attendance
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM attendance
        WHERE faculty_id = NEW.faculty_id
          AND attendance_date = NEW.attendance_date
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Attendance record already exists for this faculty on this date';
    END IF;
END$$

DELIMITER ;

-- ================================================================
--  SEED DATA — Roles & Leave Types
-- ================================================================

INSERT INTO roles (role_name, description) VALUES
  ('SUPER_ADMIN',      'Full system access — IT Administrator'),
  ('DEAN',             'Academic Dean with institution-wide oversight'),
  ('HOD',              'Head of Department with departmental control'),
  ('PROFESSOR',        'Senior faculty member'),
  ('ASSOC_PROFESSOR',  'Associate Professor'),
  ('ASST_PROFESSOR',   'Assistant Professor'),
  ('GUEST_LECTURER',   'Guest / Visiting Faculty — restricted access');

INSERT INTO leave_types (type_code, type_name, max_days_year, is_paid) VALUES
  ('CL',  'Casual Leave',             12, 1),
  ('EL',  'Earned Leave',             30, 1),
  ('DL',  'Duty Leave',               15, 1),
  ('ML',  'Medical Leave',            15, 1),
  ('LOP', 'Loss of Pay',             365, 0),
  ('MAT', 'Maternity Leave',         180, 1),
  ('PAT', 'Paternity Leave',          15, 1),
  ('SDL', 'Study / Research Leave',   30, 0);

INSERT INTO payroll_grades (grade_code, designation, basic_salary, hra_percent, da_percent, ta_fixed, pf_percent) VALUES
  ('PG-PROF',   'Professor',            120000.00, 30.00, 17.00, 3500.00, 12.00),
  ('PG-ASSOC',  'Associate Professor',   90000.00, 27.00, 17.00, 3000.00, 12.00),
  ('PG-ASST',   'Assistant Professor',   65000.00, 24.00, 17.00, 2500.00, 12.00),
  ('PG-GUEST',  'Guest Lecturer',        25000.00, 10.00,  0.00,    0.00,  0.00);

INSERT INTO departments (dept_code, dept_name) VALUES
  ('CS',   'Computer Science & Engineering'),
  ('IT',   'Information Technology'),
  ('ME',   'Mechanical Engineering'),
  ('CE',   'Civil Engineering'),
  ('EE',   'Electrical Engineering'),
  ('ECE',  'Electronics & Communication Engineering'),
  ('MBA',  'Master of Business Administration'),
  ('MCA',  'Master of Computer Applications');
