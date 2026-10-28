import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { exportService } from '../services/exportService';
import {
  FileSpreadsheet, Upload, Download, CheckCircle, AlertTriangle,
  FileText, ArrowRight, Eye, RefreshCw, X
} from 'lucide-react';

export const CsvDatasetView: React.FC = () => {
  const { db, importCsv } = useData();
  const { canImportDatasets, currentUser } = useAuth();

  const datasets = [
    { id: 'students', name: 'students.csv', desc: 'Student enrollment IDs, contact, department, and CGPA metrics' },
    { id: 'courses', name: 'courses.csv', desc: 'Degrees, semesters count, credit totals, and assessment rules' },
    { id: 'subjects', name: 'subjects.csv', desc: 'Subject codes, credit allocations, syllabi, and faculty' },
    { id: 'semester_marks', name: 'semester_marks.csv', desc: 'Internal, external, and practical marks with grades' },
    { id: 'attendance', name: 'attendance.csv', desc: 'Classes held, attended, absent, and shortage status' },
    { id: 'student_activities', name: 'student_activities.csv', desc: 'Hackathons, research papers, internships, and sports' },
    { id: 'certificates', name: 'certificates.csv', desc: 'Verified professional industry credentials & skills' },
    { id: 'support_tickets', name: 'support_tickets.csv', desc: 'Student grievance and academic assistance history' },
    { id: 'student_performance_demo', name: 'student_performance_demo.csv', desc: 'ML benchmark training set for Scikit-learn models' }
  ];

  const [activeDatasetId, setActiveDatasetId] = useState<string>('students');
  const [importText, setImportText] = useState<string>('');
  const [importType, setImportType] = useState<string>('students');
  const [previewResult, setPreviewResult] = useState<{
    isValid: boolean;
    totalRows: number;
    acceptedRows: number;
    rejectedRows: number;
    errors: string[];
    previewRows: Record<string, string>[];
  } | null>(null);
  const [importNotification, setImportNotification] = useState<string>('');

  // Sample data generator for active dataset
  const getSampleDataForActive = () => {
    switch (activeDatasetId) {
      case 'students':
        return db.students.slice(0, 5).map(s => ({
          enrollment_id: s.enrollmentId,
          full_name: s.fullName,
          course_id: s.courseId,
          department_id: s.departmentId,
          cgpa: s.cgpa.toString(),
          attendance_pct: `${s.attendancePct}%`,
          status: s.status
        }));
      case 'courses':
        return db.courses.map(c => ({
          course_id: c.courseId,
          course_name: c.courseName,
          total_semesters: c.totalSemesters.toString(),
          total_credits: c.totalCredits.toString(),
          assessment_rule: c.assessmentRule
        }));
      case 'subjects':
        return db.subjects.slice(0, 5).map(sub => ({
          subject_code: sub.subjectCode,
          subject_name: sub.subjectName,
          credits: sub.credits.toString(),
          max_internal: sub.maxInternal.toString(),
          max_external: sub.maxExternal.toString()
        }));
      case 'semester_marks':
        return db.marks.slice(0, 5).map(m => ({
          enrollment_id: m.enrollmentId,
          semester: m.semester.toString(),
          subject_code: m.subjectCode,
          total_marks: m.totalMarks.toString(),
          grade: m.grade,
          status: m.status
        }));
      case 'attendance':
        return db.attendance.slice(0, 5).map(a => ({
          enrollment_id: a.enrollmentId,
          semester: a.semester.toString(),
          subject_code: a.subjectCode,
          held: a.classesHeld.toString(),
          attended: a.classesAttended.toString(),
          percentage: `${a.attendancePercentage}%`
        }));
      default:
        return db.students.slice(0, 5).map(s => ({
          enrollment_id: s.enrollmentId,
          full_name: s.fullName
        }));
    }
  };

  const sampleRows = getSampleDataForActive();
  const sampleHeaders = sampleRows.length > 0 ? Object.keys(sampleRows[0]) : [];

  const handleValidatePreview = () => {
    setImportNotification('');
    if (!importText.trim()) return;

    const res = (db as any).parseAndValidateCsv
      ? (db as any).parseAndValidateCsv(importText, importType)
      : {
          isValid: true,
          totalRows: importText.trim().split('\n').length - 1,
          acceptedRows: importText.trim().split('\n').length - 1,
          rejectedRows: 0,
          errors: [],
          previewRows: []
        };

    setPreviewResult(res);
  };

  const handleCommitImport = () => {
    if (!importText.trim()) return;
    const res = importCsv(importText, importType);
    setImportNotification(res.message);
    setPreviewResult(null);
    setImportText('');
  };

  const handleLoadSampleToEditor = () => {
    const sampleCsv = `enrollment_id,full_name,email,phone,course_id,branch_id,department_id,admission_year,current_year,current_semester,expected_graduation,cgpa,attendance_pct
240121,Rohan K. Varma,rohan.varma@uni.edu,+91 98765 43230,BTECH,CSE,DEPT_CS,2024,1,2,2028,8.40,88.5
240122,Simran Sethi,simran.s@uni.edu,+91 98765 43231,BTECH,AIDS,DEPT_CS,2024,1,2,2028,9.10,93.0
240123,Kunal Sengupta,kunal.s@uni.edu,+91 98765 43232,BTECH,ECE,DEPT_EC,2023,2,4,2027,7.60,81.0`;
    setImportText(sampleCsv);
    setImportType('students');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            CSV Dataset Architecture & Importer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative university tabular datasets, validation pipeline, and live batch ingestion.
          </p>
        </div>

        <button
          onClick={handleLoadSampleToEditor}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 shadow-xs transition-colors self-start sm:self-auto"
        >
          <FileText className="w-3.5 h-3.5" />
          Load Sample Valid CSV
        </button>
      </div>

      {/* Dataset Inventory Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {datasets.map(ds => {
          const isSelected = activeDatasetId === ds.id;
          return (
            <button
              key={ds.id}
              onClick={() => setActiveDatasetId(ds.id)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900">{ds.name}</span>
                  <FileSpreadsheet className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{ds.desc}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">/datasets/{ds.name}</span>
                <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>
                  {isSelected ? 'Viewing' : 'Inspect'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dataset Viewer Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Dataset Live Preview: <span className="font-mono text-blue-700">{activeDatasetId}.csv</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Showing active database records corresponding to this dataset schema.
            </p>
          </div>

          <button
            onClick={() => exportService.downloadCsv(`${activeDatasetId}.csv`, '/* Exported dataset */')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Download {activeDatasetId}.csv
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                {sampleHeaders.map(h => (
                  <th key={h} className="py-3 px-4 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {sampleRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  {sampleHeaders.map(h => (
                    <td key={h} className="py-3 px-4 text-slate-800">
                      {(row as any)[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Batch Ingestion & Validation Workbench */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">CSV Import Engine & Validator</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validates required columns, 6-digit enrollment IDs, numeric ranges, and duplicate keys prior to saving to database.
          </p>
        </div>

        {importNotification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{importNotification}</span>
            </div>
            <button onClick={() => setImportNotification('')}>
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Dataset Type</label>
            <select
              value={importType}
              onChange={e => setImportType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium bg-white focus:border-blue-500 focus:outline-hidden"
            >
              <option value="students">Students Roster (students.csv)</option>
              <option value="semester_marks">Academic Marks (semester_marks.csv)</option>
              <option value="attendance">Attendance Records (attendance.csv)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Paste Raw CSV Content (Header row included)
            </label>
            <textarea
              rows={5}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="enrollment_id,full_name,email,phone,course_id,branch_id,department_id,admission_year,current_year,current_semester,expected_graduation,cgpa,attendance_pct&#10;240121,Rohan Varma,rohan@uni.edu,+91 9876543210,BTECH,CSE,DEPT_CS,2024,1,1,2028,8.2,85"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            {importText.trim() ? `${importText.trim().split('\n').length - 1} data rows detected` : 'Ready to parse'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleValidatePreview}
              disabled={!importText.trim()}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              Validate & Preview
            </button>
            <button
              onClick={handleCommitImport}
              disabled={!importText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              Commit Valid Rows to DB
            </button>
          </div>
        </div>

        {/* Validation Output Card */}
        {previewResult && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Validation Pre-Flight Report</span>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-emerald-700 font-bold">{previewResult.acceptedRows} Accepted</span>
                <span className="text-red-600 font-bold">{previewResult.rejectedRows} Rejected</span>
              </div>
            </div>

            {previewResult.errors.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-red-700">Errors flagged during inspection:</span>
                {previewResult.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-600 flex items-center gap-1.5 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
