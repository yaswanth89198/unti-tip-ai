-- ===================================================================
-- UniTrack AI — Database Schema
-- System: AI-Based University Student Performance and Talent Analytics
-- Target DBMS: MySQL 8.0+
-- ===================================================================

DROP DATABASE IF EXISTS unitrack_db;
CREATE DATABASE unitrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unitrack_db;

-- 1. Roles & Users (RBAC)
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role_id INT NOT NULL,
    department_id VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 2. Departments, Courses & Branches
CREATE TABLE departments (
    department_id VARCHAR(50) PRIMARY KEY,
    department_name VARCHAR(150) NOT NULL,
    hod_name VARCHAR(150),
    contact_email VARCHAR(150),
    established_year INT
) ENGINE=InnoDB;

CREATE TABLE courses (
    course_id VARCHAR(50) PRIMARY KEY,
    course_name VARCHAR(150) NOT NULL,
    program_level ENUM('Undergraduate', 'Postgraduate', 'Doctoral', 'Professional') NOT NULL,
    department_id VARCHAR(50) NOT NULL,
    total_semesters INT NOT NULL DEFAULT 8,
    total_credits INT NOT NULL DEFAULT 160,
    assessment_rule VARCHAR(255) DEFAULT 'Internal:40%|External:60%|MinPassing:40%',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_dept FOREIGN KEY (department_id) REFERENCES departments(department_id)
) ENGINE=InnoDB;

CREATE TABLE branches (
    branch_id VARCHAR(50) PRIMARY KEY,
    branch_name VARCHAR(150) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    intake_capacity INT DEFAULT 60,
    CONSTRAINT fk_branches_course FOREIGN KEY (course_id) REFERENCES courses(course_id)
) ENGINE=InnoDB;

-- 3. Academic Structure & Subjects
CREATE TABLE academic_years (
    year_id INT AUTO_INCREMENT PRIMARY KEY,
    year_name VARCHAR(50) NOT NULL UNIQUE, -- e.g. 2025-2026
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

CREATE TABLE faculty (
    faculty_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    designation VARCHAR(100),
    department_id VARCHAR(50) NOT NULL,
    CONSTRAINT fk_faculty_dept FOREIGN KEY (department_id) REFERENCES departments(department_id)
) ENGINE=InnoDB;

CREATE TABLE subjects (
    subject_code VARCHAR(50) PRIMARY KEY,
    subject_name VARCHAR(150) NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    faculty_id VARCHAR(50),
    max_internal INT DEFAULT 30,
    max_external INT DEFAULT 50,
    max_practical INT DEFAULT 20,
    description TEXT,
    CONSTRAINT fk_subjects_course FOREIGN KEY (course_id) REFERENCES courses(course_id),
    CONSTRAINT fk_subjects_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id)
) ENGINE=InnoDB;

-- 4. Students & Profiles
CREATE TABLE students (
    enrollment_id CHAR(6) PRIMARY KEY, -- Strict 6-digit unique university ID
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    course_id VARCHAR(50) NOT NULL,
    branch_id VARCHAR(50) NOT NULL,
    department_id VARCHAR(50) NOT NULL,
    admission_year INT NOT NULL,
    current_year INT NOT NULL,
    current_semester INT NOT NULL,
    expected_graduation INT NOT NULL,
    status ENUM('Active', 'On Leave', 'Graduated', 'Suspended') DEFAULT 'Active',
    avatar_url VARCHAR(255),
    cgpa DECIMAL(4,2) DEFAULT 0.00,
    attendance_pct DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_course FOREIGN KEY (course_id) REFERENCES courses(course_id),
    CONSTRAINT fk_student_branch FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    CONSTRAINT fk_student_dept FOREIGN KEY (department_id) REFERENCES departments(department_id)
) ENGINE=InnoDB;

CREATE INDEX idx_student_name ON students(full_name);
CREATE INDEX idx_student_dept_sem ON students(department_id, current_semester);

-- 5. Academic Marks & Grading
CREATE TABLE marks (
    mark_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id CHAR(6) NOT NULL,
    semester INT NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    internal_marks DECIMAL(5,2) DEFAULT 0,
    external_marks DECIMAL(5,2) DEFAULT 0,
    practical_marks DECIMAL(5,2) DEFAULT 0,
    total_marks DECIMAL(5,2) GENERATED ALWAYS AS (internal_marks + external_marks + practical_marks) STORED,
    grade CHAR(2) NOT NULL,
    grade_points INT NOT NULL,
    status ENUM('Pass', 'Fail', 'Absent', 'Withheld') DEFAULT 'Pass',
    backlog BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_marks_student FOREIGN KEY (enrollment_id) REFERENCES students(enrollment_id) ON DELETE CASCADE,
    CONSTRAINT fk_marks_subject FOREIGN KEY (subject_code) REFERENCES subjects(subject_code),
    UNIQUE KEY uk_student_sem_subject (enrollment_id, semester, subject_code)
) ENGINE=InnoDB;

-- 6. Attendance Tracking
CREATE TABLE attendance (
    attendance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id CHAR(6) NOT NULL,
    semester INT NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    classes_held INT NOT NULL DEFAULT 0,
    classes_attended INT NOT NULL DEFAULT 0,
    classes_absent INT GENERATED ALWAYS AS (classes_held - classes_attended) STORED,
    attendance_percentage DECIMAL(5,2) NOT NULL,
    status ENUM('Good', 'Satisfactory', 'Shortage') DEFAULT 'Satisfactory',
    last_updated DATE NOT NULL,
    CONSTRAINT fk_attendance_student FOREIGN KEY (enrollment_id) REFERENCES students(enrollment_id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_subject FOREIGN KEY (subject_code) REFERENCES subjects(subject_code),
    UNIQUE KEY uk_student_subject_att (enrollment_id, semester, subject_code)
) ENGINE=InnoDB;

-- 7. Talent Analytics: Projects, Skills, Certificates, Internships, Placements
CREATE TABLE projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id CHAR(6) NOT NULL,
    semester INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    tech_stack VARCHAR(255) NOT NULL,
    repo_url VARCHAR(255),
    live_demo_url VARCHAR(255),
    description TEXT,
    verification_status ENUM('Verified', 'Pending', 'Rejected') DEFAULT 'Pending',
    CONSTRAINT fk_project_student FOREIGN KEY (enrollment_id) REFERENCES students(enrollment_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE certificates (
    certificate_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id CHAR(6) NOT NULL,
    title VARCHAR(200) NOT NULL,
    issuing_authority VARCHAR(150) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    credential_id VARCHAR(100),
    verification_status ENUM('Verified', 'Pending', 'Rejected') DEFAULT 'Pending',
    skills_covered VARCHAR(255),
    CONSTRAINT fk_cert_student FOREIGN KEY (enrollment_id) REFERENCES students(enrollment_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE student_activities (
    activity_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id CHAR(6) NOT NULL,
    semester INT NOT NULL,
    category ENUM('Hackathon', 'Research Paper', 'Internship', 'Workshop', 'Sports', 'Cultural', 'Bootcamp') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    organization_event VARCHAR(150),
    achievement VARCHAR(150),
    verification_status ENUM('Verified', 'Pending', 'Rejected') DEFAULT 'Pending',
    date_recorded DATE NOT NULL,
    CONSTRAINT fk_activity_student FOREIGN KEY (enrollment_id) REFERENCES students(enrollment_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE placements (
    placement_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id CHAR(6) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    job_role VARCHAR(100) NOT NULL,
    package_ctc_lpa DECIMAL(5,2) NOT NULL,
    offer_date DATE NOT NULL,
    offer_letter_url VARCHAR(255),
    status ENUM('Offered', 'Accepted', 'Declined') DEFAULT 'Accepted',
    CONSTRAINT fk_placement_student FOREIGN KEY (enrollment_id) REFERENCES students(enrollment_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Support Tickets
CREATE TABLE support_tickets (
    ticket_id VARCHAR(30) PRIMARY KEY,
    enrollment_id CHAR(6) NOT NULL,
    category ENUM(
        'Login and account access',
        'Enrollment ID issues',
        'Missing or incorrect marks',
        'Attendance disputes',
        'Semester and subject information',
        'Profile and photograph updates',
        'Certificate or activity corrections',
        'General technical support'
    ) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    assigned_coordinator VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolution_notes TEXT,
    CONSTRAINT fk_ticket_student FOREIGN KEY (enrollment_id) REFERENCES students(enrollment_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Dataset Imports & Audit Logs
CREATE TABLE dataset_imports (
    import_id INT AUTO_INCREMENT PRIMARY KEY,
    dataset_name VARCHAR(100) NOT NULL,
    file_name VARCHAR(150) NOT NULL,
    total_rows INT NOT NULL,
    accepted_rows INT NOT NULL,
    rejected_rows INT NOT NULL,
    error_summary TEXT,
    imported_by VARCHAR(100) NOT NULL,
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    old_value JSON,
    new_value JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
