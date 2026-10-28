import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Users, Award, TrendingUp, AlertTriangle, CheckCircle,
  Clock, BookOpen, Filter, ArrowUpRight, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface DashboardViewProps {
  onSelectStudent: (enrollmentId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectStudent, onNavigateTab }) => {
  const { db, attendanceThreshold } = useData();
  const { currentUser } = useAuth();

  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    currentUser.role === 'HOD' && currentUser.departmentId ? currentUser.departmentId : 'ALL'
  );
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');

  // Filter students
  const filteredStudents = useMemo(() => {
    return db.students.filter(student => {
      if (currentUser.role === 'STUDENT' && currentUser.associatedEnrollmentId) {
        return student.enrollmentId === currentUser.associatedEnrollmentId;
      }
      if (selectedCourse !== 'ALL' && student.courseId !== selectedCourse) return false;
      if (selectedDepartment !== 'ALL' && student.departmentId !== selectedDepartment) return false;
      if (selectedSemester !== 'ALL' && String(student.currentSemester) !== selectedSemester) return false;
      return true;
    });
  }, [db.students, selectedCourse, selectedDepartment, selectedSemester, currentUser]);

  // Aggregate Metrics
  const totalStudents = filteredStudents.length;
  const activeStudents = filteredStudents.filter(s => s.status === 'Active').length;
  const avgCgpa = totalStudents > 0
    ? Number((filteredStudents.reduce((acc, s) => acc + s.cgpa, 0) / totalStudents).toFixed(2))
    : 0;
  const avgAttendance = totalStudents > 0
    ? Number((filteredStudents.reduce((acc, s) => acc + s.attendancePct, 0) / totalStudents).toFixed(1))
    : 0;

  // Students requiring follow-up (< attendanceThreshold or backlogs)
  const studentsNeedingSupport = useMemo(() => {
    return filteredStudents.filter(s => {
      const studentMarks = db.marks.filter(m => m.enrollmentId === s.enrollmentId);
      const hasBacklogs = studentMarks.some(m => m.backlog || m.grade === 'F');
      const hasShortage = s.attendancePct < attendanceThreshold;
      return hasBacklogs || hasShortage || s.cgpa < 6.0;
    });
  }, [filteredStudents, db.marks, attendanceThreshold]);

  // Department-wise comparison chart data
  const departmentChartData = useMemo(() => {
    return db.departments.map(dept => {
      const deptStudents = db.students.filter(s => s.departmentId === dept.departmentId);
      const deptAvgCgpa = deptStudents.length > 0
        ? Number((deptStudents.reduce((acc, s) => acc + s.cgpa, 0) / deptStudents.length).toFixed(2))
        : 0;
      const deptAvgAtt = deptStudents.length > 0
        ? Number((deptStudents.reduce((acc, s) => acc + s.attendancePct, 0) / deptStudents.length).toFixed(1))
        : 0;
      return {
        name: dept.departmentId.replace('DEPT_', ''),
        fullName: dept.departmentName,
        studentsCount: deptStudents.length,
        avgCgpa: deptAvgCgpa,
        avgAttendance: deptAvgAtt
      };
    }).filter(d => d.studentsCount > 0);
  }, [db.departments, db.students]);

  // Attendance Distribution Donut
  const attendanceDistributionData = useMemo(() => {
    let good = 0;
    let satisfactory = 0;
    let shortage = 0;

    filteredStudents.forEach(s => {
      if (s.attendancePct >= 85) good++;
      else if (s.attendancePct >= attendanceThreshold) satisfactory++;
      else shortage++;
    });

    return [
      { name: 'Good (≥85%)', value: good, color: '#10B981' },
      { name: `Satisfactory (${attendanceThreshold}-84%)`, value: satisfactory, color: '#3B82F6' },
      { name: `Shortage (<${attendanceThreshold}%)`, value: shortage, color: '#EF4444' },
    ];
  }, [filteredStudents, attendanceThreshold]);

  // Semester Progression Trend Data
  const semesterTrendData = useMemo(() => {
    const semMap: Record<number, { sem: number; totalMarks: number; count: number; marksAvg: number }> = {};
    for (let i = 1; i <= 8; i++) {
      semMap[i] = { sem: i, totalMarks: 0, count: 0, marksAvg: 0 };
    }

    db.marks.forEach(m => {
      if (semMap[m.semester]) {
        semMap[m.semester].totalMarks += m.totalMarks;
        semMap[m.semester].count++;
      }
    });

    return Object.values(semMap)
      .filter(s => s.count > 0)
      .map(s => ({
        semester: `Sem ${s.sem}`,
        averageMarks: Number((s.totalMarks / s.count).toFixed(1)),
        recordsAnalyzed: s.count
      }));
  }, [db.marks]);

  // Assessment Component Breakdown (Stacked Bar)
  const assessmentBreakdownData = useMemo(() => {
    const sampleSubjects = db.subjects.slice(0, 5);
    return sampleSubjects.map(sub => {
      const subMarks = db.marks.filter(m => m.subjectCode === sub.subjectCode);
      const count = subMarks.length || 1;
      const internalAvg = Number((subMarks.reduce((a, b) => a + b.internalMarks, 0) / count).toFixed(1));
      const externalAvg = Number((subMarks.reduce((a, b) => a + b.externalMarks, 0) / count).toFixed(1));
      const practicalAvg = Number((subMarks.reduce((a, b) => a + b.practicalMarks, 0) / count).toFixed(1));

      return {
        subject: sub.subjectCode,
        name: sub.subjectName,
        Internal: internalAvg,
        External: externalAvg,
        Practical: practicalAvg
      };
    });
  }, [db.subjects, db.marks]);

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {currentUser.role === 'STUDENT' ? 'Student Academic Dashboard' : 'University Executive Analytics'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-program performance, attendance verification, and early-support indicators.
          </p>
        </div>

        {/* Global Filter Bar */}
        {currentUser.role !== 'STUDENT' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="ALL">All Departments</option>
                {db.departments.map(d => (
                  <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs text-xs">
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="ALL">All Programs</option>
                {db.courses.map(c => (
                  <option key={c.courseId} value={c.courseId}>{c.courseId} - {c.courseName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs text-xs">
              <select
                value={selectedSemester}
                onChange={e => setSelectedSemester(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-medium focus:outline-hidden"
              >
                <option value="ALL">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={String(sem)}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Cohort</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalStudents}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">{activeStudents} Active</span>
            <span>·</span>
            <span>{db.courses.length} Programs</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average CGPA</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {avgCgpa.toFixed(2)}
            <span className="text-xs text-slate-400 font-sans ml-1 font-normal">/ 10.0</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            UGC 10-Point Scale Baseline
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Attendance</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {avgAttendance}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Threshold Cutoff: <span className="font-semibold text-slate-700">{attendanceThreshold}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-red-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Support Required</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 tabular-nums">
            {studentsNeedingSupport.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Shortage or Backlogs flagged
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department / Program CGPA Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Academic Standing by Department</h2>
              <p className="text-xs text-slate-500">Comparative average CGPA across university departments</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real DB Query</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 10]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} CGPA`, 'Average']}
                />
                <Bar dataKey="avgCgpa" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Distribution Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-slate-900">Attendance Distribution</h2>
              <span className="text-xs font-mono text-slate-400">Target ≥{attendanceThreshold}%</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Statutory attendance qualification segmentation</p>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceDistributionData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {attendanceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            {attendanceDistributionData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">{item.value} students</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semester Marks Trend Line */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Semester-Wise Performance Velocity</h2>
              <p className="text-xs text-slate-500">Average marks trend across progression stages</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={semesterTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="semester" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Avg Marks']}
                />
                <Line type="monotone" dataKey="averageMarks" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#1d4ed8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assessment Structure Breakdown (Internal / External / Practical) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Assessment Component Distribution</h2>
              <p className="text-xs text-slate-500">Internal, External, and Practical marks split by core course</p>
            </div>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assessmentBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Internal" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="External" stackId="a" fill="#1e40af" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Practical" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Early-Warning & Support Follow-Up Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-semibold text-slate-900">Academic & Attendance Follow-Up Advisory</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Students identified with attendance shortage (&lt;{attendanceThreshold}%), standing backlogs, or CGPA deficit.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('ai-analytics')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Run ML Predictor
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {studentsNeedingSupport.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No academic or attendance exceptions recorded under active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Enrollment ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department & Program</th>
                  <th className="py-3 px-4 text-right">Attendance %</th>
                  <th className="py-3 px-4 text-right">CGPA</th>
                  <th className="py-3 px-4">Identified Flag</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsNeedingSupport.map(student => {
                  const marks = db.marks.filter(m => m.enrollmentId === student.enrollmentId);
                  const backlogs = marks.filter(m => m.backlog || m.grade === 'F').length;
                  const isShortage = student.attendancePct < attendanceThreshold;

                  return (
                    <tr key={student.enrollmentId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-700 tabular-nums">
                        {student.enrollmentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{student.fullName}</div>
                        <div className="text-[11px] text-slate-400">{student.email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {student.courseId} · {student.branchId} (Sem {student.currentSemester})
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                        <span className={isShortage ? 'text-red-600' : 'text-slate-700'}>
                          {student.attendancePct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {student.cgpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {isShortage && (
                            <span className="text-red-700 font-medium">
                              Attendance Shortage ({student.attendancePct}%)
                            </span>
                          )}
                          {backlogs > 0 && (
                            <span className="text-amber-700 font-medium">
                              {backlogs} Standing Backlog{backlogs > 1 ? 's' : ''}
                            </span>
                          )}
                          {student.cgpa < 6.0 && (
                            <span className="text-purple-700 font-medium">
                              Low CGPA Warning
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectStudent(student.enrollmentId)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
