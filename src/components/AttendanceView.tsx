import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { exportService } from '../services/exportService';
import {
  Clock, AlertTriangle, CheckCircle, Download, Edit3,
  Search, Sliders, ShieldAlert, X, AlertCircle
} from 'lucide-react';

interface AttendanceViewProps {
  onSelectStudent: (enrollmentId: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ onSelectStudent }) => {
  const { db, attendanceThreshold, setAttendanceThreshold, recordAttendance } = useData();
  const { currentUser, isStudent, canManageAcademics } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SHORTAGE' | 'SAFE'>('ALL');
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  // Correction Modal Form state
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [corrHeld, setCorrHeld] = useState(48);
  const [corrAttended, setCorrAttended] = useState(40);
  const [corrReason, setCorrReason] = useState('Medical leave condonation verified by dispensary');
  const [corrError, setCorrError] = useState('');

  // Enriched attendance records
  const allRecords = useMemo(() => {
    return db.attendance.map(att => {
      const student = db.students.find(s => s.enrollmentId === att.enrollmentId);
      const subject = db.subjects.find(s => s.subjectCode === att.subjectCode);
      const isShortage = att.attendancePercentage < attendanceThreshold;
      return {
        ...att,
        studentName: student?.fullName || 'Unknown Student',
        departmentId: student?.departmentId || '',
        courseId: student?.courseId || '',
        subjectName: subject?.subjectName || att.subjectCode,
        isShortage
      };
    });
  }, [db.attendance, db.students, db.subjects, attendanceThreshold]);

  // Filtered attendance list
  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      if (isStudent && currentUser.associatedEnrollmentId) {
        if (r.enrollmentId !== currentUser.associatedEnrollmentId) return false;
      }
      if (filterStatus === 'SHORTAGE' && !r.isShortage) return false;
      if (filterStatus === 'SAFE' && r.isShortage) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          r.enrollmentId.toLowerCase().includes(q) ||
          r.studentName.toLowerCase().includes(q) ||
          r.subjectCode.toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allRecords, searchQuery, filterStatus, isStudent, currentUser]);

  // High-level aggregate metrics
  const totalHeldSessions = db.attendance.reduce((acc, a) => acc + a.classesHeld, 0);
  const totalAttendedSessions = db.attendance.reduce((acc, a) => acc + a.classesAttended, 0);
  const overallPct = totalHeldSessions > 0
    ? Number(((totalAttendedSessions / totalHeldSessions) * 100).toFixed(1))
    : 0;

  const shortageCount = allRecords.filter(r => r.isShortage).length;

  const handleOpenCorrection = (rec: typeof allRecords[0]) => {
    setSelectedRecordId(rec.attendanceId);
    setCorrHeld(rec.classesHeld);
    setCorrAttended(rec.classesAttended);
    setCorrReason('Medical / on-duty university representation condonation');
    setCorrError('');
    setIsCorrectionModalOpen(true);
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (corrAttended > corrHeld) {
      setCorrError('Attended classes cannot exceed total classes held.');
      return;
    }

    const rec = db.attendance.find(a => a.attendanceId === selectedRecordId);
    if (!rec) return;

    recordAttendance({
      enrollmentId: rec.enrollmentId,
      semester: rec.semester,
      subjectCode: rec.subjectCode,
      classesHeld: Number(corrHeld),
      classesAttended: Number(corrAttended)
    });

    setIsCorrectionModalOpen(false);
  };

  const handleExportShortage = () => {
    exportService.exportAttendanceShortageToCsv(db.students, attendanceThreshold);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Monitoring & Audit</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time session records, threshold configuration, debarment warnings, and logged corrections.
          </p>
        </div>

        <button
          onClick={handleExportShortage}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          Export Shortage Advisory
        </button>
      </div>

      {/* Threshold Control Bar */}
      {canManageAcademics && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900">
                Statutory Attendance Requirement Threshold: <span className="text-blue-700 font-mono text-sm">{attendanceThreshold}%</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Students below this percentage are ineligible for external university examination hall tickets.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">60%</span>
            <input
              type="range"
              min="60"
              max="90"
              step="5"
              value={attendanceThreshold}
              onChange={e => setAttendanceThreshold(Number(e.target.value))}
              className="w-40 cursor-pointer accent-blue-600"
            />
            <span className="text-xs text-slate-500 font-mono">90%</span>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Class Sessions</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {totalHeldSessions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Scheduled across semesters</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attended Sessions</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums mt-1">
            {totalAttendedSessions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Confirmed student attendance</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cohort Average %</div>
          <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums mt-1">
            {overallPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Aggregate attendance index</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shortage Warnings</div>
          <div className="text-2xl font-bold font-mono text-red-600 tabular-nums mt-1">
            {shortageCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Below {attendanceThreshold}% threshold</div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by student ID, name, or subject..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterStatus === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilterStatus('SHORTAGE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterStatus === 'SHORTAGE' ? 'bg-red-600 text-white' : 'bg-white border border-slate-200 text-red-600'}`}
            >
              Shortage Only (&lt;{attendanceThreshold}%)
            </button>
            <button
              onClick={() => setFilterStatus('SAFE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filterStatus === 'SAFE' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-emerald-700'}`}
            >
              Safe (&ge;{attendanceThreshold}%)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Subject Code & Name</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4 text-right">Classes Held</th>
                <th className="py-3 px-4 text-right">Attended</th>
                <th className="py-3 px-4 text-right">Absent</th>
                <th className="py-3 px-4 text-right">Percentage</th>
                <th className="py-3 px-4 text-center">Status</th>
                {canManageAcademics && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map(rec => (
                <tr key={rec.attendanceId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onSelectStudent(rec.enrollmentId)}
                      className="text-left group"
                    >
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {rec.studentName}
                      </div>
                      <div className="text-[11px] font-mono text-blue-700 tabular-nums">
                        {rec.enrollmentId}
                      </div>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{rec.subjectName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{rec.subjectCode}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                    Sem {rec.semester}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {rec.classesHeld}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                    {rec.classesAttended}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-red-600">
                    {rec.classesAbsent}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    <span className={rec.isShortage ? 'text-red-600' : 'text-slate-900'}>
                      {rec.attendancePercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-semibold ${rec.isShortage ? 'text-red-700' : 'text-emerald-700'}`}>
                      {rec.isShortage ? 'Debarment Risk' : 'Satisfactory'}
                    </span>
                  </td>
                  {canManageAcademics && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenCorrection(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        Correct
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Correction Modal */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Correct Attendance Record</h2>
                <p className="text-xs text-slate-500">Audit-logged condonation with justification</p>
              </div>
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {corrError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{corrError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCorrection} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Classes Held</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={corrHeld}
                    onChange={e => setCorrHeld(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Classes Attended</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    required
                    value={corrAttended}
                    onChange={e => setCorrAttended(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-slate-800">
                New Calculated Attendance: {corrHeld > 0 ? ((corrAttended / corrHeld) * 100).toFixed(2) : 0}%
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Audit Justification / Medical Condonation Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={corrReason}
                  onChange={e => setCorrReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                  placeholder="e.g. Medical leave approved by University Health Centre ref #HC-2026-88"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Commit Correction & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
