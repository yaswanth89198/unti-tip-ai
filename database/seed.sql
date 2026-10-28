-- ===================================================================
-- UniTrack AI — Initial Seed Data
-- Target DBMS: MySQL 8.0+
-- ===================================================================

USE unitrack_db;

-- 1. Roles
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'ROLE_DEAN', 'University-wide executive and dean level analytics access'),
(2, 'ROLE_HOD', 'Department level supervision, marks and attendance audit'),
(3, 'ROLE_COORDINATOR', 'Academic operational coordinator, dataset importer, ticket resolver'),
(4, 'ROLE_STUDENT', 'Self-service academic record, talent submission, support ticket access');

-- 2. Departments
INSERT INTO departments (department_id, department_name, hod_name, contact_email, established_year) VALUES
('DEPT_CS', 'Computer Science and Engineering', 'Dr. Anita Sen', 'hod.cse@uni.edu', 1995),
('DEPT_EC', 'Electronics and Communication Engineering', 'Dr. P. Kulkarni', 'hod.ece@uni.edu', 1998),
('DEPT_ME', 'Mechanical Engineering', 'Dr. K. Verma', 'hod.mech@uni.edu', 1992),
('DEPT_MGMT', 'Department of Management Studies', 'Dr. H. Saxena', 'hod.mgmt@uni.edu', 2004),
('DEPT_PHARM', 'School of Pharmaceutical Sciences', 'Dr. S. Bhardwaj', 'hod.pharm@uni.edu', 2010),
('DEPT_MED', 'Faculty of Medicine and Health Sciences', 'Dr. R. Kapoor', 'dean.med@uni.edu', 2001),
('DEPT_COMM', 'Department of Commerce', 'Dr. V. Singhania', 'hod.comm@uni.edu', 2008),
('DEPT_SCI', 'School of Pure & Applied Sciences', 'Dr. T. Murthy', 'hod.science@uni.edu', 1990);

-- 3. Courses
INSERT INTO courses (course_id, course_name, program_level, department_id, total_semesters, total_credits, assessment_rule) VALUES
('BTECH', 'Bachelor of Technology', 'Undergraduate', 'DEPT_CS', 8, 160, 'Internal:40%|External:60%|MinPassing:40%'),
('MTECH', 'Master of Technology', 'Postgraduate', 'DEPT_CS', 4, 80, 'Internal:40%|External:60%|MinPassing:50%'),
('BBA', 'Bachelor of Business Administration', 'Undergraduate', 'DEPT_MGMT', 6, 120, 'Internal:30%|External:70%|MinPassing:40%'),
('MBA', 'Master of Business Administration', 'Postgraduate', 'DEPT_MGMT', 4, 90, 'Internal:40%|External:60%|MinPassing:50%'),
('BPHARM', 'Bachelor of Pharmacy', 'Undergraduate', 'DEPT_PHARM', 8, 180, 'Internal:25%|External:75%|MinPassing:50%'),
('MBBS', 'Bachelor of Medicine and Surgery', 'Professional', 'DEPT_MED', 10, 240, 'Theory:50%|Clinical:50%|MinPassing:50%');

-- 4. Branches
INSERT INTO branches (branch_id, branch_name, course_id, intake_capacity) VALUES
('CSE', 'Computer Science and Engineering', 'BTECH', 120),
('AIDS', 'Artificial Intelligence & Data Science', 'BTECH', 60),
('AIML', 'Artificial Intelligence & Machine Learning', 'BTECH', 60),
('CYBER', 'Cyber Security', 'BTECH', 60),
('ECE', 'Electronics & Communication', 'BTECH', 90),
('MECH', 'Mechanical Engineering', 'BTECH', 60),
('FIN_MBA', 'MBA Finance & Analytics', 'MBA', 45),
('MKT_BBA', 'BBA Digital Marketing', 'BBA', 60),
('PHARM', 'B.Pharmacy Core', 'BPHARM', 60),
('MED', 'MBBS Clinical Medicine', 'MBBS', 100);

-- 5. Users (Staff and Sample Student accounts)
-- Passwords hashed (e.g. bcrypt for 'pass123')
INSERT INTO users (username, password_hash, email, full_name, role_id, department_id) VALUES
('dean.sharma', '$2a$10$wT8K8hL1hZ1JqF.R1/2sUO117hE6e0jWqY1hX2l7e3a6zB5n0f8Wy', 'rajesh.sharma@uni.edu', 'Prof. Rajesh Sharma (Dean Academics)', 1, 'DEPT_CS'),
('hod.anita', '$2a$10$wT8K8hL1hZ1JqF.R1/2sUO117hE6e0jWqY1hX2l7e3a6zB5n0f8Wy', 'anita.sen@uni.edu', 'Dr. Anita Sen (HOD CSE)', 2, 'DEPT_CS'),
('coord.vikram', '$2a$10$wT8K8hL1hZ1JqF.R1/2sUO117hE6e0jWqY1hX2l7e3a6zB5n0f8Wy', 'vikram.rao@uni.edu', 'Mr. Vikram Rao (Academic Coordinator)', 3, 'DEPT_CS'),
('student.240101', '$2a$10$wT8K8hL1hZ1JqF.R1/2sUO117hE6e0jWqY1hX2l7e3a6zB5n0f8Wy', 'aarav.patel@uni.edu', 'Aarav Patel (Student)', 4, 'DEPT_CS');

-- 6. Students
INSERT INTO students (enrollment_id, full_name, email, phone, course_id, branch_id, department_id, admission_year, current_year, current_semester, expected_graduation, status, cgpa, attendance_pct) VALUES
('240101', 'Aarav Patel', 'aarav.patel@uni.edu', '+91 98765 43210', 'BTECH', 'CSE', 'DEPT_CS', 2023, 2, 4, 2027, 'Active', 8.74, 86.5),
('240102', 'Priya Sharma', 'priya.sharma@uni.edu', '+91 98765 43211', 'BTECH', 'CSE', 'DEPT_CS', 2023, 2, 4, 2027, 'Active', 9.22, 91.0),
('240103', 'Rohan Verma', 'rohan.verma@uni.edu', '+91 98765 43212', 'BTECH', 'AIDS', 'DEPT_CS', 2023, 2, 4, 2027, 'Active', 7.40, 78.2),
('240104', 'Sneha Kulkarni', 'sneha.k@uni.edu', '+91 98765 43213', 'BTECH', 'ECE', 'DEPT_EC', 2022, 3, 6, 2026, 'Active', 8.55, 84.0),
('240105', 'Aditya Nair', 'aditya.n@uni.edu', '+91 98765 43214', 'BTECH', 'MECH', 'DEPT_ME', 2022, 3, 6, 2026, 'Active', 6.85, 69.5),
('240106', 'Ananya Roy', 'ananya.roy@uni.edu', '+91 98765 43215', 'MTECH', 'CSE', 'DEPT_CS', 2024, 1, 2, 2026, 'Active', 9.05, 94.2),
('240107', 'Kavya Iyer', 'kavya.iyer@uni.edu', '+91 98765 43216', 'MBA', 'FIN_MBA', 'DEPT_MGMT', 2023, 2, 4, 2025, 'Active', 8.90, 89.0),
('240108', 'Devansh Gupta', 'devansh.g@uni.edu', '+91 98765 43217', 'BBA', 'MKT_BBA', 'DEPT_MGMT', 2024, 1, 2, 2027, 'Active', 7.15, 72.4),
('240109', 'Meera Joshi', 'meera.j@uni.edu', '+91 98765 43218', 'BPHARM', 'PHARM', 'DEPT_PHARM', 2022, 3, 6, 2026, 'Active', 8.32, 87.6),
('240110', 'Vikramaditya Rao', 'vikram.rao@uni.edu', '+91 98765 43219', 'MBBS', 'MED', 'DEPT_MED', 2021, 4, 8, 2026, 'Active', 8.85, 92.5),
('240111', 'Rahul Sen', 'rahul.sen@uni.edu', '+91 98765 43220', 'BTECH', 'CSE', 'DEPT_CS', 2023, 2, 4, 2027, 'Active', 5.92, 62.0),
('240112', 'Zoya Khan', 'zoya.khan@uni.edu', '+91 98765 43221', 'BTECH', 'CYBER', 'DEPT_CS', 2023, 2, 4, 2027, 'Active', 8.60, 88.0);
