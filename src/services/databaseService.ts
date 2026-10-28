import {
  Department, Course, Branch, Subject, Student, SemesterMark,
  AttendanceRecord, Activity, Certificate, Project, Placement,
  SupportTicket, AuditLog
} from '../types';
import {
  INITIAL_DEPARTMENTS, INITIAL_COURSES, INITIAL_BRANCHES,
  INITIAL_SUBJECTS, INITIAL_STUDENTS, INITIAL_MARKS,
  INITIAL_ATTENDANCE, INITIAL_PROJECTS, INITIAL_CERTIFICATES,
  INITIAL_ACTIVITIES, INITIAL_PLACEMENTS, INITIAL_TICKETS
} from '../data/initialData';

const STORAGE_KEY = 'unitrack_database_v1';

export interface DatabaseState {
  departments: Department[];
  courses: Course[];
  branches: Branch[];
  subjects: Subject[];
  students: Student[];
  marks: SemesterMark[];
  attendance: AttendanceRecord[];
  projects: Project[];
  certificates: Certificate[];
  activities: Activity[];
  placements: Placement[];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
}

export class DatabaseService {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return {
      departments: [...INITIAL_DEPARTMENTS],
      courses: [...INITIAL_COURSES],
      branches: [...INITIAL_BRANCHES],
      subjects: [...INITIAL_SUBJECTS],
      students: [...INITIAL_STUDENTS],
      marks: [...INITIAL_MARKS],
      attendance: [...INITIAL_ATTENDANCE],
      projects: [...INITIAL_PROJECTS],
      certificates: [...INITIAL_CERTIFICATES],
      activities: [...INITIAL_ACTIVITIES],
      placements: [...INITIAL_PLACEMENTS],
      tickets: [...INITIAL_TICKETS],
      auditLogs: [
        {
          logId: 1,
          actionType: 'SYSTEM_INIT',
          entityName: 'DATABASE',
          entityId: 'ALL',
          performedBy: 'System Bootstrap',
          details: 'Initialized UniTrack AI database with multi-course seed datasets.',
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  public resetToDefault(): DatabaseState {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
    this.saveState();
    return this.getState();
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // --- Audit Logger ---
  public logAudit(actionType: string, entityName: string, entityId: string, performedBy: string, details: string): void {
    const newLog: AuditLog = {
      logId: Date.now(),
      actionType,
      entityName,
      entityId,
      performedBy,
      details,
      timestamp: new Date().toISOString()
    };
    this.state.auditLogs.unshift(newLog);
    this.saveState();
  }

  // --- Students CRUD ---
  public getStudents(): Student[] {
    return this.state.students;
  }

  public getStudentById(enrollmentId: string): Student | undefined {
    return this.state.students.find(s => s.enrollmentId === enrollmentId);
  }

  public addStudent(studentData: Omit<Student, 'cgpa' | 'attendancePct'> & { performedBy: string }): { success: boolean; message: string; student?: Student } {
    // 1. Validate 6-digit enrollment ID
    if (!/^\d{6}$/.test(studentData.enrollmentId)) {
      return { success: false, message: 'Enrollment ID must be strictly 6 numeric digits (e.g. 240101).' };
    }

    // 2. Check duplicates
    if (this.state.students.some(s => s.enrollmentId === studentData.enrollmentId)) {
      return { success: false, message: `Student with Enrollment ID ${studentData.enrollmentId} already exists.` };
    }

    if (this.state.students.some(s => s.email.toLowerCase() === studentData.email.toLowerCase())) {
      return { success: false, message: `Student with email ${studentData.email} already exists.` };
    }

    const newStudent: Student = {
      enrollmentId: studentData.enrollmentId,
      fullName: studentData.fullName,
      email: studentData.email,
      phone: studentData.phone,
      courseId: studentData.courseId,
      branchId: studentData.branchId,
      departmentId: studentData.departmentId,
      admissionYear: studentData.admissionYear,
      currentYear: studentData.currentYear,
      currentSemester: studentData.currentSemester,
      expectedGraduation: studentData.expectedGraduation,
      status: studentData.status || 'Active',
      avatarUrl: studentData.avatarUrl,
      cgpa: 0.0,
      attendancePct: 0.0,
      skills: studentData.skills || []
    };

    this.state.students.push(newStudent);
    this.logAudit('INSERT', 'STUDENT', newStudent.enrollmentId, studentData.performedBy, `Registered new student ${newStudent.fullName} (${newStudent.enrollmentId})`);
    this.saveState();
    return { success: true, message: 'Student registered successfully', student: newStudent };
  }

  public updateStudent(enrollmentId: string, updates: Partial<Student>, performedBy: string): boolean {
    const idx = this.state.students.findIndex(s => s.enrollmentId === enrollmentId);
    if (idx === -1) return false;

    this.state.students[idx] = { ...this.state.students[idx], ...updates };
    this.logAudit('UPDATE', 'STUDENT', enrollmentId, performedBy, `Updated profile attributes for ${enrollmentId}`);
    this.saveState();
    return true;
  }

  // --- Semester Marks & Grading ---
  public getMarksForStudent(enrollmentId: string, semester?: number): SemesterMark[] {
    return this.state.marks.filter(m => m.enrollmentId === enrollmentId && (semester === undefined || m.semester === semester));
  }

  public calculateStudentMetrics(enrollmentId: string): { cgpa: number; attendancePct: number; backlogsCount: number } {
    const studentMarks = this.state.marks.filter(m => m.enrollmentId === enrollmentId);
    const studentAtt = this.state.attendance.filter(a => a.enrollmentId === enrollmentId);

    // Calculate CGPA
    let totalCreditPoints = 0;
    let totalCredits = 0;
    let backlogs = 0;

    studentMarks.forEach(m => {
      const subject = this.state.subjects.find(s => s.subjectCode === m.subjectCode);
      const credits = subject ? subject.credits : 3;
      totalCreditPoints += (m.gradePoints * credits);
      totalCredits += credits;
      if (m.backlog || m.grade === 'F') {
        backlogs++;
      }
    });

    const cgpa = totalCredits > 0 ? Number((totalCreditPoints / totalCredits).toFixed(2)) : 0.0;

    // Calculate Attendance Pct
    let totalHeld = 0;
    let totalAttended = 0;
    studentAtt.forEach(a => {
      totalHeld += a.classesHeld;
      totalAttended += a.classesAttended;
    });

    const attendancePct = totalHeld > 0 ? Number(((totalAttended / totalHeld) * 100).toFixed(1)) : 0.0;

    return { cgpa, attendancePct, backlogsCount: backlogs };
  }

  public recordMarks(markData: Omit<SemesterMark, 'markId' | 'totalMarks' | 'grade' | 'gradePoints' | 'status' | 'backlog'>, performedBy: string): SemesterMark {
    const total = markData.internalMarks + markData.externalMarks + markData.practicalMarks;
    
    // Grading conversion rules (10-point UGC/AICTE standard)
    let grade: SemesterMark['grade'] = 'F';
    let gradePoints = 0;
    let status: 'Pass' | 'Fail' = 'Fail';
    let backlog = false;

    if (total >= 90) { grade = 'O'; gradePoints = 10; status = 'Pass'; }
    else if (total >= 80) { grade = 'A+'; gradePoints = 9; status = 'Pass'; }
    else if (total >= 70) { grade = 'A'; gradePoints = 8; status = 'Pass'; }
    else if (total >= 60) { grade = 'B+'; gradePoints = 7; status = 'Pass'; }
    else if (total >= 50) { grade = 'B'; gradePoints = 6; status = 'Pass'; }
    else if (total >= 40) { grade = 'C'; gradePoints = 5; status = 'Pass'; }
    else { grade = 'F'; gradePoints = 0; status = 'Fail'; backlog = true; }

    const existingIdx = this.state.marks.findIndex(m => m.enrollmentId === markData.enrollmentId && m.semester === markData.semester && m.subjectCode === markData.subjectCode);
    
    const newMark: SemesterMark = {
      markId: existingIdx >= 0 ? this.state.marks[existingIdx].markId : Date.now(),
      ...markData,
      totalMarks: total,
      grade,
      gradePoints,
      status,
      backlog
    };

    if (existingIdx >= 0) {
      this.state.marks[existingIdx] = newMark;
      this.logAudit('UPDATE', 'MARKS', `${markData.enrollmentId}-${markData.subjectCode}`, performedBy, `Updated marks for ${markData.subjectCode}: Total ${total}, Grade ${grade}`);
    } else {
      this.state.marks.push(newMark);
      this.logAudit('INSERT', 'MARKS', `${markData.enrollmentId}-${markData.subjectCode}`, performedBy, `Recorded marks for ${markData.subjectCode}: Total ${total}, Grade ${grade}`);
    }

    // Refresh student CGPA
    const metrics = this.calculateStudentMetrics(markData.enrollmentId);
    this.updateStudent(markData.enrollmentId, { cgpa: metrics.cgpa }, 'System');

    this.saveState();
    return newMark;
  }

  // --- Attendance ---
  public getAttendanceForStudent(enrollmentId: string, semester?: number): AttendanceRecord[] {
    return this.state.attendance.filter(a => a.enrollmentId === enrollmentId && (semester === undefined || a.semester === semester));
  }

  public recordAttendance(record: Omit<AttendanceRecord, 'attendanceId' | 'classesAbsent' | 'attendancePercentage' | 'status' | 'lastUpdated'>, performedBy: string): AttendanceRecord {
    const absent = Math.max(0, record.classesHeld - record.classesAttended);
    const pct = record.classesHeld > 0 ? Number(((record.classesAttended / record.classesHeld) * 100).toFixed(2)) : 0;
    const status: AttendanceRecord['status'] = pct >= 85 ? 'Good' : (pct >= 75 ? 'Satisfactory' : 'Shortage');

    const existingIdx = this.state.attendance.findIndex(a => a.enrollmentId === record.enrollmentId && a.semester === record.semester && a.subjectCode === record.subjectCode);
    
    const newRecord: AttendanceRecord = {
      attendanceId: existingIdx >= 0 ? this.state.attendance[existingIdx].attendanceId : Date.now(),
      ...record,
      classesAbsent: absent,
      attendancePercentage: pct,
      status,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    if (existingIdx >= 0) {
      this.state.attendance[existingIdx] = newRecord;
      this.logAudit('CORRECTION', 'ATTENDANCE', `${record.enrollmentId}-${record.subjectCode}`, performedBy, `Corrected attendance for ${record.subjectCode}: ${record.classesAttended}/${record.classesHeld} (${pct}%)`);
    } else {
      this.state.attendance.push(newRecord);
      this.logAudit('INSERT', 'ATTENDANCE', `${record.enrollmentId}-${record.subjectCode}`, performedBy, `Recorded attendance for ${record.subjectCode}: ${record.classesAttended}/${record.classesHeld} (${pct}%)`);
    }

    const metrics = this.calculateStudentMetrics(record.enrollmentId);
    this.updateStudent(record.enrollmentId, { attendancePct: metrics.attendancePct }, 'System');

    this.saveState();
    return newRecord;
  }

  // --- Support Tickets ---
  public getTickets(enrollmentId?: string): SupportTicket[] {
    if (enrollmentId) {
      return this.state.tickets.filter(t => t.enrollmentId === enrollmentId);
    }
    return this.state.tickets;
  }

  public createTicket(ticketData: Omit<SupportTicket, 'ticketId' | 'status' | 'createdAt'>): SupportTicket {
    const ticketId = `TKT-${new Date().getFullYear()}-${String(this.state.tickets.length + 42).padStart(4, '0')}`;
    const newTicket: SupportTicket = {
      ...ticketData,
      ticketId,
      status: 'Open',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.state.tickets.unshift(newTicket);
    this.logAudit('INSERT', 'SUPPORT_TICKET', ticketId, ticketData.enrollmentId, `Opened ticket ${ticketId}: ${ticketData.subject}`);
    this.saveState();
    return newTicket;
  }

  public updateTicketStatus(ticketId: string, status: SupportTicket['status'], resolutionNotes?: string, assignedCoordinator?: string, performedBy?: string): boolean {
    const idx = this.state.tickets.findIndex(t => t.ticketId === ticketId);
    if (idx === -1) return false;

    this.state.tickets[idx].status = status;
    if (resolutionNotes) this.state.tickets[idx].resolutionNotes = resolutionNotes;
    if (assignedCoordinator) this.state.tickets[idx].assignedCoordinator = assignedCoordinator;
    if (status === 'Resolved' || status === 'Closed') {
      this.state.tickets[idx].resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
    this.logAudit('UPDATE', 'SUPPORT_TICKET', ticketId, performedBy || 'Coordinator', `Updated status to ${status}`);
    this.saveState();
    return true;
  }

  // --- Talent Portfolio: Projects & Certificates ---
  public getProjectsForStudent(enrollmentId: string): Project[] {
    return this.state.projects.filter(p => p.enrollmentId === enrollmentId);
  }

  public addProject(project: Omit<Project, 'projectId' | 'verificationStatus'>, performedBy: string): Project {
    const newProj: Project = {
      ...project,
      projectId: Date.now(),
      verificationStatus: 'Pending'
    };
    this.state.projects.push(newProj);
    this.logAudit('INSERT', 'PROJECT', String(newProj.projectId), performedBy, `Submitted project: ${project.title}`);
    this.saveState();
    return newProj;
  }

  public getCertificatesForStudent(enrollmentId: string): Certificate[] {
    return this.state.certificates.filter(c => c.enrollmentId === enrollmentId);
  }

  public addCertificate(cert: Omit<Certificate, 'certificateId' | 'verificationStatus'>, performedBy: string): Certificate {
    const newCert: Certificate = {
      ...cert,
      certificateId: Date.now(),
      verificationStatus: 'Pending'
    };
    this.state.certificates.push(newCert);
    this.logAudit('INSERT', 'CERTIFICATE', String(newCert.certificateId), performedBy, `Submitted certificate: ${cert.title}`);
    this.saveState();
    return newCert;
  }

  public updateVerification(type: 'project' | 'certificate' | 'activity', id: number, status: 'Verified' | 'Rejected', performedBy: string): void {
    if (type === 'project') {
      const p = this.state.projects.find(i => i.projectId === id);
      if (p) p.verificationStatus = status;
    } else if (type === 'certificate') {
      const c = this.state.certificates.find(i => i.certificateId === id);
      if (c) c.verificationStatus = status;
    } else if (type === 'activity') {
      const a = this.state.activities.find(i => i.activityId === id);
      if (a) a.verificationStatus = status;
    }
    this.logAudit('VERIFICATION', type.toUpperCase(), String(id), performedBy, `Set verification status to ${status}`);
    this.saveState();
  }

  // --- CSV Parser & Importer ---
  public parseAndValidateCsv(csvText: string, datasetType: string): {
    isValid: boolean;
    totalRows: number;
    acceptedRows: number;
    rejectedRows: number;
    errors: string[];
    previewRows: Record<string, string>[];
  } {
    const lines = csvText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      return { isValid: false, totalRows: 0, acceptedRows: 0, rejectedRows: 0, errors: ['CSV contains no data rows.'], previewRows: [] };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const previewRows: Record<string, string>[] = [];
    const errors: string[] = [];
    let accepted = 0;
    let rejected = 0;

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV splitting handling commas
      const rawCols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (rawCols.length < headers.length) {
        errors.push(`Row ${i + 1}: Expected ${headers.length} columns, found ${rawCols.length}.`);
        rejected++;
        continue;
      }

      const rowObj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = rawCols[idx] || '';
      });

      // Dataset-specific validations
      let rowValid = true;

      if (datasetType === 'students') {
        const id = rowObj.enrollment_id;
        if (!id || !/^\d{6}$/.test(id)) {
          errors.push(`Row ${i + 1}: Enrollment ID '${id}' is not a valid 6-digit number.`);
          rowValid = false;
        }
      } else if (datasetType === 'semester_marks') {
        const id = rowObj.enrollment_id;
        const total = Number(rowObj.total_marks);
        if (id && !/^\d{6}$/.test(id)) {
          errors.push(`Row ${i + 1}: Enrollment ID '${id}' is not a valid 6-digit number.`);
          rowValid = false;
        }
        if (isNaN(total) || total < 0 || total > 100) {
          errors.push(`Row ${i + 1}: Total marks '${rowObj.total_marks}' must be between 0 and 100.`);
          rowValid = false;
        }
      } else if (datasetType === 'attendance') {
        const held = Number(rowObj.classes_held);
        const attended = Number(rowObj.classes_attended);
        if (isNaN(held) || isNaN(attended) || attended > held) {
          errors.push(`Row ${i + 1}: Classes attended (${attended}) cannot exceed classes held (${held}).`);
          rowValid = false;
        }
      }

      if (rowValid) {
        accepted++;
        if (previewRows.length < 5) previewRows.push(rowObj);
      } else {
        rejected++;
      }
    }

    return {
      isValid: errors.length === 0,
      totalRows: lines.length - 1,
      acceptedRows: accepted,
      rejectedRows: rejected,
      errors: errors.slice(0, 10), // return top 10
      previewRows
    };
  }

  public importCsvData(csvText: string, datasetType: string, performedBy: string): { importedCount: number; message: string } {
    const { acceptedRows, rejectedRows, errors } = this.parseAndValidateCsv(csvText, datasetType);
    if (acceptedRows === 0) {
      return { importedCount: 0, message: `Import aborted: 0 valid rows found. Errors: ${errors.join('; ')}` };
    }

    const lines = csvText.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
      const rawCols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = rawCols[idx] || ''; });

      if (datasetType === 'students' && /^\d{6}$/.test(row.enrollment_id)) {
        if (!this.state.students.some(s => s.enrollmentId === row.enrollment_id)) {
          this.state.students.push({
            enrollmentId: row.enrollment_id,
            fullName: row.full_name || 'Imported Student',
            email: row.email || `${row.enrollment_id}@uni.edu`,
            phone: row.phone || '+91 99000 00000',
            courseId: row.course_id || 'BTECH',
            branchId: row.branch_id || 'CSE',
            departmentId: row.department_id || 'DEPT_CS',
            admissionYear: Number(row.admission_year) || 2024,
            currentYear: Number(row.current_year) || 1,
            currentSemester: Number(row.current_semester) || 1,
            expectedGraduation: Number(row.expected_graduation) || 2028,
            status: 'Active',
            cgpa: Number(row.cgpa) || 0,
            attendancePct: Number(row.attendance_pct) || 85,
            skills: ['Imported Record']
          });
          count++;
        }
      }
    }

    this.logAudit('IMPORT_CSV', datasetType.toUpperCase(), `${count}_rows`, performedBy, `Imported ${count} rows from CSV (${rejectedRows} rejected).`);
    this.saveState();
    return { importedCount: count, message: `Successfully imported ${count} valid records into the active database.` };
  }
}

export const databaseService = new DatabaseService();
