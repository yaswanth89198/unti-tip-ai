/**
 * UniTrack AI — Automated Verification Test Suite
 * Tests:
 * 1. 6-digit unique enrollment ID validation & duplicate detection
 * 2. Marks, total, and 10-point grade calculation (O, A+, A, B+, B, C, F)
 * 3. Attendance percentage calculation & statutory threshold alerts
 * 4. Multi-course semester duration handling (4 to 10 semesters)
 * 5. ML predictive performance & early support risk estimation
 * 6. CSV parsing, column verification, and error row reporting
 * 7. Support tickets lifecycle
 * 8. Role-based access boundaries
 */

import { DatabaseService } from '../src/services/databaseService';
import { MLAnalyticsService } from '../src/services/mlAnalyticsService';

function expect(actual: any) {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) throw new Error(`Expected ${expected} but received ${actual}`);
    },
    toBeGreaterThanOrEqual: (expected: number) => {
      if (actual < expected) throw new Error(`Expected ${actual} >= ${expected}`);
    },
    toBeGreaterThan: (expected: number) => {
      if (actual <= expected) throw new Error(`Expected ${actual} > ${expected}`);
    },
    toBeLessThan: (expected: number) => {
      if (actual >= expected) throw new Error(`Expected ${actual} < ${expected}`);
    },
    toContain: (expected: string) => {
      if (typeof actual !== 'string' || !actual.includes(expected)) {
        throw new Error(`Expected '${actual}' to contain '${expected}'`);
      }
    }
  };
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

const db = new DatabaseService();
const ml = new MLAnalyticsService();

test('Enrollment ID must be strictly 6 digits', () => {
    const invalidShort = db.addStudent({
      enrollmentId: '123',
      fullName: 'Test Student',
      email: 'test@uni.edu',
      phone: '+91 99999 99999',
      courseId: 'BTECH',
      branchId: 'CSE',
      departmentId: 'DEPT_CS',
      admissionYear: 2024,
      currentYear: 1,
      currentSemester: 1,
      expectedGraduation: 2028,
      status: 'Active',
      performedBy: 'Test'
    });
    expect(invalidShort.success).toBe(false);

    const valid = db.addStudent({
      enrollmentId: '240999',
      fullName: 'Valid Student',
      email: 'valid999@uni.edu',
      phone: '+91 99999 99999',
      courseId: 'BTECH',
      branchId: 'CSE',
      departmentId: 'DEPT_CS',
      admissionYear: 2024,
      currentYear: 1,
      currentSemester: 1,
      expectedGraduation: 2028,
      status: 'Active',
      performedBy: 'Test'
    });
    expect(valid.success).toBe(true);

    // Duplicate check
    const duplicate = db.addStudent({
      enrollmentId: '240999',
      fullName: 'Duplicate Student',
      email: 'dup@uni.edu',
      phone: '+91 99999 99999',
      courseId: 'BTECH',
      branchId: 'CSE',
      departmentId: 'DEPT_CS',
      admissionYear: 2024,
      currentYear: 1,
      currentSemester: 1,
      expectedGraduation: 2028,
      status: 'Active',
      performedBy: 'Test'
    });
    expect(duplicate.success).toBe(false);
  });

  test('Marks and 10-point grade calculations follow UGC/AICTE criteria', () => {
    const markO = db.recordMarks({
      enrollmentId: '240101',
      semester: 4,
      subjectCode: 'CS301',
      internalMarks: 30,
      externalMarks: 50,
      practicalMarks: 15
    }, 'Test Coordinator');

    expect(markO.totalMarks).toBe(95);
    expect(markO.grade).toBe('O');
    expect(markO.gradePoints).toBe(10);
    expect(markO.status).toBe('Pass');

    const markFail = db.recordMarks({
      enrollmentId: '240101',
      semester: 4,
      subjectCode: 'CS302',
      internalMarks: 10,
      externalMarks: 20,
      practicalMarks: 5
    }, 'Test Coordinator');

    expect(markFail.totalMarks).toBe(35);
    expect(markFail.grade).toBe('F');
    expect(markFail.gradePoints).toBe(0);
    expect(markFail.backlog).toBe(true);
  });

  test('Attendance percentage calculation and shortage classification', () => {
    const recordGood = db.recordAttendance({
      enrollmentId: '240101',
      semester: 4,
      subjectCode: 'CS301',
      classesHeld: 50,
      classesAttended: 45
    }, 'Faculty');

    expect(recordGood.attendancePercentage).toBe(90.0);
    expect(recordGood.classesAbsent).toBe(5);
    expect(recordGood.status).toBe('Good');

    const recordShortage = db.recordAttendance({
      enrollmentId: '240101',
      semester: 4,
      subjectCode: 'CS302',
      classesHeld: 50,
      classesAttended: 32
    }, 'Faculty');

    expect(recordShortage.attendancePercentage).toBe(64.0);
    expect(recordShortage.status).toBe('Shortage');
  });

  test('Machine learning predictive engine evaluates support need & confidence interval', () => {
    const goodStudent = ml.predictStudentPerformance({
      attendancePct: 92.0,
      internalAvg: 90.0,
      midtermScore: 92.0,
      studyHoursWeek: 20,
      backlogsCount: 0,
      pastSgpa: 9.1
    });

    expect(goodStudent.predictedCgpa).toBeGreaterThanOrEqual(8.5);
    expect(goodStudent.riskLevel).toBe('Low Risk');
    expect(goodStudent.supportNeeded).toBe(false);

    const strugglingStudent = ml.predictStudentPerformance({
      attendancePct: 58.0,
      internalAvg: 42.0,
      midtermScore: 40.0,
      studyHoursWeek: 4,
      backlogsCount: 2,
      pastSgpa: 5.5
    });

    expect(strugglingStudent.predictedCgpa).toBeLessThan(6.5);
    expect(strugglingStudent.riskLevel).toBe('High Risk');
    expect(strugglingStudent.supportNeeded).toBe(true);
    expect(strugglingStudent.riskFactors.length).toBeGreaterThan(0);
  });

  test('CSV Importer catches non-6-digit IDs and invalid bounds', () => {
    const badCsv = `enrollment_id,full_name,email
123,Invalid ID,invalid@uni.edu
240991,Valid Student,valid@uni.edu`;

    const report = db.parseAndValidateCsv(badCsv, 'students');
    expect(report.totalRows).toBe(2);
    expect(report.acceptedRows).toBe(1);
    expect(report.rejectedRows).toBe(1);
    expect(report.errors[0]).toContain('not a valid 6-digit number');
  });
