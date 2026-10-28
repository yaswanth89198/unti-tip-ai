import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Award, Users, Filter, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SemesterAcademicsViewProps {
  onSelectStudent: (enrollmentId: string) => void;
}

export const SemesterAcademicsView: React.FC<SemesterAcademicsViewProps> = ({ onSelectStudent }) => {
  const { db } = useData();
  const { currentUser, isStudent } = useAuth();

  const [selectedCourse, setSelectedCourse] = useState<string>('BTECH');
  const [selectedSemester, setSelectedSemester] = useState<number>(4);

  const activeCourse = useMemo(() => {
    return db.courses.find(c => c.courseId === selectedCourse);
  }, [db.courses, selectedCourse]);

  const totalSemesters = activeCourse?.totalSemesters || 8;

  // Subjects offered in this semester for this course
  const semesterSubjects = useMemo(() => {
    return db.subjects.filter(
      s => s.courseId === selectedCourse && s.semester === selectedSemester
    );
  }, [db.subjects, selectedCourse, selectedSemester]);

  // Students enrolled in this course and semester
  const enrolledStudents = useMemo(() => {
    return db.students.filter(s => {
      if (isStudent && currentUser.associatedEnrollmentId) {
        return s.enrollmentId === currentUser.associatedEnrollmentId;
      }
      return s.courseId === selectedCourse && s.currentSemester === selectedSemester;
    });
  }, [db.students, selectedCourse, selectedSemester, isStudent, currentUser]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Semester Academic Progression</h1>
          <p className="text-sm text-slate-500 mt-1">
            Course curriculum, subject syllabus breakdowns, credit structures, and cohort grade evaluations.
          </p>
        </div>

        {/* Course Filter */}
        {!isStudent && (
          <div className="flex items-center gap-2">
            <select
              value={selectedCourse}
              onChange={e => {
                setSelectedCourse(e.target.value);
                setSelectedSemester(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white"
            >
              {db.courses.map(c => (
                <option key={c.courseId} value={c.courseId}>
                  {c.courseId} - {c.courseName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Dynamic Semester Tabs (Semester 1 through N based on program duration) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {activeCourse?.courseName} Curriculum ({totalSemesters} Semesters Total)
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Rule: {activeCourse?.assessmentRule}
          </span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {Array.from({ length: totalSemesters }, (_, i) => i + 1).map(sem => {
            const isSelected = selectedSemester === sem;
            return (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`py-3 px-2 rounded-xl text-center border transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-[11px] font-semibold opacity-80">PHASE</div>
                <div className="text-lg font-bold font-mono tabular-nums leading-none my-0.5">Sem {sem}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subjects in this Semester Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Subjects Offered in Semester {selectedSemester} ({semesterSubjects.length} Registered Modules)
        </h2>

        {semesterSubjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No subjects configured for {selectedCourse} in Semester {selectedSemester}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semesterSubjects.map(sub => (
              <div
                key={sub.subjectCode}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {sub.subjectCode}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {sub.credits} Credits
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{sub.subjectName}</h3>
                  <div className="text-xs text-slate-500 mt-1">Faculty: {sub.facultyName}</div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{sub.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Int: {sub.maxInternal}</span>
                  <span>Ext: {sub.maxExternal}</span>
                  <span>Prac: {sub.maxPractical}</span>
                  <span className="font-bold text-slate-900">Total: 100</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Students in Semester Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Enrolled Students ({enrolledStudents.length} in Semester {selectedSemester})
            </h2>
            <p className="text-xs text-slate-500">Live SGPA and status evaluation from database</p>
          </div>
        </div>

        {enrolledStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No students currently enrolled in Semester {selectedSemester} for this program.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Enrollment ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4 text-right">Attendance %</th>
                  <th className="py-3 px-4 text-right">Cumulative CGPA</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolledStudents.map(student => (
                  <tr key={student.enrollmentId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 tabular-nums">
                      {student.enrollmentId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{student.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{student.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{student.branchId}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                      <span className={student.attendancePct < 75 ? 'text-red-600' : 'text-slate-900'}>
                        {student.attendancePct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {student.cgpa.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-emerald-700">
                      {student.status}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectStudent(student.enrollmentId)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        Detailed Marks Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
