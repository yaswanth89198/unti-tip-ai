import { Student, SemesterMark, Course, Department } from '../types';

export class ExportService {
  /**
   * Triggers a browser file download of CSV content
   */
  public downloadCsv(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Exports student list to CSV
   */
  public exportStudentsToCsv(students: Student[], courses: Course[], departments: Department[]): void {
    const headers = ['Enrollment ID', 'Full Name', 'Email', 'Phone', 'Course', 'Department', 'Admission Year', 'Semester', 'CGPA', 'Attendance %', 'Status'];
    const rows = students.map(s => {
      const course = courses.find(c => c.courseId === s.courseId)?.courseName || s.courseId;
      const dept = departments.find(d => d.departmentId === s.departmentId)?.departmentName || s.departmentId;
      return [
        s.enrollmentId,
        `"${s.fullName}"`,
        s.email,
        s.phone,
        `"${course}"`,
        `"${dept}"`,
        s.admissionYear,
        s.currentSemester,
        s.cgpa.toFixed(2),
        `${s.attendancePct}%`,
        s.status
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    this.downloadCsv(`unitrack_students_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  }

  /**
   * Exports attendance shortage list
   */
  public exportAttendanceShortageToCsv(students: Student[], threshold: number): void {
    const shortageStudents = students.filter(s => s.attendancePct < threshold);
    const headers = ['Enrollment ID', 'Full Name', 'Department', 'Semester', 'Current Attendance %', 'Deficit %', 'Status'];
    const rows = shortageStudents.map(s => [
      s.enrollmentId,
      `"${s.fullName}"`,
      s.departmentId,
      s.currentSemester,
      `${s.attendancePct}%`,
      `${(threshold - s.attendancePct).toFixed(1)}%`,
      'DEBARMENT_WARNING'
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    this.downloadCsv(`attendance_shortage_below_${threshold}pct_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  }

  /**
   * Exports semester marks grade sheet
   */
  public exportMarksToCsv(marks: SemesterMark[], enrollmentId: string): void {
    const headers = ['Enrollment ID', 'Semester', 'Subject Code', 'Internal (Max 30/40)', 'External (Max 50/60)', 'Practical', 'Total Marks', 'Grade', 'Grade Points', 'Result'];
    const rows = marks.map(m => [
      m.enrollmentId,
      m.semester,
      m.subjectCode,
      m.internalMarks,
      m.externalMarks,
      m.practicalMarks,
      m.totalMarks,
      m.grade,
      m.gradePoints,
      m.status
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    this.downloadCsv(`academic_marks_${enrollmentId}_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
  }
}

export const exportService = new ExportService();
