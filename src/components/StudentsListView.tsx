import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { exportService } from '../services/exportService';
import { Student } from '../types';
import {
  Search, Plus, Download, Filter, LayoutGrid, List,
  GraduationCap, Mail, Phone, ExternalLink, AlertCircle, X
} from 'lucide-react';

interface StudentsListViewProps {
  onSelectStudent: (enrollmentId: string) => void;
  onOpenTranscriptFor: (enrollmentId: string) => void;
}

export const StudentsListView: React.FC<StudentsListViewProps> = ({
  onSelectStudent,
  onOpenTranscriptFor
}) => {
  const { db, addStudent, attendanceThreshold } = useData();
  const { currentUser, isStudent, canManageAcademics } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [filterDept, setFilterDept] = useState(
    currentUser.role === 'HOD' && currentUser.departmentId ? currentUser.departmentId : 'ALL'
  );
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding new student
  const [formEnrollmentId, setFormEnrollmentId] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+91 ');
  const [formCourse, setFormCourse] = useState('BTECH');
  const [formBranch, setFormBranch] = useState('CSE');
  const [formDept, setFormDept] = useState('DEPT_CS');
  const [formAdmYear, setFormAdmYear] = useState(2024);
  const [formSemester, setFormSemester] = useState(1);
  const [formGradYear, setFormGradYear] = useState(2028);
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Filter students
  const filteredStudents = useMemo(() => {
    return db.students.filter(s => {
      // If logged in as student, only see self
      if (isStudent && currentUser.associatedEnrollmentId) {
        return s.enrollmentId === currentUser.associatedEnrollmentId;
      }
      if (filterCourse !== 'ALL' && s.courseId !== filterCourse) return false;
      if (filterDept !== 'ALL' && s.departmentId !== filterDept) return false;
      if (filterSemester !== 'ALL' && String(s.currentSemester) !== filterSemester) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = s.enrollmentId.toLowerCase().includes(query);
        const matchesName = s.fullName.toLowerCase().includes(query);
        const matchesEmail = s.email.toLowerCase().includes(query);
        return matchesId || matchesName || matchesEmail;
      }

      return true;
    });
  }, [db.students, searchQuery, filterCourse, filterDept, filterSemester, isStudent, currentUser]);

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Strict 6-digit validation
    if (!/^\d{6}$/.test(formEnrollmentId.trim())) {
      setFormError('Enrollment ID must be exactly 6 numeric digits (e.g. 240113).');
      return;
    }

    if (!formFullName.trim()) {
      setFormError('Please enter the full name of the student.');
      return;
    }

    const currentYr = Math.ceil(formSemester / 2);

    const res = addStudent({
      enrollmentId: formEnrollmentId.trim(),
      fullName: formFullName.trim(),
      email: formEmail.trim() || `${formEnrollmentId.trim()}@uni.edu`,
      phone: formPhone.trim(),
      courseId: formCourse,
      branchId: formBranch,
      departmentId: formDept,
      admissionYear: Number(formAdmYear),
      currentYear: currentYr,
      currentSemester: Number(formSemester),
      expectedGraduation: Number(formGradYear),
      status: 'Active',
      avatarUrl: formAvatarUrl.trim() || undefined,
      skills: ['Foundational Computing']
    });

    if (!res.success) {
      setFormError(res.message);
    } else {
      setIsAddModalOpen(false);
      // Reset form
      setFormEnrollmentId('');
      setFormFullName('');
      setFormEmail('');
      setFormError('');
    }
  };

  const handleExportCsv = () => {
    exportService.exportStudentsToCsv(filteredStudents, db.courses, db.departments);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isStudent ? 'My Enrolled Student Record' : 'Student Enrollment Directory'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative university roster with 6-digit unique enrollment verification and performance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>

          {canManageAcademics && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Enroll Student
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by 6-digit ID (e.g. 240101), name, or email..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {!isStudent && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white"
            >
              <option value="ALL">All Departments</option>
              {db.departments.map(d => (
                <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
              ))}
            </select>

            <select
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white"
            >
              <option value="ALL">All Programs</option>
              {db.courses.map(c => (
                <option key={c.courseId} value={c.courseId}>{c.courseId}</option>
              ))}
            </select>

            <select
              value={filterSemester}
              onChange={e => setFilterSemester(e.target.value)}
              className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white"
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={String(s)}>Sem {s}</option>
              ))}
            </select>

            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'}`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Roster Display */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-800">No students found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or register a new student.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Enrollment ID</th>
                  <th className="py-3 px-4">Program & Branch</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Semester</th>
                  <th className="py-3 px-4 text-right">CGPA</th>
                  <th className="py-3 px-4 text-right">Attendance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const isShortage = student.attendancePct < attendanceThreshold;
                  return (
                    <tr key={student.enrollmentId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={student.fullName}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                              {student.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900">{student.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-700 tabular-nums">
                        {student.enrollmentId}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {student.courseId} · {student.branchId}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {db.departments.find(d => d.departmentId === student.departmentId)?.departmentName || student.departmentId}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums">
                        Sem {student.currentSemester}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                        {student.cgpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                        <span className={isShortage ? 'text-red-600' : 'text-emerald-700'}>
                          {student.attendancePct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-medium text-slate-700">
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectStudent(student.enrollmentId)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => onOpenTranscriptFor(student.enrollmentId)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            Transcript
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const isShortage = student.attendancePct < attendanceThreshold;
            return (
              <div
                key={student.enrollmentId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.fullName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
                          {student.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h2 className="font-semibold text-slate-900 text-sm leading-tight">{student.fullName}</h2>
                        <div className="text-xs font-mono text-blue-700 font-semibold tabular-nums mt-0.5">
                          ID: {student.enrollmentId}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      Sem {student.currentSemester}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{student.courseId} · {student.branchId}</span>
                    </div>
                  </div>

                  {/* Metrics strip */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-center mb-4">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">CGPA</div>
                      <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                        {student.cgpa.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Attendance</div>
                      <div className={`text-base font-bold font-mono tabular-nums ${isShortage ? 'text-red-600' : 'text-emerald-700'}`}>
                        {student.attendancePct}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onOpenTranscriptFor(student.enrollmentId)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Transcript
                  </button>
                  <button
                    onClick={() => onSelectStudent(student.enrollmentId)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    Open Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enroll Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Enroll New University Student</h2>
                <p className="text-xs text-slate-500">6-digit unique enrollment verification and department assignment</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEnrollmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Enrollment ID (Strictly 6 Digits) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={formEnrollmentId}
                  onChange={e => setFormEnrollmentId(e.target.value)}
                  placeholder="e.g. 240113"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Must be unique across all university programs.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={e => setFormFullName(e.target.value)}
                  placeholder="e.g. Maya Krishnan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">University Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="maya.k@uni.edu"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course</label>
                  <select
                    value={formCourse}
                    onChange={e => setFormCourse(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    {db.courses.map(c => (
                      <option key={c.courseId} value={c.courseId}>{c.courseId}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch</label>
                  <select
                    value={formBranch}
                    onChange={e => setFormBranch(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    {db.branches.map(b => (
                      <option key={b.branchId} value={b.branchId}>{b.branchId}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={formSemester}
                    onChange={e => setFormSemester(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Sem {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formDept}
                  onChange={e => setFormDept(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  {db.departments.map(d => (
                    <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Profile Photo URL (Optional)</label>
                <input
                  type="url"
                  value={formAvatarUrl}
                  onChange={e => setFormAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Confirm & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
