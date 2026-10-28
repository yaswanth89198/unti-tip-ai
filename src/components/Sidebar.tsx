import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, Clock, Award,
  Cpu, FileSpreadsheet, LifeBuoy, FileText, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const { currentUser, isStudent } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'students', label: isStudent ? 'My Profile' : 'Student Directory', icon: Users },
    { id: 'academics', label: 'Semester Academics', icon: BookOpen },
    { id: 'attendance', label: 'Attendance Tracker', icon: Clock },
    { id: 'talent', label: 'Talent & Placements', icon: Award },
    { id: 'ai-analytics', label: 'AI Analytics & Risk', icon: Cpu },
    { id: 'datasets', label: 'CSV Datasets', icon: FileSpreadsheet },
    { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy },
    { id: 'reports', label: 'Reports & Transcripts', icon: FileText },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-800">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Academic Context
          </div>
          <div className="text-sm font-medium text-white truncate">
            {currentUser.role === 'DEAN'
              ? 'Apex University Central'
              : currentUser.role === 'HOD'
              ? 'Dept. of Computer Science'
              : currentUser.role === 'COORDINATOR'
              ? 'Academic Operations Wing'
              : 'Student Self-Service Portal'}
          </div>
          <div className="text-xs text-blue-400 font-mono mt-0.5">
            AY 2025–2026 · Spring Session
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Role Footnote */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span>Access Tier:</span>
            <span className="font-mono text-blue-400 font-semibold">{currentUser.role}</span>
          </div>
          <div className="text-[11px] leading-relaxed text-slate-400">
            {currentUser.role === 'STUDENT'
              ? 'Access restricted to personal enrollment records.'
              : 'Audit trail logging is active for all modifications.'}
          </div>
        </div>
      </aside>
    </>
  );
};
