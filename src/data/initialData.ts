import { Department, Course, Branch, Subject, Student, SemesterMark, AttendanceRecord, Activity, Certificate, Project, Placement, SupportTicket, User } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  { departmentId: 'DEPT_CS', departmentName: 'Computer Science and Engineering', hodName: 'Dr. Anita Sen', contactEmail: 'hod.cse@uni.edu', establishedYear: 1995 },
  { departmentId: 'DEPT_EC', departmentName: 'Electronics and Communication Engineering', hodName: 'Dr. P. Kulkarni', contactEmail: 'hod.ece@uni.edu', establishedYear: 1998 },
  { departmentId: 'DEPT_ME', departmentName: 'Mechanical Engineering', hodName: 'Dr. K. Verma', contactEmail: 'hod.mech@uni.edu', establishedYear: 1992 },
  { departmentId: 'DEPT_MGMT', departmentName: 'Department of Management Studies', hodName: 'Dr. H. Saxena', contactEmail: 'hod.mgmt@uni.edu', establishedYear: 2004 },
  { departmentId: 'DEPT_PHARM', departmentName: 'School of Pharmaceutical Sciences', hodName: 'Dr. S. Bhardwaj', contactEmail: 'hod.pharm@uni.edu', establishedYear: 2010 },
  { departmentId: 'DEPT_MED', departmentName: 'Faculty of Medicine and Health Sciences', hodName: 'Dr. R. Kapoor', contactEmail: 'dean.med@uni.edu', establishedYear: 2001 },
  { departmentId: 'DEPT_COMM', departmentName: 'Department of Commerce & Finance', hodName: 'Dr. V. Singhania', contactEmail: 'hod.comm@uni.edu', establishedYear: 2008 },
  { departmentId: 'DEPT_SCI', departmentName: 'School of Pure & Applied Sciences', hodName: 'Dr. T. Murthy', contactEmail: 'hod.science@uni.edu', establishedYear: 1990 },
];

export const INITIAL_COURSES: Course[] = [
  { courseId: 'BTECH', courseName: 'Bachelor of Technology', programLevel: 'Undergraduate', departmentId: 'DEPT_CS', totalSemesters: 8, totalCredits: 160, assessmentRule: 'Internal:40%|External:60%|MinPassing:40%' },
  { courseId: 'MTECH', courseName: 'Master of Technology', programLevel: 'Postgraduate', departmentId: 'DEPT_CS', totalSemesters: 4, totalCredits: 80, assessmentRule: 'Internal:40%|External:60%|MinPassing:50%' },
  { courseId: 'BBA', courseName: 'Bachelor of Business Administration', programLevel: 'Undergraduate', departmentId: 'DEPT_MGMT', totalSemesters: 6, totalCredits: 120, assessmentRule: 'Internal:30%|External:70%|MinPassing:40%' },
  { courseId: 'MBA', courseName: 'Master of Business Administration', programLevel: 'Postgraduate', departmentId: 'DEPT_MGMT', totalSemesters: 4, totalCredits: 90, assessmentRule: 'Internal:40%|External:60%|MinPassing:50%' },
  { courseId: 'BPHARM', courseName: 'Bachelor of Pharmacy', programLevel: 'Undergraduate', departmentId: 'DEPT_PHARM', totalSemesters: 8, totalCredits: 180, assessmentRule: 'Internal:25%|External:75%|MinPassing:50%' },
  { courseId: 'MBBS', courseName: 'Bachelor of Medicine & Surgery', programLevel: 'Professional', departmentId: 'DEPT_MED', totalSemesters: 10, totalCredits: 240, assessmentRule: 'Theory:50%|Clinical:50%|MinPassing:50%' },
];

export const INITIAL_BRANCHES: Branch[] = [
  { branchId: 'CSE', branchName: 'Computer Science and Engineering', courseId: 'BTECH', intakeCapacity: 120 },
  { branchId: 'AIDS', branchName: 'Artificial Intelligence & Data Science', courseId: 'BTECH', intakeCapacity: 60 },
  { branchId: 'AIML', branchName: 'Artificial Intelligence & Machine Learning', courseId: 'BTECH', intakeCapacity: 60 },
  { branchId: 'CYBER', branchName: 'Cyber Security', courseId: 'BTECH', intakeCapacity: 60 },
  { branchId: 'ECE', branchName: 'Electronics & Communication', courseId: 'BTECH', intakeCapacity: 90 },
  { branchId: 'MECH', branchName: 'Mechanical Engineering', courseId: 'BTECH', intakeCapacity: 60 },
  { branchId: 'FIN_MBA', branchName: 'MBA Finance & Analytics', courseId: 'MBA', intakeCapacity: 45 },
  { branchId: 'MKT_BBA', branchName: 'BBA Digital Marketing', courseId: 'BBA', intakeCapacity: 60 },
  { branchId: 'PHARM', branchName: 'B.Pharmacy Core', courseId: 'BPHARM', intakeCapacity: 60 },
  { branchId: 'MED', branchName: 'MBBS Clinical Medicine', courseId: 'MBBS', intakeCapacity: 100 },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { subjectCode: 'CS101', subjectName: 'Engineering Mathematics I', courseId: 'BTECH', semester: 1, credits: 4, facultyName: 'Prof. R. Sharma', maxInternal: 40, maxExternal: 60, maxPractical: 0, description: 'Calculus, linear algebra, eigenvalues and differential equations.' },
  { subjectCode: 'CS102', subjectName: 'Problem Solving & C Programming', courseId: 'BTECH', semester: 1, credits: 4, facultyName: 'Dr. V. Rao', maxInternal: 30, maxExternal: 50, maxPractical: 20, description: 'Control structures, memory addressing, pointers and arrays.' },
  { subjectCode: 'CS103', subjectName: 'Physics for Computing', courseId: 'BTECH', semester: 1, credits: 3, facultyName: 'Dr. T. Murthy', maxInternal: 30, maxExternal: 50, maxPractical: 20, description: 'Quantum concepts, semiconductors and fiber optics.' },
  
  { subjectCode: 'CS201', subjectName: 'Data Structures & Algorithms', courseId: 'BTECH', semester: 3, credits: 4, facultyName: 'Dr. V. Rao', maxInternal: 30, maxExternal: 50, maxPractical: 20, description: 'Trees, balanced trees, graph algorithms and dynamic programming.' },
  { subjectCode: 'CS202', subjectName: 'Database Management Systems', courseId: 'BTECH', semester: 3, credits: 4, facultyName: 'Dr. Anita Sen', maxInternal: 30, maxExternal: 50, maxPractical: 20, description: 'Relational algebra, SQL, B+ trees, ACID transactions.' },
  { subjectCode: 'CS203', subjectName: 'Computer Organization & Architecture', courseId: 'BTECH', semester: 3, credits: 3, facultyName: 'Prof. P. Kulkarni', maxInternal: 40, maxExternal: 60, maxPractical: 0, description: 'Pipelines, instruction set architecture and cache coherence.' },

  { subjectCode: 'CS301', subjectName: 'Design & Analysis of Algorithms', courseId: 'BTECH', semester: 4, credits: 4, facultyName: 'Dr. S. Mehta', maxInternal: 30, maxExternal: 50, maxPractical: 20, description: 'Greedy algorithms, NP-completeness and approximation.' },
  { subjectCode: 'CS302', subjectName: 'Operating Systems & Kernels', courseId: 'BTECH', semester: 4, credits: 4, facultyName: 'Prof. M. Joshi', maxInternal: 30, maxExternal: 50, maxPractical: 20, description: 'Process scheduling, virtual memory, threads and POSIX.' },
  { subjectCode: 'CS303', subjectName: 'Computer Networks', courseId: 'BTECH', semester: 4, credits: 4, facultyName: 'Dr. K. Nair', maxInternal: 30, maxExternal: 50, maxPractical: 20, description: 'TCP/IP architecture, routing algorithms and network sockets.' },
  { subjectCode: 'CS304', subjectName: 'Artificial Intelligence Principles', courseId: 'BTECH', semester: 4, credits: 3, facultyName: 'Dr. Anita Sen', maxInternal: 30, maxExternal: 70, maxPractical: 0, description: 'Heuristic search, logic reasoning and constraint satisfaction.' },

  { subjectCode: 'CS401', subjectName: 'Machine Learning & Deep Neural Nets', courseId: 'BTECH', semester: 5, credits: 4, facultyName: 'Dr. Anita Sen', maxInternal: 30, maxExternal: 50, maxPractical: 20, description: 'Supervised/unsupervised models, CNN, RNN and transformers.' },
  { subjectCode: 'CS402', subjectName: 'Cloud Computing & Distributed Systems', courseId: 'BTECH', semester: 5, credits: 3, facultyName: 'Prof. A. Bansal', maxInternal: 30, maxExternal: 70, maxPractical: 0, description: 'Kubernetes, microservices, AWS and distributed consensus.' },

  { subjectCode: 'EC201', subjectName: 'Digital Signal Processing', courseId: 'BTECH', semester: 4, credits: 4, facultyName: 'Dr. P. Kulkarni', maxInternal: 30, maxExternal: 50, maxPractical: 20, description: 'Z-transforms, FFT, IIR/FIR filter design.' },
  { subjectCode: 'ME201', subjectName: 'Applied Thermodynamics', courseId: 'BTECH', semester: 4, credits: 4, facultyName: 'Dr. K. Verma', maxInternal: 40, maxExternal: 60, maxPractical: 0, description: 'Carnot cycle, steam turbines and combustion.' },
  { subjectCode: 'MBA201', subjectName: 'Corporate Finance & Valuation', courseId: 'MBA', semester: 2, credits: 4, facultyName: 'Dr. H. Saxena', maxInternal: 40, maxExternal: 60, maxPractical: 0, description: 'DCF valuation, M&A and capital budgeting.' },
  { subjectCode: 'MED301', subjectName: 'Pathology & Diagnostics', courseId: 'MBBS', semester: 3, credits: 6, facultyName: 'Dr. R. Kapoor', maxInternal: 40, maxExternal: 40, maxPractical: 20, description: 'Systemic pathology, biopsy review and histology.' }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    enrollmentId: '240101',
    fullName: 'Aarav Patel',
    email: 'aarav.patel@uni.edu',
    phone: '+91 98765 43210',
    courseId: 'BTECH',
    branchId: 'CSE',
    departmentId: 'DEPT_CS',
    admissionYear: 2023,
    currentYear: 2,
    currentSemester: 4,
    expectedGraduation: 2027,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    cgpa: 8.74,
    attendancePct: 86.5,
    skills: ['Python', 'React', 'Data Structures', 'AWS', 'TensorFlow', 'PostgreSQL']
  },
  {
    enrollmentId: '240102',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@uni.edu',
    phone: '+91 98765 43211',
    courseId: 'BTECH',
    branchId: 'CSE',
    departmentId: 'DEPT_CS',
    admissionYear: 2023,
    currentYear: 2,
    currentSemester: 4,
    expectedGraduation: 2027,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    cgpa: 9.22,
    attendancePct: 91.0,
    skills: ['Machine Learning', 'Computer Vision', 'PyTorch', 'C++', 'GCP', 'Research']
  },
  {
    enrollmentId: '240103',
    fullName: 'Rohan Verma',
    email: 'rohan.verma@uni.edu',
    phone: '+91 98765 43212',
    courseId: 'BTECH',
    branchId: 'AIDS',
    departmentId: 'DEPT_CS',
    admissionYear: 2023,
    currentYear: 2,
    currentSemester: 4,
    expectedGraduation: 2027,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    cgpa: 7.40,
    attendancePct: 78.2,
    skills: ['Python', 'Docker', 'Kubernetes', 'SQL', 'FastAPI']
  },
  {
    enrollmentId: '240104',
    fullName: 'Sneha Kulkarni',
    email: 'sneha.k@uni.edu',
    phone: '+91 98765 43213',
    courseId: 'BTECH',
    branchId: 'ECE',
    departmentId: 'DEPT_EC',
    admissionYear: 2022,
    currentYear: 3,
    currentSemester: 6,
    expectedGraduation: 2026,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    cgpa: 8.55,
    attendancePct: 84.0,
    skills: ['VHDL', 'ARM Cortex', 'IoT', 'C', 'Digital Electronics']
  },
  {
    enrollmentId: '240105',
    fullName: 'Aditya Nair',
    email: 'aditya.n@uni.edu',
    phone: '+91 98765 43214',
    courseId: 'BTECH',
    branchId: 'MECH',
    departmentId: 'DEPT_ME',
    admissionYear: 2022,
    currentYear: 3,
    currentSemester: 6,
    expectedGraduation: 2026,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    cgpa: 6.85,
    attendancePct: 69.5, // Attendance Shortage Alert
    skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Thermodynamics']
  },
  {
    enrollmentId: '240106',
    fullName: 'Ananya Roy',
    email: 'ananya.roy@uni.edu',
    phone: '+91 98765 43215',
    courseId: 'MTECH',
    branchId: 'CSE',
    departmentId: 'DEPT_CS',
    admissionYear: 2024,
    currentYear: 1,
    currentSemester: 2,
    expectedGraduation: 2026,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
    cgpa: 9.05,
    attendancePct: 94.2,
    skills: ['Distributed Systems', 'Go', 'Apache Spark', 'Algorithms']
  },
  {
    enrollmentId: '240107',
    fullName: 'Kavya Iyer',
    email: 'kavya.iyer@uni.edu',
    phone: '+91 98765 43216',
    courseId: 'MBA',
    branchId: 'FIN_MBA',
    departmentId: 'DEPT_MGMT',
    admissionYear: 2023,
    currentYear: 2,
    currentSemester: 4,
    expectedGraduation: 2025,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    cgpa: 8.90,
    attendancePct: 89.0,
    skills: ['DCF Valuation', 'Financial Modeling', 'Tableau', 'Excel']
  },
  {
    enrollmentId: '240108',
    fullName: 'Devansh Gupta',
    email: 'devansh.g@uni.edu',
    phone: '+91 98765 43217',
    courseId: 'BBA',
    branchId: 'MKT_BBA',
    departmentId: 'DEPT_MGMT',
    admissionYear: 2024,
    currentYear: 1,
    currentSemester: 2,
    expectedGraduation: 2027,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
    cgpa: 7.15,
    attendancePct: 72.4, // Shortage warning
    skills: ['SEO', 'Google Analytics', 'Brand Strategy', 'Public Relations']
  },
  {
    enrollmentId: '240109',
    fullName: 'Meera Joshi',
    email: 'meera.j@uni.edu',
    phone: '+91 98765 43218',
    courseId: 'BPHARM',
    branchId: 'PHARM',
    departmentId: 'DEPT_PHARM',
    admissionYear: 2022,
    currentYear: 3,
    currentSemester: 6,
    expectedGraduation: 2026,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    cgpa: 8.32,
    attendancePct: 87.6,
    skills: ['Pharmacology', 'HPLC', 'Drug Formulations', 'Biostatistics']
  },
  {
    enrollmentId: '240110',
    fullName: 'Vikramaditya Rao',
    email: 'vikram.rao@uni.edu',
    phone: '+91 98765 43219',
    courseId: 'MBBS',
    branchId: 'MED',
    departmentId: 'DEPT_MED',
    admissionYear: 2021,
    currentYear: 4,
    currentSemester: 8,
    expectedGraduation: 2026,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    cgpa: 8.85,
    attendancePct: 92.5,
    skills: ['Clinical Diagnostics', 'Pathology', 'Internal Medicine', 'Surgery']
  },
  {
    enrollmentId: '240111',
    fullName: 'Rahul Sen',
    email: 'rahul.sen@uni.edu',
    phone: '+91 98765 43220',
    courseId: 'BTECH',
    branchId: 'CSE',
    departmentId: 'DEPT_CS',
    admissionYear: 2023,
    currentYear: 2,
    currentSemester: 4,
    expectedGraduation: 2027,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80',
    cgpa: 5.92, // Academic Support High Risk
    attendancePct: 62.0, // Attendance Shortage Alert
    skills: ['Basic C', 'HTML/CSS']
  },
  {
    enrollmentId: '240112',
    fullName: 'Zoya Khan',
    email: 'zoya.khan@uni.edu',
    phone: '+91 98765 43221',
    courseId: 'BTECH',
    branchId: 'CYBER',
    departmentId: 'DEPT_CS',
    admissionYear: 2023,
    currentYear: 2,
    currentSemester: 4,
    expectedGraduation: 2027,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    cgpa: 8.60,
    attendancePct: 88.0,
    skills: ['Network Security', 'Wireshark', 'Metasploit', 'Cryptography', 'Linux']
  }
];

export const INITIAL_MARKS: SemesterMark[] = [
  // Aarav Patel (240101) - Sem 1
  { markId: 1, enrollmentId: '240101', semester: 1, subjectCode: 'CS101', internalMarks: 36, externalMarks: 54, practicalMarks: 0, totalMarks: 90, grade: 'O', gradePoints: 10, status: 'Pass', backlog: false },
  { markId: 2, enrollmentId: '240101', semester: 1, subjectCode: 'CS102', internalMarks: 27, externalMarks: 45, practicalMarks: 18, totalMarks: 90, grade: 'O', gradePoints: 10, status: 'Pass', backlog: false },
  { markId: 3, enrollmentId: '240101', semester: 1, subjectCode: 'CS103', internalMarks: 25, externalMarks: 44, practicalMarks: 17, totalMarks: 86, grade: 'A+', gradePoints: 9, status: 'Pass', backlog: false },
  
  // Aarav Patel (240101) - Sem 3
  { markId: 4, enrollmentId: '240101', semester: 3, subjectCode: 'CS201', internalMarks: 26, externalMarks: 42, practicalMarks: 17, totalMarks: 85, grade: 'A+', gradePoints: 9, status: 'Pass', backlog: false },
  { markId: 5, enrollmentId: '240101', semester: 3, subjectCode: 'CS202', internalMarks: 25, externalMarks: 40, practicalMarks: 16, totalMarks: 81, grade: 'A+', gradePoints: 9, status: 'Pass', backlog: false },
  { markId: 6, enrollmentId: '240101', semester: 3, subjectCode: 'CS203', internalMarks: 33, externalMarks: 49, practicalMarks: 0, totalMarks: 82, grade: 'A+', gradePoints: 9, status: 'Pass', backlog: false },

  // Aarav Patel (240101) - Sem 4 (Current)
  { markId: 7, enrollmentId: '240101', semester: 4, subjectCode: 'CS301', internalMarks: 28, externalMarks: 44, practicalMarks: 18, totalMarks: 90, grade: 'O', gradePoints: 10, status: 'Pass', backlog: false },
  { markId: 8, enrollmentId: '240101', semester: 4, subjectCode: 'CS302', internalMarks: 24, externalMarks: 38, practicalMarks: 16, totalMarks: 78, grade: 'A', gradePoints: 8, status: 'Pass', backlog: false },
  { markId: 9, enrollmentId: '240101', semester: 4, subjectCode: 'CS303', internalMarks: 27, externalMarks: 41, practicalMarks: 18, totalMarks: 86, grade: 'A+', gradePoints: 9, status: 'Pass', backlog: false },
  { markId: 10, enrollmentId: '240101', semester: 4, subjectCode: 'CS304', internalMarks: 25, externalMarks: 58, practicalMarks: 0, totalMarks: 83, grade: 'A+', gradePoints: 9, status: 'Pass', backlog: false },

  // Priya Sharma (240102) - Sem 4
  { markId: 11, enrollmentId: '240102', semester: 4, subjectCode: 'CS301', internalMarks: 29, externalMarks: 48, practicalMarks: 19, totalMarks: 96, grade: 'O', gradePoints: 10, status: 'Pass', backlog: false },
  { markId: 12, enrollmentId: '240102', semester: 4, subjectCode: 'CS302', internalMarks: 28, externalMarks: 45, practicalMarks: 18, totalMarks: 91, grade: 'O', gradePoints: 10, status: 'Pass', backlog: false },
  { markId: 13, enrollmentId: '240102', semester: 4, subjectCode: 'CS303', internalMarks: 28, externalMarks: 46, practicalMarks: 19, totalMarks: 93, grade: 'O', gradePoints: 10, status: 'Pass', backlog: false },
  { markId: 14, enrollmentId: '240102', semester: 4, subjectCode: 'CS304', internalMarks: 28, externalMarks: 64, practicalMarks: 0, totalMarks: 92, grade: 'O', gradePoints: 10, status: 'Pass', backlog: false },

  // Rahul Sen (240111) - Sem 4 (Backlogs & At Risk)
  { markId: 15, enrollmentId: '240111', semester: 4, subjectCode: 'CS301', internalMarks: 14, externalMarks: 22, practicalMarks: 11, totalMarks: 47, grade: 'C', gradePoints: 5, status: 'Pass', backlog: false },
  { markId: 16, enrollmentId: '240111', semester: 4, subjectCode: 'CS302', internalMarks: 12, externalMarks: 18, practicalMarks: 8, totalMarks: 38, grade: 'F', gradePoints: 0, status: 'Fail', backlog: true },
  { markId: 17, enrollmentId: '240111', semester: 4, subjectCode: 'CS303', internalMarks: 15, externalMarks: 24, practicalMarks: 10, totalMarks: 49, grade: 'C', gradePoints: 5, status: 'Pass', backlog: false },
  { markId: 18, enrollmentId: '240111', semester: 4, subjectCode: 'CS304', internalMarks: 14, externalMarks: 25, practicalMarks: 0, totalMarks: 39, grade: 'F', gradePoints: 0, status: 'Fail', backlog: true },

  // Aditya Nair (240105) - Sem 4
  { markId: 19, enrollmentId: '240105', semester: 4, subjectCode: 'ME201', internalMarks: 22, externalMarks: 34, practicalMarks: 0, totalMarks: 56, grade: 'B', gradePoints: 6, status: 'Pass', backlog: false },

  // Kavya Iyer (240107) - MBA Sem 2
  { markId: 20, enrollmentId: '240107', semester: 2, subjectCode: 'MBA201', internalMarks: 35, externalMarks: 52, practicalMarks: 0, totalMarks: 87, grade: 'A+', gradePoints: 9, status: 'Pass', backlog: false },

  // Vikramaditya Rao (240110) - MBBS Sem 3
  { markId: 21, enrollmentId: '240110', semester: 3, subjectCode: 'MED301', internalMarks: 34, externalMarks: 36, practicalMarks: 18, totalMarks: 88, grade: 'A+', gradePoints: 9, status: 'Pass', backlog: false },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Aarav Patel (240101) - Sem 4
  { attendanceId: 1, enrollmentId: '240101', semester: 4, subjectCode: 'CS301', classesHeld: 48, classesAttended: 42, classesAbsent: 6, attendancePercentage: 87.50, status: 'Satisfactory', lastUpdated: '2026-10-25' },
  { attendanceId: 2, enrollmentId: '240101', semester: 4, subjectCode: 'CS302', classesHeld: 46, classesAttended: 39, classesAbsent: 7, attendancePercentage: 84.78, status: 'Satisfactory', lastUpdated: '2026-10-25' },
  { attendanceId: 3, enrollmentId: '240101', semester: 4, subjectCode: 'CS303', classesHeld: 44, classesAttended: 38, classesAbsent: 6, attendancePercentage: 86.36, status: 'Satisfactory', lastUpdated: '2026-10-25' },
  { attendanceId: 4, enrollmentId: '240101', semester: 4, subjectCode: 'CS304', classesHeld: 38, classesAttended: 33, classesAbsent: 5, attendancePercentage: 86.84, status: 'Satisfactory', lastUpdated: '2026-10-25' },

  // Priya Sharma (240102) - Sem 4
  { attendanceId: 5, enrollmentId: '240102', semester: 4, subjectCode: 'CS301', classesHeld: 48, classesAttended: 45, classesAbsent: 3, attendancePercentage: 93.75, status: 'Good', lastUpdated: '2026-10-25' },
  { attendanceId: 6, enrollmentId: '240102', semester: 4, subjectCode: 'CS302', classesHeld: 46, classesAttended: 42, classesAbsent: 4, attendancePercentage: 91.30, status: 'Good', lastUpdated: '2026-10-25' },
  { attendanceId: 7, enrollmentId: '240102', semester: 4, subjectCode: 'CS303', classesHeld: 44, classesAttended: 40, classesAbsent: 4, attendancePercentage: 90.91, status: 'Good', lastUpdated: '2026-10-25' },
  { attendanceId: 8, enrollmentId: '240102', semester: 4, subjectCode: 'CS304', classesHeld: 38, classesAttended: 34, classesAbsent: 4, attendancePercentage: 89.47, status: 'Good', lastUpdated: '2026-10-25' },

  // Rahul Sen (240111) - Sem 4 (Severe Shortage)
  { attendanceId: 9, enrollmentId: '240111', semester: 4, subjectCode: 'CS301', classesHeld: 48, classesAttended: 30, classesAbsent: 18, attendancePercentage: 62.50, status: 'Shortage', lastUpdated: '2026-10-25' },
  { attendanceId: 10, enrollmentId: '240111', semester: 4, subjectCode: 'CS302', classesHeld: 46, classesAttended: 28, classesAbsent: 18, attendancePercentage: 60.87, status: 'Shortage', lastUpdated: '2026-10-25' },
  { attendanceId: 11, enrollmentId: '240111', semester: 4, subjectCode: 'CS303', classesHeld: 44, classesAttended: 27, classesAbsent: 17, attendancePercentage: 61.36, status: 'Shortage', lastUpdated: '2026-10-25' },
  { attendanceId: 12, enrollmentId: '240111', semester: 4, subjectCode: 'CS304', classesHeld: 38, classesAttended: 24, classesAbsent: 14, attendancePercentage: 63.16, status: 'Shortage', lastUpdated: '2026-10-25' },

  // Aditya Nair (240105)
  { attendanceId: 13, enrollmentId: '240105', semester: 4, subjectCode: 'ME201', classesHeld: 52, classesAttended: 36, classesAbsent: 16, attendancePercentage: 69.23, status: 'Shortage', lastUpdated: '2026-10-25' }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    projectId: 1,
    enrollmentId: '240101',
    semester: 4,
    title: 'UniTrack AI Analytics Module',
    techStack: 'React, TypeScript, FastAPI, Scikit-learn, PostgreSQL',
    repoUrl: 'https://github.com/aaravpatel/unitrack-ai-module',
    liveDemoUrl: 'https://unitrack-demo.uni.edu',
    description: 'Designed and implemented machine learning feature pipeline for multi-semester university student dropout risk evaluation.',
    verificationStatus: 'Verified'
  },
  {
    projectId: 2,
    enrollmentId: '240101',
    semester: 3,
    title: 'Distributed IoT Crop Health Telemetry',
    techStack: 'ESP32, MQTT, Node.js, TimescaleDB',
    repoUrl: 'https://github.com/aaravpatel/iot-crop-telemetry',
    description: 'Soil moisture, NPK sensors, and edge AI inferencing pipeline for precision irrigation.',
    verificationStatus: 'Verified'
  },
  {
    projectId: 3,
    enrollmentId: '240102',
    semester: 4,
    title: 'Vision Transformer Defect Segmentation',
    techStack: 'PyTorch, Hugging Face, OpenCV, CUDA',
    repoUrl: 'https://github.com/priyasharma/vit-defect-seg',
    description: 'Co-authored paper accepted at IEEE ICASSP 2026 for sub-millimeter industrial silicon wafer defect inspection.',
    verificationStatus: 'Verified'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    certificateId: 1,
    enrollmentId: '240101',
    title: 'AWS Certified Solutions Architect - Associate',
    issuingAuthority: 'Amazon Web Services',
    issueDate: '2025-09-15',
    expiryDate: '2028-09-15',
    credentialId: 'AWS-SAA-8392019',
    verificationStatus: 'Verified',
    skillsCovered: 'Cloud Architecture, S3, EC2, VPC, IAM, DynamoDB'
  },
  {
    certificateId: 2,
    enrollmentId: '240101',
    title: 'TensorFlow Developer Certificate',
    issuingAuthority: 'Google / DeepLearning.AI',
    issueDate: '2025-06-20',
    expiryDate: '2028-06-20',
    credentialId: 'TF-CERT-90412',
    verificationStatus: 'Verified',
    skillsCovered: 'Deep Learning, CNN, NLP, Time Series'
  },
  {
    certificateId: 3,
    enrollmentId: '240102',
    title: 'Google Cloud Professional Data Engineer',
    issuingAuthority: 'Google Cloud Platform',
    issueDate: '2025-10-10',
    expiryDate: '2027-10-10',
    credentialId: 'GCP-PDE-449102',
    verificationStatus: 'Verified',
    skillsCovered: 'BigQuery, Dataflow, Apache Beam, Vertex AI'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    activityId: 1,
    enrollmentId: '240101',
    semester: 3,
    category: 'Hackathon',
    title: 'Smart India Hackathon Finalist',
    description: 'Selected among top 10 national teams in the Smart Automation track.',
    organizationEvent: 'Ministry of Education & AICTE',
    achievement: 'National Finalist & Cash Prize',
    verificationStatus: 'Verified',
    dateRecorded: '2025-11-14'
  },
  {
    activityId: 2,
    enrollmentId: '240102',
    semester: 4,
    category: 'Research Paper',
    title: 'Defect Detection via Vision Transformers',
    description: 'Published primary research on wafer segmentation at IEEE ICASSP 2026.',
    organizationEvent: 'IEEE Student Branch',
    achievement: 'Best Student Paper Nomination',
    verificationStatus: 'Verified',
    dateRecorded: '2026-02-18'
  },
  {
    activityId: 3,
    enrollmentId: '240104',
    semester: 5,
    category: 'Sports',
    title: 'Inter-University Badminton Championship',
    description: 'Led varsity women team to tournament runner-up.',
    organizationEvent: 'State Universities Athletic Board',
    achievement: 'Silver Medalist',
    verificationStatus: 'Verified',
    dateRecorded: '2025-12-10'
  }
];

export const INITIAL_PLACEMENTS: Placement[] = [
  {
    placementId: 1,
    enrollmentId: '240107',
    companyName: 'Morgan Stanley',
    jobRole: 'Investment Banking Summer Analyst',
    packageCtcLpa: 18.5,
    offerDate: '2025-07-25',
    status: 'Accepted'
  },
  {
    placementId: 2,
    enrollmentId: '240102',
    companyName: 'Google India',
    jobRole: 'Software Engineer - AI/ML',
    packageCtcLpa: 32.0,
    offerDate: '2026-01-15',
    status: 'Accepted'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    ticketId: 'TKT-2026-0041',
    enrollmentId: '240111',
    category: 'Missing or incorrect marks',
    subject: 'CS302 Internal marks discrepancy',
    description: 'My assignment 2 marks (8/10) were not reflected in the published internal total of 12.',
    priority: 'High',
    status: 'In Progress',
    assignedCoordinator: 'Mr. Vikram Rao (Coordinator)',
    createdAt: '2026-10-20 09:30:00',
    resolutionNotes: 'Verification underway with Prof. M. Joshi.'
  },
  {
    ticketId: 'TKT-2026-0038',
    enrollmentId: '240105',
    category: 'Attendance disputes',
    subject: 'Medical leave attendance reconciliation',
    description: 'Submitted medical certificate for 5 days fever leave (Oct 5-10).',
    priority: 'Medium',
    status: 'Resolved',
    assignedCoordinator: 'Mr. Vikram Rao (Coordinator)',
    createdAt: '2026-10-12 11:15:00',
    resolvedAt: '2026-10-15 14:00:00',
    resolutionNotes: 'Medical certificate verified by university dispensary. 10 class hours condoned.'
  },
  {
    ticketId: 'TKT-2026-0045',
    enrollmentId: '240103',
    category: 'Semester and subject information',
    subject: 'Elective subject change confirmation',
    description: 'Request confirmation on elective switch from AI Principles to Cloud Computing.',
    priority: 'Low',
    status: 'Open',
    assignedCoordinator: 'Unassigned',
    createdAt: '2026-10-26 14:20:00'
  }
];

export const DEMO_USERS: User[] = [
  {
    id: 'user_dean',
    username: 'dean.sharma',
    fullName: 'Prof. Rajesh Sharma',
    email: 'rajesh.sharma@uni.edu',
    role: 'DEAN',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'user_hod',
    username: 'anita.sen',
    fullName: 'Dr. Anita Sen',
    email: 'anita.sen@uni.edu',
    role: 'HOD',
    departmentId: 'DEPT_CS',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'user_coord',
    username: 'vikram.rao',
    fullName: 'Mr. Vikram Rao',
    email: 'vikram.rao@uni.edu',
    role: 'COORDINATOR',
    departmentId: 'DEPT_CS',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'user_student',
    username: 'aarav.patel',
    fullName: 'Aarav Patel',
    email: 'aarav.patel@uni.edu',
    role: 'STUDENT',
    associatedEnrollmentId: '240101',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
  }
];
