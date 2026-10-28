/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StudentsListView } from './components/StudentsListView';
import { StudentProfileView } from './components/StudentProfileView';
import { SemesterAcademicsView } from './components/SemesterAcademicsView';
import { AttendanceView } from './components/AttendanceView';
import { TalentPlacementsView } from './components/TalentPlacementsView';
import { AiAnalyticsView } from './components/AiAnalyticsView';
import { CsvDatasetView } from './components/CsvDatasetView';
import { SupportTicketsView } from './components/SupportTicketsView';
import { ReportsView } from './components/ReportsView';
import { TranscriptModal } from './components/TranscriptModal';
import { Menu } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isStudent, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [transcriptModalId, setTranscriptModalId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // If student clicks on 'students' tab, auto-open their own profile
  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    setSelectedStudentId(null);
  };

  const handleSelectStudent = (enrollmentId: string) => {
    setSelectedStudentId(enrollmentId);
  };

  const handleOpenTranscript = (enrollmentId: string) => {
    setTranscriptModalId(enrollmentId);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar with 3-Zone Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenTranscript={() => setTranscriptModalId(currentUser.associatedEnrollmentId || '240101')}
      />

      {/* Mobile Menu Bar for small viewports */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <Menu className="w-4 h-4" />
          <span>Menu: {activeTab.replace('-', ' ').toUpperCase()}</span>
        </button>
        <span className="text-xs text-blue-400 font-mono">{currentUser.role}</span>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleNavigateTab}
          isOpenMobile={mobileSidebarOpen}
          setIsOpenMobile={setMobileSidebarOpen}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {selectedStudentId ? (
            <StudentProfileView
              enrollmentId={selectedStudentId}
              onBack={() => setSelectedStudentId(null)}
              onOpenTranscript={handleOpenTranscript}
              onNavigateTab={handleNavigateTab}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onSelectStudent={handleSelectStudent}
                  onNavigateTab={handleNavigateTab}
                />
              )}
              {activeTab === 'students' && (
                <StudentsListView
                  onSelectStudent={handleSelectStudent}
                  onOpenTranscriptFor={handleOpenTranscript}
                />
              )}
              {activeTab === 'academics' && (
                <SemesterAcademicsView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'attendance' && (
                <AttendanceView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'talent' && <TalentPlacementsView />}
              {activeTab === 'ai-analytics' && (
                <AiAnalyticsView onSelectStudent={handleSelectStudent} />
              )}
              {activeTab === 'datasets' && <CsvDatasetView />}
              {activeTab === 'tickets' && <SupportTicketsView />}
              {activeTab === 'reports' && (
                <ReportsView onOpenTranscriptFor={handleOpenTranscript} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Transcript Modal */}
      {transcriptModalId && (
        <TranscriptModal
          enrollmentId={transcriptModalId}
          onClose={() => setTranscriptModalId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
