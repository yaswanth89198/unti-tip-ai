import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { exportService } from '../services/exportService';
import {
  FileText, Download, Printer, Search, ShieldCheck,
  Award, Clock, CheckCircle, ArrowRight
} from 'lucide-react';

interface ReportsViewProps {
  onOpenTranscriptFor: (enrollmentId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onOpenTranscriptFor }) => {
  const { db, attendanceThreshold } = useData();
  const { currentUser, isStudent } = useAuth();

  const [lookupId, setLookupId] = useState('240101');
  const [activeReportTab, setActiveReportTab] = useState<'transcripts' | 'debarment' | 'audit'>('transcripts');

  const handleExportStudents = () => {
    exportService.exportStudentsToCsv(db.students, db.courses, db.departments);
  };

  const handleExportDebarment = () => {
    exportService.exportAttendanceShortageToCsv(db.students, attendanceThreshold);
  };

  const shortageStudents = db.students.filter(s => s.attendancePct < attendanceThreshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Institutional Reports & Regulatory Transcripts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Certified university transcripts, attendance debarment notices, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportStudents}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Full Roster
          </button>
          <button
            onClick={handleExportDebarment}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 rounded-lg text-xs font-semibold text-white hover:bg-red-700 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Debarment List
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold text-slate-500">
        <button
          onClick={() => setActiveReportTab('transcripts')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeReportTab === 'transcripts' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          Student Transcripts Dispatch
        </button>
        <button
          onClick={() => setActiveReportTab('debarment')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeReportTab === 'debarment' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          Attendance Debarment Notices ({shortageStudents.length})
        </button>
        <button
          onClick={() => setActiveReportTab('audit')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeReportTab === 'audit' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          System Audit Trail ({db.auditLogs.length} Events)
        </button>
      </div>

      {/* Transcripts Lookup Tab */}
      {activeReportTab === 'transcripts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-xl">
            <h2 className="text-base font-bold text-slate-900 mb-1">Generate Certified Academic Transcript</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter 6-digit student enrollment ID to open high-resolution printable transcript.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={6}
                value={lookupId}
                onChange={e => setLookupId(e.target.value)}
                placeholder="e.g. 240101"
                className="px-3 py-2 border border-slate-200 rounded-lg font-mono text-sm focus:border-blue-500 focus:outline-hidden"
              />
              <button
                onClick={() => onOpenTranscriptFor(lookupId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                Open Official Transcript
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-900">
              Recent University Enrolled Candidates
            </div>
            <div className="divide-y divide-slate-100">
              {db.students.map(s => (
                <div key={s.enrollmentId} className="p-4 flex items-center justify-between hover:bg-slate-50 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{s.fullName}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      ID: {s.enrollmentId} · {s.courseId} ({s.branchId}) · CGPA: {s.cgpa.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenTranscriptFor(s.enrollmentId)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-semibold transition-colors flex items-center gap-1"
                  >
                    Generate Transcript
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Debarment Notices Tab */}
      {activeReportTab === 'debarment' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-red-50/50 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-red-900">
                Attendance Shortage Debarment Notices (Below {attendanceThreshold}%)
              </h2>
              <p className="text-xs text-red-700">
                Official list of students prohibited from sitting in semester external examinations unless condoned.
              </p>
            </div>
            <button
              onClick={handleExportDebarment}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 shadow-xs"
            >
              Export CSV Notice
            </button>
          </div>

          {shortageStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No students currently below the {attendanceThreshold}% statutory threshold.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Enrollment ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Program & Branch</th>
                    <th className="py-3 px-4 text-right">Attendance %</th>
                    <th className="py-3 px-4 text-right">Deficit</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shortageStudents.map(student => (
                    <tr key={student.enrollmentId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-red-700 tabular-nums">
                        {student.enrollmentId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{student.fullName}</td>
                      <td className="py-3 px-4 text-slate-600">{student.courseId} · {student.branchId}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-red-600 tabular-nums">
                        {student.attendancePct}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                        -{(attendanceThreshold - student.attendancePct).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-red-700 uppercase text-[11px]">
                        DEBARRED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* System Audit Trail Tab */}
      {activeReportTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-base font-bold text-slate-900">University Operational Audit Trail</h2>
            <p className="text-xs text-slate-500">
              Cryptographically timestamped action logs for academic changes, marks entry, and attendance adjustments.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.auditLogs.map(log => (
                  <tr key={log.logId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{log.timestamp.substring(0, 19)}</td>
                    <td className="py-3 px-4 font-bold text-blue-700">{log.actionType}</td>
                    <td className="py-3 px-4 text-slate-700">{log.entityName}</td>
                    <td className="py-3 px-4 text-slate-900">{log.entityId}</td>
                    <td className="py-3 px-4 text-slate-700 font-sans">{log.performedBy}</td>
                    <td className="py-3 px-4 text-slate-600 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
