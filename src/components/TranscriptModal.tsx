import React from 'react';
import { useData } from '../context/DataContext';
import { exportService } from '../services/exportService';
import {
  Printer, Download, X, GraduationCap, Award, ShieldCheck, CheckCircle
} from 'lucide-react';

interface TranscriptModalProps {
  enrollmentId: string;
  onClose: () => void;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({ enrollmentId, onClose }) => {
  const { db } = useData();

  const student = db.students.find(s => s.enrollmentId === enrollmentId);
  const course = db.courses.find(c => c.courseId === student?.courseId);
  const department = db.departments.find(d => d.departmentId === student?.departmentId);

  const studentMarks = db.marks.filter(m => m.enrollmentId === enrollmentId);

  // Group marks by semester
  const semestersPresent = Array.from(new Set(studentMarks.map(m => m.semester))).sort((a, b) => a - b);

  let totalCreditsEarned = 0;
  let totalGradeScore = 0;

  studentMarks.forEach(m => {
    const sub = db.subjects.find(s => s.subjectCode === m.subjectCode);
    const cr = sub?.credits || 3;
    totalCreditsEarned += cr;
    totalGradeScore += (m.gradePoints * cr);
  });

  const cumulativeCgpa = totalCreditsEarned > 0 ? (totalGradeScore / totalCreditsEarned).toFixed(2) : '0.00';

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarksCsv = () => {
    exportService.exportMarksToCsv(studentMarks, enrollmentId);
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl my-8 relative">
        {/* Floating action buttons (hidden in print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Document Preview Mode
            </span>
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono font-bold">
              OFFICIAL TRANSCRIPT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarksCsv}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Transcript Document Layout */}
        <div className="space-y-6 text-slate-900 font-sans">
          {/* Official University Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-extrabold tracking-tight uppercase text-slate-900">
                  Apex University of Technology & Sciences
                </div>
                <div className="text-xs tracking-wider text-slate-500 font-medium uppercase">
                  Accredited Grade A++ · Office of the Controller of Examinations
                </div>
              </div>
            </div>
            <div className="text-base font-bold uppercase tracking-wider text-slate-800 mt-2">
              Official Consolidated Academic Transcript
            </div>
          </div>

          {/* Student Identifiers Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Student Full Name</span>
              <span className="text-sm font-bold text-slate-900">{student.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Unique Enrollment ID</span>
              <span className="text-sm font-bold font-mono text-blue-700 tabular-nums">{student.enrollmentId}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Degree & Major</span>
              <span className="text-sm font-bold text-slate-900">{course?.courseName} ({student.branchId})</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Cumulative CGPA</span>
              <span className="text-base font-extrabold font-mono text-emerald-700 tabular-nums">{cumulativeCgpa} / 10.0</span>
            </div>
          </div>

          {/* Semester-by-Semester Tables */}
          {semestersPresent.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No academic examinations completed for this student yet.
            </div>
          ) : (
            semestersPresent.map(sem => {
              const semMarks = studentMarks.filter(m => m.semester === sem);
              let sCr = 0;
              let sPts = 0;
              semMarks.forEach(m => {
                const sub = db.subjects.find(s => s.subjectCode === m.subjectCode);
                const cr = sub?.credits || 3;
                sCr += cr;
                sPts += (m.gradePoints * cr);
              });
              const sgpa = sCr > 0 ? (sPts / sCr).toFixed(2) : '0.00';

              return (
                <div key={sem} className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-100 px-4 py-2 font-bold flex items-center justify-between text-slate-800">
                    <span>Semester {sem} Academic Examination</span>
                    <span className="font-mono tabular-nums text-blue-700 font-bold">SGPA: {sgpa}</span>
                  </div>

                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[11px] text-slate-600 font-semibold border-b border-slate-200 uppercase">
                      <tr>
                        <th className="py-2 px-3">Subject Code</th>
                        <th className="py-2 px-3">Subject Name</th>
                        <th className="py-2 px-3 text-center">Credits</th>
                        <th className="py-2 px-3 text-right">Internal</th>
                        <th className="py-2 px-3 text-right">External</th>
                        <th className="py-2 px-3 text-right">Total Marks</th>
                        <th className="py-2 px-3 text-center">Grade</th>
                        <th className="py-2 px-3 text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {semMarks.map(mark => {
                        const sub = db.subjects.find(s => s.subjectCode === mark.subjectCode);
                        return (
                          <tr key={mark.markId}>
                            <td className="py-2 px-3 font-mono font-bold text-slate-800">{mark.subjectCode}</td>
                            <td className="py-2 px-3 text-slate-900">{sub?.subjectName || mark.subjectCode}</td>
                            <td className="py-2 px-3 text-center font-mono tabular-nums">{sub?.credits || 4}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">{mark.internalMarks}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">{mark.externalMarks}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">{mark.totalMarks}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold">{mark.grade}</td>
                            <td className="py-2 px-3 text-center font-semibold text-emerald-700">{mark.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}

          {/* Official Seal and Signatures */}
          <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-12 flex items-center justify-center font-serif italic text-slate-400">
                Dr. Anita Sen
              </div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                Head of Department
              </div>
              <div className="text-[10px] text-slate-400">Dept. of Computer Science</div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-600/60 flex items-center justify-center text-[10px] font-bold text-blue-700 uppercase text-center p-1">
                Official University Seal
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">Verified Security Stamp</span>
            </div>

            <div>
              <div className="h-12 flex items-center justify-center font-serif italic text-slate-400">
                Prof. R. Sharma
              </div>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                Controller of Examinations
              </div>
              <div className="text-[10px] text-slate-400">Apex University Central</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
