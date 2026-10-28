export type UserRole = 'DEAN' | 'HOD' | 'COORDINATOR' | 'STUDENT';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  avatarUrl?: string;
  associatedEnrollmentId?: string;
}

export interface Department {
  departmentId: string;
  departmentName: string;
  hodName: string;
  contactEmail: string;
  establishedYear: number;
}

export interface Course {
  courseId: string;
  courseName: string;
  programLevel: 'Undergraduate' | 'Postgraduate' | 'Professional' | 'Doctoral';
  departmentId: string;
  totalSemesters: number;
  totalCredits: number;
  assessmentRule: string;
}

export interface Branch {
  branchId: string;
  branchName: string;
  courseId: string;
  intakeCapacity: number;
}

export interface Subject {
  subjectCode: string;
  subjectName: string;
  courseId: string;
  semester: number;
  credits: number;
  facultyName: string;
  maxInternal: number;
  maxExternal: number;
  maxPractical: number;
  description: string;
}

export interface Student {
  enrollmentId: string; // strict 6-digit ID
  fullName: string;
  email: string;
  phone: string;
  courseId: string;
  branchId: string;
  departmentId: string;
  admissionYear: number;
  currentYear: number;
  currentSemester: number;
  expectedGraduation: number;
  status: 'Active' | 'On Leave' | 'Graduated' | 'Suspended';
  avatarUrl?: string;
  cgpa: number;
  attendancePct: number;
  skills?: string[];
}

export interface SemesterMark {
  markId: number;
  enrollmentId: string;
  semester: number;
  subjectCode: string;
  internalMarks: number;
  externalMarks: number;
  practicalMarks: number;
  totalMarks: number;
  grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';
  gradePoints: number;
  status: 'Pass' | 'Fail';
  backlog: boolean;
}

export interface AttendanceRecord {
  attendanceId: number;
  enrollmentId: string;
  semester: number;
  subjectCode: string;
  classesHeld: number;
  classesAttended: number;
  classesAbsent: number;
  attendancePercentage: number;
  status: 'Good' | 'Satisfactory' | 'Shortage';
  lastUpdated: string;
}

export interface Activity {
  activityId: number;
  enrollmentId: string;
  semester: number;
  category: 'Hackathon' | 'Research Paper' | 'Internship' | 'Workshop' | 'Sports' | 'Cultural' | 'Bootcamp';
  title: string;
  description: string;
  organizationEvent: string;
  achievement: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  dateRecorded: string;
}

export interface Certificate {
  certificateId: number;
  enrollmentId: string;
  title: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  skillsCovered: string;
}

export interface Project {
  projectId: number;
  enrollmentId: string;
  semester: number;
  title: string;
  techStack: string;
  repoUrl?: string;
  liveDemoUrl?: string;
  description: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
}

export interface Placement {
  placementId: number;
  enrollmentId: string;
  companyName: string;
  jobRole: string;
  packageCtcLpa: number;
  offerDate: string;
  status: 'Offered' | 'Accepted' | 'Declined';
}

export interface SupportTicket {
  ticketId: string;
  enrollmentId: string;
  category:
    | 'Login and account access'
    | 'Enrollment ID issues'
    | 'Missing or incorrect marks'
    | 'Attendance disputes'
    | 'Semester and subject information'
    | 'Profile and photograph updates'
    | 'Certificate or activity corrections'
    | 'General technical support';
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedCoordinator?: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface AuditLog {
  logId: number;
  actionType: string;
  entityName: string;
  entityId: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

export interface MLPrediction {
  predictedCgpa: number;
  confidenceRange: [number, number];
  riskScore: number;
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  supportNeeded: boolean;
  riskFactors: string[];
  recommendations: string[];
}
