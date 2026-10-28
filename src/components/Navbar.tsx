import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { GraduationCap, ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTranscript?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, switchUser } = useAuth();

  const roles: { role: UserRole; label: string; sub: string }[] = [
    { role: 'DEAN', label: 'Dean', sub: 'University Wide' },
    { role: 'HOD', label: 'HOD', sub: 'CSE Dept' },
    { role: 'COORDINATOR', label: 'Coordinator', sub: 'Operations' },
    { role: 'STUDENT', label: 'Student', sub: 'Self Record' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner">
            <GraduationCap className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-left font-bold tracking-tight text-lg text-white hover:text-blue-200 transition-colors whitespace-nowrap shrink-0"
          >
            UniTrack AI
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${activeTab === 'dashboard' ? 'text-blue-400 font-semibold' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${activeTab === 'students' ? 'text-blue-400 font-semibold' : ''}`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('academics')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${activeTab === 'academics' ? 'text-blue-400 font-semibold' : ''}`}
          >
            Semester Academics
          </button>
          <button
            onClick={() => setActiveTab('ai-analytics')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${activeTab === 'ai-analytics' ? 'text-blue-400 font-semibold' : ''}`}
          >
            AI Predictive Engine
          </button>
          <button
            onClick={() => setActiveTab('datasets')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${activeTab === 'datasets' ? 'text-blue-400 font-semibold' : ''}`}
          >
            CSV Datasets
          </button>
        </nav>

        {/* Zone 3: Role Persona Switcher & Current User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Persona Switcher */}
          <div className="hidden lg:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            {roles.map(r => (
              <button
                key={r.role}
                onClick={() => switchUser(r.role)}
                title={`Switch role to ${r.label} (${r.sub})`}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-all ${
                  currentUser.role === r.role
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-xs font-bold text-blue-200">
                {currentUser.fullName.charAt(0)}
              </div>
            )}
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-100 truncate max-w-[120px]">{currentUser.fullName}</div>
              <div className="text-blue-400 text-[11px] font-mono">{currentUser.role}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
