import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Award, Briefcase, Code, ExternalLink, Plus, CheckCircle,
  XCircle, Clock, ShieldCheck, X
} from 'lucide-react';

export const TalentPlacementsView: React.FC = () => {
  const { db, addProject, addCertificate, updateVerification } = useData();
  const { currentUser, isStudent, canManageAcademics } = useAuth();

  const [activeTab, setActiveTab] = useState<'projects' | 'certificates' | 'placements' | 'activities'>('projects');
  const [isAddProjOpen, setIsAddProjOpen] = useState(false);
  const [isAddCertOpen, setIsAddCertOpen] = useState(false);

  // Form states
  const [projTitle, setProjTitle] = useState('');
  const [projStack, setProjStack] = useState('');
  const [projRepo, setProjRepo] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projSem, setProjSem] = useState(4);

  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certId, setCertId] = useState('');
  const [certSkills, setCertSkills] = useState('');

  const currentEnrollment = isStudent && currentUser.associatedEnrollmentId ? currentUser.associatedEnrollmentId : '240101';

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle) return;

    addProject({
      enrollmentId: currentEnrollment,
      semester: Number(projSem),
      title: projTitle,
      techStack: projStack,
      repoUrl: projRepo || undefined,
      description: projDesc
    });

    setIsAddProjOpen(false);
    setProjTitle('');
    setProjStack('');
    setProjDesc('');
  };

  const handleCreateCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle) return;

    addCertificate({
      enrollmentId: currentEnrollment,
      title: certTitle,
      issuingAuthority: certIssuer,
      issueDate: new Date().toISOString().split('T')[0],
      credentialId: certId || undefined,
      skillsCovered: certSkills
    });

    setIsAddCertOpen(false);
    setCertTitle('');
    setCertIssuer('');
    setCertId('');
    setCertSkills('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Talent & Placement Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Student technical projects, industry credentials, corporate recruitments, and talent verification.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddProjOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Submit Project
          </button>
          <button
            onClick={() => setIsAddCertOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            Submit Certificate
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold text-slate-500">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeTab === 'projects' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          Technical & Capstone Projects ({db.projects.length})
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeTab === 'certificates' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          Verified Certifications ({db.certificates.length})
        </button>
        <button
          onClick={() => setActiveTab('placements')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeTab === 'placements' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          Placements & Corporate Offers ({db.placements.length})
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-3 px-3 border-b-2 transition-colors ${activeTab === 'activities' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'}`}
        >
          Hackathons & Honors ({db.activities.length})
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {db.projects.map(proj => {
            const student = db.students.find(s => s.enrollmentId === proj.enrollmentId);
            return (
              <div
                key={proj.projectId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] text-blue-700 font-semibold tabular-nums">
                      {proj.enrollmentId} · Sem {proj.semester}
                    </span>
                    <span className="text-emerald-700 font-semibold text-xs">
                      {proj.verificationStatus}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{proj.title}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Student: {student?.fullName || proj.enrollmentId}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{proj.description}</p>
                  <div className="text-[11px] font-mono text-slate-700 mt-3 pt-2 border-t border-slate-100">
                    Stack: {proj.techStack}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {proj.repoUrl ? (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-mono"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Repository
                    </a>
                  ) : <span />}

                  {canManageAcademics && proj.verificationStatus === 'Pending' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateVerification('project', proj.projectId, 'Verified')}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold hover:bg-emerald-100"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => updateVerification('project', proj.projectId, 'Rejected')}
                        className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[11px] font-semibold hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {db.certificates.map(cert => {
            const student = db.students.find(s => s.enrollmentId === cert.enrollmentId);
            return (
              <div
                key={cert.certificateId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] text-blue-700 font-semibold tabular-nums">
                      {cert.enrollmentId}
                    </span>
                    <span className="text-emerald-700 font-semibold text-xs">
                      {cert.verificationStatus}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{cert.title}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Authority: {cert.issuingAuthority}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Student: {student?.fullName} · Issued: {cert.issueDate}
                  </div>
                  {cert.credentialId && (
                    <div className="text-[11px] font-mono text-slate-500 mt-1">
                      ID: {cert.credentialId}
                    </div>
                  )}
                  <div className="text-xs text-slate-700 mt-2 font-medium">
                    Skills: {cert.skillsCovered}
                  </div>
                </div>

                {canManageAcademics && cert.verificationStatus === 'Pending' && (
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-1.5 text-xs">
                    <button
                      onClick={() => updateVerification('certificate', cert.certificateId, 'Verified')}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
                    >
                      Verify Authenticity
                    </button>
                    <button
                      onClick={() => updateVerification('certificate', cert.certificateId, 'Rejected')}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Placements Tab */}
      {activeTab === 'placements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {db.placements.map(pl => {
            const student = db.students.find(s => s.enrollmentId === pl.enrollmentId);
            return (
              <div
                key={pl.placementId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-base">{pl.companyName}</span>
                  <span className="text-emerald-700 font-semibold text-xs">
                    {pl.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700">{pl.jobRole}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Candidate: {student?.fullName} ({pl.enrollmentId})
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Offered CTC:</span>
                  <span className="text-lg font-bold font-mono text-blue-700 tabular-nums">
                    ₹{pl.packageCtcLpa} LPA
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {db.activities.map(act => {
            const student = db.students.find(s => s.enrollmentId === act.enrollmentId);
            return (
              <div
                key={act.activityId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-blue-700">{act.category}</span>
                  <span className="text-emerald-700 font-semibold text-xs">
                    {act.verificationStatus}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{act.title}</h3>
                <div className="text-xs text-slate-600 mt-1">{act.description}</div>
                <div className="text-xs font-semibold text-slate-700 mt-2">{act.achievement}</div>
                <div className="text-[11px] text-slate-400 mt-2 font-mono">
                  {student?.fullName} · {act.organizationEvent} · {act.dateRecorded}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Project Modal */}
      {isAddProjOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Submit Academic / Capstone Project</h2>
            <p className="text-xs text-slate-500 mb-4">Add project title, description, and repository URL.</p>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={e => setProjTitle(e.target.value)}
                  placeholder="e.g. Real-Time Distributed Telemetry Engine"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technology Stack</label>
                <input
                  type="text"
                  required
                  value={projStack}
                  onChange={e => setProjStack(e.target.value)}
                  placeholder="e.g. React, TypeScript, FastAPI, PostgreSQL"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Code Repository URL</label>
                <input
                  type="url"
                  value={projRepo}
                  onChange={e => setProjRepo(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={projDesc}
                  onChange={e => setProjDesc(e.target.value)}
                  placeholder="Brief summary of architecture, problem statement, and outcomes"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddProjOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Certificate Modal */}
      {isAddCertOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Submit Industry Certification</h2>
            <p className="text-xs text-slate-500 mb-4">Record credential ID and issuing authority.</p>

            <form onSubmit={handleCreateCert} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certificate Title *</label>
                <input
                  type="text"
                  required
                  value={certTitle}
                  onChange={e => setCertTitle(e.target.value)}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issuing Authority *</label>
                <input
                  type="text"
                  required
                  value={certIssuer}
                  onChange={e => setCertIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services / Google Cloud"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Credential ID (Optional)</label>
                <input
                  type="text"
                  value={certId}
                  onChange={e => setCertId(e.target.value)}
                  placeholder="e.g. AWS-SAA-8392019"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skills Covered</label>
                <input
                  type="text"
                  value={certSkills}
                  onChange={e => setCertSkills(e.target.value)}
                  placeholder="e.g. Cloud Computing, Kubernetes, IAM, Networking"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddCertOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Submit Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
