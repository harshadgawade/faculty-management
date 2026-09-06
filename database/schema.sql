-- ============================================================
-- FACULTY MANAGEMENT SYSTEM — COMPLETE DATABASE SCHEMA
-- Attendance subject support added: attendance records are now
-- unique per faculty + subject + date.
-- ============================================================

CREATE DATABASE IF NOT EXISTS faculty_management_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE faculty_management_db;

CREATE TABLE IF NOT EXISTS roles (
 id BIGINT NOT NULL AUTO_INCREMENT, role_name VARCHAR(50) NOT NULL UNIQUE,
 description VARCHAR(255), created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS departments (
 id BIGINT NOT NULL AUTO_INCREMENT, dept_code VARCHAR(10) NOT NULL UNIQUE,
 dept_name VARCHAR(120) NOT NULL, hod_faculty_id BIGINT, established_on DATE,
 budget_allocated DECIMAL(15,2) DEFAULT 0.00, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
 id BIGINT NOT NULL AUTO_INCREMENT, email VARCHAR(150) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL, role_id BIGINT NOT NULL, is_active TINYINT(1) NOT NULL DEFAULT 1,
 is_email_verified TINYINT(1) NOT NULL DEFAULT 0, otp_code VARCHAR(6), otp_expires_at TIMESTAMP,
 last_login TIMESTAMP, failed_login_count INT NOT NULL DEFAULT 0, locked_until TIMESTAMP,
 preferred_language VARCHAR(10) NOT NULL DEFAULT 'en', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (id), CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS faculty_details (
 id BIGINT NOT NULL AUTO_INCREMENT, user_id BIGINT NOT NULL UNIQUE, department_id BIGINT NOT NULL,
 employee_code VARCHAR(20) NOT NULL UNIQUE, first_name VARCHAR(80) NOT NULL, last_name VARCHAR(80) NOT NULL,
 designation VARCHAR(100), qualification VARCHAR(200), specialisation VARCHAR(200), date_of_joining DATE NOT NULL,
 date_of_birth DATE, gender ENUM('MALE','FEMALE','OTHER'), contact_number VARCHAR(15), alternate_email VARCHAR(150),
 address TEXT, photo_url VARCHAR(500), experience_years DECIMAL(4,1) DEFAULT 0.0, publications_count INT DEFAULT 0,
 patents_count INT DEFAULT 0, is_phd_guide TINYINT(1) DEFAULT 0, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (id), CONSTRAINT fk_fd_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 CONSTRAINT fk_fd_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS subjects (
 id BIGINT NOT NULL AUTO_INCREMENT, subject_code VARCHAR(20) NOT NULL UNIQUE, subject_name VARCHAR(150) NOT NULL,
 department_id BIGINT NOT NULL, semester TINYINT NOT NULL, credits TINYINT NOT NULL DEFAULT 3,
 subject_type ENUM('THEORY','PRACTICAL','PROJECT','ELECTIVE') DEFAULT 'THEORY', total_lectures_planned INT NOT NULL DEFAULT 0,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id),
 CONSTRAINT fk_sub_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS faculty_subject_assignments (
 id BIGINT NOT NULL AUTO_INCREMENT, faculty_id BIGINT NOT NULL, subject_id BIGINT NOT NULL,
 academic_year VARCHAR(9) NOT NULL, semester TINYINT NOT NULL, assigned_on DATE NOT NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1, PRIMARY KEY (id),
 UNIQUE KEY uq_assignment (faculty_id, subject_id, academic_year, semester),
 CONSTRAINT fk_fsa_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_details(id) ON DELETE CASCADE,
 CONSTRAINT fk_fsa_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
 id BIGINT NOT NULL AUTO_INCREMENT,
 faculty_id BIGINT NOT NULL,
 subject_id BIGINT NOT NULL,
 attendance_date DATE NOT NULL,
 status ENUM('PRESENT','ABSENT','ON_DUTY','HALF_DAY','LATE','HOLIDAY') NOT NULL,
 check_in TIME, check_out TIME, remarks VARCHAR(255), marked_by BIGINT,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (id),
 UNIQUE KEY uq_att_faculty_subject_date (faculty_id, subject_id, attendance_date),
 CONSTRAINT fk_att_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_details(id) ON DELETE CASCADE,
 CONSTRAINT fk_att_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
 CONSTRAINT fk_att_marked_by FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_att_date ON attendance(attendance_date);
CREATE INDEX idx_att_faculty ON attendance(faculty_id);
CREATE INDEX idx_att_subject ON attendance(subject_id);
CREATE INDEX idx_att_status ON attendance(status);

-- For existing databases, run this migration manually if attendance already exists:
-- ALTER TABLE attendance ADD COLUMN subject_id BIGINT NULL;
-- ALTER TABLE attendance ADD CONSTRAINT fk_att_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT;
-- ALTER TABLE attendance DROP INDEX uq_att_faculty_date;
-- ALTER TABLE attendance ADD UNIQUE KEY uq_att_faculty_subject_date (faculty_id, subject_id, attendance_date);
