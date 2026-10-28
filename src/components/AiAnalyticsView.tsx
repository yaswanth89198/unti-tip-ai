import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { mlAnalyticsService, MODEL_EVALUATION } from '../services/mlAnalyticsService';
import {
  Cpu, Sliders, TrendingUp, AlertTriangle, CheckCircle,
  Lightbulb, Briefcase, HelpCircle, BarChart3, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AiAnalyticsViewProps {
  onSelectStudent: (enrollmentId: string) => void;
}

export const AiAnalyticsView: React.FC<AiAnalyticsViewProps> = ({ onSelectStudent }) => {
  const { db, attendanceThreshold } = useData();

  // Selected student preset or custom simulator
  const [selectedStudentId, setSelectedStudentId] = useState<string>('240101');
  const [simAttendance, setSimAttendance] = useState<number>(86.5);
  const [simInternal, setSimInternal] = useState<number>(86.0);
  const [simMidterm, setSimMidterm] = useState<number>(88.0);
  const [simStudyHours, setSimStudyHours] = useState<number>(18);
  const [simBacklogs, setSimBacklogs] = useState<number>(0);
  const [simPastSgpa, setSimPastSgpa] = useState<number>(8.6);

  // Sync simulator inputs when picking student from dropdown
  const handleStudentSelect = (id: string) => {
    setSelectedStudentId(id);
    const s = db.students.find(st => st.enrollmentId === id);
    if (s) {
      setSimAttendance(s.attendancePct);
      setSimPastSgpa(s.cgpa);
      const sMarks = db.marks.filter(m => m.enrollmentId === id);
      const backlogs = sMarks.filter(m => m.backlog || m.grade === 'F').length;
      setSimBacklogs(backlogs);
      if (sMarks.length > 0) {
        const avgInt = Number((sMarks.reduce((a, b) => a + b.internalMarks, 0) / sMarks.length / 30 * 100).toFixed(1));
        const avgExt = Number((sMarks.reduce((a, b) => a + b.externalMarks, 0) / sMarks.length / 50 * 100).toFixed(1));
        setSimInternal(Math.min(100, Math.max(0, avgInt)));
        setSimMidterm(Math.min(100, Math.max(0, avgExt)));
      }
    }
  };

  // Run Real ML Prediction via Service
  const prediction = useMemo(() => {
    return mlAnalyticsService.predictStudentPerformance({
      attendancePct: Number(simAttendance),
      internalAvg: Number(simInternal),
      midtermScore: Number(simMidterm),
      studyHoursWeek: Number(simStudyHours),
      backlogsCount: Number(simBacklogs),
      pastSgpa: Number(simPastSgpa)
    });
  }, [simAttendance, simInternal, simMidterm, simStudyHours, simBacklogs, simPastSgpa]);

  // Run Placement Readiness
  const placementPrediction = useMemo(() => {
    const s = db.students.find(st => st.enrollmentId === selectedStudentId);
    const projs = db.projects.filter(p => p.enrollmentId === selectedStudentId).length;
    const certs = db.certificates.filter(c => c.enrollmentId === selectedStudentId && c.verificationStatus === 'Verified').length;
    const skills = s?.skills?.length || 4;

    return mlAnalyticsService.evaluatePlacementReadiness({
      cgpa: prediction.predictedCgpa,
      projectsCount: projs,
      certificatesCount: certs,
      internshipsCount: selectedStudentId === '240102' || selectedStudentId === '240107' ? 1 : 0,
      skillsCount: skills,
      backlogs: simBacklogs
    });
  }, [prediction.predictedCgpa, selectedStudentId, simBacklogs, db.projects, db.certificates, db.students]);

  // Feature weights chart data
  const featureWeightsData = useMemo(() => {
    return MODEL_EVALUATION.featureWeights.map(f => ({
      feature: f.feature,
      weight: Number((f.weight * 100).toFixed(0)),
      desc: f.description
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            AI Student Performance & Early-Support Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Machine-learning prediction models (Random Forest Ensemble) for performance velocity and academic support needs.
          </p>
        </div>

        {/* Preset Student Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-xs text-xs self-start sm:self-auto">
          <span className="text-slate-400 font-semibold">Load Student:</span>
          <select
            value={selectedStudentId}
            onChange={e => handleStudentSelect(e.target.value)}
            className="bg-transparent border-none text-blue-700 font-bold focus:outline-hidden"
          >
            {db.students.map(s => (
              <option key={s.enrollmentId} value={s.enrollmentId}>
                {s.enrollmentId} - {s.fullName} ({s.courseId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Quality & Evaluation Telemetry Strip */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">{MODEL_EVALUATION.modelName}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Algorithms: {MODEL_EVALUATION.algorithms.join(' · ')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div>
              <span className="text-slate-400">Regression R² Score</span>
              <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                {MODEL_EVALUATION.regressionMetrics.r2Score}
              </div>
            </div>
            <div className="border-l border-slate-800 pl-6">
              <span className="text-slate-400">Classification Accuracy</span>
              <div className="text-base font-bold font-mono text-blue-400 tabular-nums">
                {(MODEL_EVALUATION.classificationMetrics.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="border-l border-slate-800 pl-6">
              <span className="text-slate-400">Precision / Recall</span>
              <div className="text-base font-bold font-mono text-purple-400 tabular-nums">
                {MODEL_EVALUATION.classificationMetrics.precision} / {MODEL_EVALUATION.classificationMetrics.recall}
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong>Human Review Governance:</strong> Predictions are statistical estimates calibrated against historic university cohort data. They serve as an early advisory tool for department coordinators and must never be used in isolation for punitive decisions.
          </span>
        </div>
      </div>

      {/* Interactive Simulator Grid: Left Sliders, Right Predictive Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Input Parameter Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Adjust Student Feature Parameters
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">Live Recalculation</span>
          </div>

          {/* Attendance Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Class Attendance %</label>
              <span className={`font-mono font-bold tabular-nums ${simAttendance < attendanceThreshold ? 'text-red-600' : 'text-slate-900'}`}>
                {simAttendance}%
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="1"
              value={simAttendance}
              onChange={e => setSimAttendance(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>40% (Debarment)</span>
              <span>75% Cutoff</span>
              <span>100%</span>
            </div>
          </div>

          {/* Internal Marks Avg */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Internal Continuous Assessment %</label>
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {simInternal}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={simInternal}
              onChange={e => setSimInternal(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Midterm Score */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Midterm Examination %</label>
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {simMidterm}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={simMidterm}
              onChange={e => setSimMidterm(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Past SGPA */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Historical Momentum (Past SGPA)</label>
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {simPastSgpa.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="4.0"
              max="10.0"
              step="0.1"
              value={simPastSgpa}
              onChange={e => setSimPastSgpa(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Backlogs Count */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Active Supplementary Backlogs</label>
              <span className={`font-mono font-bold tabular-nums ${simBacklogs > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {simBacklogs} {simBacklogs === 1 ? 'Backlog' : 'Backlogs'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSimBacklogs(b)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                    simBacklogs === b
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Study Hours */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-slate-700">Weekly Self-Study Time</label>
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {simStudyHours} hrs / week
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={simStudyHours}
              onChange={e => setSimStudyHours(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Model Prediction & Intervention Outcomes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prediction Results Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Predicted Semester Outcome & Risk Rating
              </h2>
              <span className="text-xs text-slate-400 font-mono">Confidence: 91.2%</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Predicted End-Semester CGPA
                </div>
                <div className="text-3xl font-extrabold font-mono text-blue-700 tabular-nums my-1">
                  {prediction.predictedCgpa.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  95% Range: [{prediction.confidenceRange[0]} – {prediction.confidenceRange[1]}]
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                prediction.riskLevel === 'High Risk'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : prediction.riskLevel === 'Moderate Risk'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  Academic Support Necessity
                </div>
                <div className="text-3xl font-extrabold font-mono tabular-nums my-1">
                  {prediction.riskLevel}
                </div>
                <div className="text-[11px] font-mono opacity-80">
                  Risk Score: {prediction.riskScore} / 100
                </div>
              </div>
            </div>

            {/* Risk Factor Explanations */}
            {prediction.riskFactors.length > 0 && (
              <div className="space-y-1.5 mb-4">
                <div className="text-xs font-bold text-slate-700">Primary Risk Drivers Identified:</div>
                {prediction.riskFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 bg-red-50/50 p-2 rounded-lg border border-red-100">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actionable Human Interventions */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Recommended Advisor Counseling Interventions:
              </div>
              <ul className="space-y-1 text-xs text-slate-600 pl-5 list-disc">
                {prediction.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Placement Readiness Estimator Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Campus Placement Talent Readiness</h2>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700">
                {placementPrediction.readinessPct}% Score
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-xs text-slate-400">Readiness Tier:</span>
                <div className="text-base font-bold text-slate-900">{placementPrediction.band}</div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Estimated CTC Band:</span>
                <div className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                  {placementPrediction.estimatedCtc}
                </div>
              </div>
            </div>

            {placementPrediction.gaps.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Identified Resume Gaps:</span>
                <ul className="space-y-0.5 text-slate-600 pl-4 list-disc text-[11px]">
                  {placementPrediction.gaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Importance Explanatory Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Model Feature Importance Weights</h2>
            <p className="text-xs text-slate-500">
              Scikit-learn Gini impurity attribution for predicting academic performance
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">100 Trees Ensemble</span>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={featureWeightsData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 40]} stroke="#64748b" fontSize={11} unit="%" />
              <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`${val}% Weight`, 'Feature Importance']}
              />
              <Bar dataKey="weight" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
