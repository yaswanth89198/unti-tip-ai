import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, Mail, Phone, Calendar, Award, Clock,
  FileText, CheckCircle2, AlertTriangle, ArrowLeft, Camera,
  ExternalLink, Plus, BookOpen, Briefcase, ShieldCheck, HelpCircle
} from 'lucide-react';

interface StudentProfileViewProps {
  enrollmentId: string;
  onBack: () => void;
  onOpenTranscript: (enrollmentId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  enrollmentId,
  onBack,
  onOpenTranscript,
  onNavigateTab
}) => {
  const { db, updateStudent, recordMarks, recordAttendance, attendanceThreshold } = useData();
  const { currentUser, isStudent, canManageAcademics } = useAuth();

  const student = useMemo(() => {
    return db.students.find(s => s.enrollmentId === enrollmentId);
  }, [db.students, enrollmentId]);

  const course = useMemo(() => {
    return db.courses.find(c => c.courseId === student?.courseId);
  }, [db.courses, student?.courseId]);

  const department = useMemo(() => {
    return db.departments.find(d => d.departmentId === student?.departmentId);
  }, [db.departments, student?.departmentId]);

  const totalSemesters = course?.totalSemesters || 8;
  const [selectedSemester, setSelectedSemester] = useState<number>(student?.currentSemester || 4);
  const [activeTab, setActiveTab] = useState<'academics' | 'talent' | 'attendance' | 'tickets'>('academics');

  // Photo update state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoInputUrl, setPhotoInputUrl] = useState(student?.avatarUrl || '');

  // Add marks modal state
  const [isAddMarksModalOpen, setIsAddMarksModalOpen] = useState(false);
  const [newMarkSubject, setNewMarkSubject] = useState('');
  const [newInternal, setNewInternal] = useState(25);
  const [newExternal, setNewExternal] = useState(45);
  const [newPractical, setNewPractical] = useState(15);

  if (!student) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Student Profile Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">Enrollment ID {enrollmentId} does not match university records.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  // Marks for selected semester
  const semesterMarks = db.marks.filter(
    m => m.enrollmentId === student.enrollmentId && m.semester === selectedSemester
  );

  // Attendance for selected semester
  const semesterAttendance = db.attendance.filter(
    a => a.enrollmentId === student.enrollmentId && a.semester === selectedSemester
  );

  // Projects & Certificates
  const studentProjects = db.projects.filter(p => p.enrollmentId === student.enrollmentId);
  const studentCertificates = db.certificates.filter(c => c.enrollmentId === student.enrollmentId);
  const studentActivities = db.activities.filter(a => a.enrollmentId === student.enrollmentId);
  const studentPlacements = db.placements.filter(pl => pl.enrollmentId === student.enrollmentId);
  const studentTickets = db.tickets.filter(t => t.enrollmentId === student.enrollmentId);

  // SGPA calculation for selected semester
  let semCredits = 0;
  let semPoints = 0;
  semesterMarks.forEach(m => {
    const sub = db.subjects.find(s => s.subjectCode === m.subjectCode);
    const credits = sub ? sub.credits : 3;
    semCredits += credits;
    semPoints += (m.gradePoints * credits);
  });
  const sgpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '—';

  const handlePhotoUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (photoInputUrl.trim()) {
      updateStudent(student.enrollmentId, { avatarUrl: photoInputUrl.trim() });
    }
    setIsPhotoModalOpen(false);
  };

  const handleRecordMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarkSubject) return;

    recordMarks({
      enrollmentId: student.enrollmentId,
      semester: selectedSemester,
      subjectCode: newMarkSubject,
      internalMarks: Number(newInternal),
      externalMarks: Number(newExternal),
      practicalMarks: Number(newPractical)
    });

    setIsAddMarksModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Back button and profile actions */}
      <div className="flex items-center justify-between">
        {!isStudent && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => onOpenTranscript(student.enrollmentId)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Official Academic Transcript
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Student Photograph */}
            <div className="relative group">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center border-2 border-blue-200 shadow-sm">
                  {student.fullName.charAt(0)}
                </div>
              )}
              {/* Photo upload trigger */}
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                title="Update student photo"
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-slate-900 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Student Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{student.fullName}</h1>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 tabular-nums">
                  ID: {student.enrollmentId}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {student.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                {course?.courseName} ({student.courseId}) · Branch: {student.branchId}
              </p>
              <p className="text-xs text-slate-400">
                Department: {department?.departmentName || student.departmentId}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {student.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Adm: {student.admissionYear} · Grad: {student.expectedGraduation}
                </span>
              </div>
            </div>
          </div>

          {/* Academic High-Level KPIs */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cumulative CGPA</div>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {student.cgpa.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">10-Point Scale</div>
            </div>

            <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Overall Attendance</div>
              <div className={`text-2xl font-bold font-mono tabular-nums ${student.attendancePct < attendanceThreshold ? 'text-red-600' : 'text-emerald-700'}`}>
                {student.attendancePct}%
              </div>
              <div className="text-[10px] text-slate-400">Target ≥{attendanceThreshold}%</div>
            </div>

            <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Current Phase</div>
              <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
                Sem {student.currentSemester}
              </div>
              <div className="text-[10px] text-slate-400">Year {student.currentYear} of {Math.ceil(totalSemesters / 2)}</div>
            </div>
          </div>
        </div>

        {/* Skills Tag strip */}
        {student.skills && student.skills.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Technical Profile:</span>
            {student.skills.map((skill, idx) => (
              <span key={idx} className="text-xs text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md font-medium">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold text-slate-500">
        <button
          onClick={() => setActiveTab('academics')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeTab === 'academics' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          Semester Academics & Marks
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          Attendance Breakdown
        </button>
        <button
          onClick={() => setActiveTab('talent')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeTab === 'talent' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          Talent, Projects & Placement
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeTab === 'tickets' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          Support Tickets ({studentTickets.length})
        </button>
      </div>

      {/* Tab 1: Semester Academics */}
      {activeTab === 'academics' && (
        <div className="space-y-5">
          {/* Semester Selector Cards based on course duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Academic Semester (Course Total: {totalSemesters} Semesters)
              </span>
              <span className="text-xs text-slate-400">
                Click any semester to load actual database records
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {Array.from({ length: totalSemesters }, (_, i) => i + 1).map(sem => {
                const isSelected = selectedSemester === sem;
                const isCurrent = student.currentSemester === sem;
                return (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`py-3 px-2 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px] font-semibold opacity-80">SEM</div>
                    <div className="text-lg font-bold font-mono tabular-nums leading-none my-0.5">{sem}</div>
                    {isCurrent && (
                      <div className={`text-[9px] font-semibold ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                        Current
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Semester Academic Overview Strip */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Semester {selectedSemester} Performance Summary
              </div>
              <div className="text-sm font-medium mt-0.5">
                {course?.courseName} · Assessment: {course?.assessmentRule}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs text-slate-400">Registered Credits</span>
                <div className="text-lg font-bold font-mono tabular-nums">{semCredits} Credits</div>
              </div>
              <div className="border-l border-slate-700 pl-6">
                <span className="text-xs text-slate-400">Calculated SGPA</span>
                <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">{sgpa}</div>
              </div>

              {canManageAcademics && (
                <button
                  onClick={() => setIsAddMarksModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors ml-2"
                >
                  Record Subject Marks
                </button>
              )}
            </div>
          </div>

          {/* Subject-Wise Marks & Grading Table */}
          {semesterMarks.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 text-sm">No exam marks entered for Semester {selectedSemester}</p>
              <p className="text-xs text-slate-400 mt-1">
                {canManageAcademics
                  ? 'Use the button above to record internal and external marks.'
                  : 'Marks will be posted once evaluated by course faculty.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Subject Code & Title</th>
                      <th className="py-3 px-4 text-center">Credits</th>
                      <th className="py-3 px-4 text-center">Faculty</th>
                      <th className="py-3 px-4 text-right">Internal</th>
                      <th className="py-3 px-4 text-right">External</th>
                      <th className="py-3 px-4 text-right">Practical</th>
                      <th className="py-3 px-4 text-right">Total Marks</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      <th className="py-3 px-4 text-center">Grade Points</th>
                      <th className="py-3 px-4 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {semesterMarks.map(mark => {
                      const subject = db.subjects.find(s => s.subjectCode === mark.subjectCode);
                      return (
                        <tr key={mark.markId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">
                              {subject?.subjectName || mark.subjectCode}
                            </div>
                            <div className="text-[11px] font-mono text-blue-700">
                              {mark.subjectCode}
                            </div>
                            {subject?.description && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                                {subject.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-semibold tabular-nums">
                            {subject?.credits || 4}
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-600">
                            {subject?.facultyName || 'Department Faculty'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                            {mark.internalMarks} <span className="text-slate-400 text-[10px]">/{subject?.maxInternal || 30}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                            {mark.externalMarks} <span className="text-slate-400 text-[10px]">/{subject?.maxExternal || 50}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                            {mark.practicalMarks} <span className="text-slate-400 text-[10px]">/{subject?.maxPractical || 20}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                            {mark.totalMarks} / 100
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-sm">
                            <span className={mark.grade === 'F' ? 'text-red-600' : 'text-slate-900'}>
                              {mark.grade}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold tabular-nums text-slate-800">
                            {mark.gradePoints}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`font-semibold ${mark.status === 'Pass' ? 'text-emerald-700' : 'text-red-600'}`}>
                              {mark.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Attendance Breakdown */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Subject-Wise Attendance Register</h2>
            <p className="text-xs text-slate-500 mb-4">
              Detailed session logs for Semester {selectedSemester}. Statutory qualification requires &ge;{attendanceThreshold}% attendance.
            </p>

            {semesterAttendance.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No attendance sessions recorded for this semester yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4 text-right">Classes Held</th>
                      <th className="py-3 px-4 text-right">Attended</th>
                      <th className="py-3 px-4 text-right">Absent</th>
                      <th className="py-3 px-4 text-right">Percentage</th>
                      <th className="py-3 px-4 text-center">Eligibility Status</th>
                      <th className="py-3 px-4 text-right">Last Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {semesterAttendance.map(att => {
                      const sub = db.subjects.find(s => s.subjectCode === att.subjectCode);
                      const isShortage = att.attendancePercentage < attendanceThreshold;
                      return (
                        <tr key={att.attendanceId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{sub?.subjectName || att.subjectCode}</div>
                            <div className="text-[11px] font-mono text-blue-700">{att.subjectCode}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">{att.classesHeld}</td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">{att.classesAttended}</td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-red-600">{att.classesAbsent}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                            <span className={isShortage ? 'text-red-600' : 'text-slate-900'}>
                              {att.attendancePercentage}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-semibold ${isShortage ? 'text-red-700' : 'text-emerald-700'}`}>
                              {isShortage ? 'Debarred (Shortage)' : 'Permitted for Exams'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400">{att.lastUpdated}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Talent, Projects & Placements */}
      {activeTab === 'talent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projects */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Technical Projects</h2>
              <span className="text-xs text-slate-400 font-mono">{studentProjects.length} Recorded</span>
            </div>
            {studentProjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No technical projects logged.</p>
            ) : (
              <div className="space-y-3">
                {studentProjects.map(p => (
                  <div key={p.projectId} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-900">{p.title}</div>
                      <span className="text-emerald-700 font-semibold text-[11px]">{p.verificationStatus}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{p.description}</p>
                    <div className="text-[11px] font-mono text-blue-700 mt-2">
                      Stack: {p.techStack}
                    </div>
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-2 font-mono"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Code Repository
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Verified Certifications</h2>
              <span className="text-xs text-slate-400 font-mono">{studentCertificates.length} Verified</span>
            </div>
            {studentCertificates.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No professional certificates verified.</p>
            ) : (
              <div className="space-y-3">
                {studentCertificates.map(c => (
                  <div key={c.certificateId} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-900">{c.title}</div>
                      <span className="text-emerald-700 font-semibold text-[11px]">{c.verificationStatus}</span>
                    </div>
                    <div className="text-slate-500 mt-0.5">Issuer: {c.issuingAuthority}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      Cred ID: {c.credentialId || 'N/A'} · Issued: {c.issueDate}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 font-medium">
                      Skills: {c.skillsCovered}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activities & Placements */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-3">Extracurricular & Placement Records</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Hackathons & Workshops</h3>
                {studentActivities.map(a => (
                  <div key={a.activityId} className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-2">
                    <div className="font-semibold text-slate-900">{a.title} ({a.category})</div>
                    <div className="text-slate-600 mt-0.5">{a.achievement} · {a.organizationEvent}</div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">Date: {a.dateRecorded}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Campus Placement Status</h3>
                {studentPlacements.length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
                    Eligible for ongoing campus recruitments. No offer letter locked yet.
                  </div>
                ) : (
                  studentPlacements.map(pl => (
                    <div key={pl.placementId} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="font-bold text-emerald-900 text-sm">{pl.companyName}</div>
                      <div className="text-emerald-800 font-medium">{pl.jobRole}</div>
                      <div className="text-base font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                        ₹{pl.packageCtcLpa} LPA (Offer Accepted)
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Support Tickets */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Support & Grievance Tickets</h2>
              <p className="text-xs text-slate-500">Track academic correction requests, marks disputes, and leaves.</p>
            </div>
            <button
              onClick={() => onNavigateTab('tickets')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              Open Support Module
            </button>
          </div>

          {studentTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No tickets submitted for this student.
            </div>
          ) : (
            <div className="space-y-3">
              {studentTickets.map(t => (
                <div key={t.ticketId} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">{t.ticketId}</span>
                    <span className="font-semibold text-slate-700">{t.status}</span>
                  </div>
                  <div className="font-semibold text-slate-900 mt-1 text-sm">{t.subject}</div>
                  <p className="text-slate-600 mt-1">{t.description}</p>
                  {t.resolutionNotes && (
                    <div className="mt-2 p-2 bg-emerald-50 rounded-md border border-emerald-200 text-emerald-800">
                      <strong>Resolution:</strong> {t.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Update Student Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Update Student Profile Photograph</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter a secure public photo URL or choose a realistic demo avatar.
            </p>

            <form onSubmit={handlePhotoUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={photoInputUrl}
                  onChange={e => setPhotoInputUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Instant Preview */}
              {photoInputUrl && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <img
                    src={photoInputUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-xs text-slate-600 font-medium">Valid Image Preview Loaded</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Marks Modal */}
      {isAddMarksModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Record Marks — Sem {selectedSemester}</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter internal, external, and practical marks for {student.fullName}.
            </p>

            <form onSubmit={handleRecordMarks} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Subject</label>
                <select
                  required
                  value={newMarkSubject}
                  onChange={e => setNewMarkSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Choose Subject --</option>
                  {db.subjects
                    .filter(s => s.courseId === student.courseId)
                    .map(sub => (
                      <option key={sub.subjectCode} value={sub.subjectCode}>
                        {sub.subjectCode} - {sub.subjectName} (Sem {sub.semester})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internal (Max 40)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    required
                    value={newInternal}
                    onChange={e => setNewInternal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">External (Max 60)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={newExternal}
                    onChange={e => setNewExternal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Practical (Max 20)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={newPractical}
                    onChange={e => setNewPractical(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800">
                Calculated Total: {Number(newInternal) + Number(newExternal) + Number(newPractical)} / 100
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddMarksModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Save Marks & Compute Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
