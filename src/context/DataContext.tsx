import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { databaseService, DatabaseState } from '../services/databaseService';
import { Student, SemesterMark, AttendanceRecord, Project, Certificate, SupportTicket } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  db: DatabaseState;
  reloadDb: () => void;
  resetDb: () => void;
  addStudent: (data: Omit<Student, 'cgpa' | 'attendancePct'>) => { success: boolean; message: string; student?: Student };
  updateStudent: (enrollmentId: string, updates: Partial<Student>) => boolean;
  recordMarks: (mark: Omit<SemesterMark, 'markId' | 'totalMarks' | 'grade' | 'gradePoints' | 'status' | 'backlog'>) => SemesterMark;
  recordAttendance: (att: Omit<AttendanceRecord, 'attendanceId' | 'classesAbsent' | 'attendancePercentage' | 'status' | 'lastUpdated'>) => AttendanceRecord;
  createTicket: (ticket: Omit<SupportTicket, 'ticketId' | 'status' | 'createdAt'>) => SupportTicket;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status'], resolutionNotes?: string) => boolean;
  addProject: (proj: Omit<Project, 'projectId' | 'verificationStatus'>) => Project;
  addCertificate: (cert: Omit<Certificate, 'certificateId' | 'verificationStatus'>) => Certificate;
  updateVerification: (type: 'project' | 'certificate' | 'activity', id: number, status: 'Verified' | 'Rejected') => void;
  importCsv: (csvText: string, datasetType: string) => { importedCount: number; message: string };
  attendanceThreshold: number;
  setAttendanceThreshold: (val: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [db, setDb] = useState<DatabaseState>(databaseService.getState());
  const [attendanceThreshold, setAttendanceThreshold] = useState<number>(75);

  const reloadDb = () => {
    setDb({ ...databaseService.getState() });
  };

  const resetDb = () => {
    const newState = databaseService.resetToDefault();
    setDb({ ...newState });
  };

  const addStudent = (data: Omit<Student, 'cgpa' | 'attendancePct'>) => {
    const res = databaseService.addStudent({ ...data, performedBy: currentUser.fullName });
    if (res.success) reloadDb();
    return res;
  };

  const updateStudent = (enrollmentId: string, updates: Partial<Student>) => {
    const res = databaseService.updateStudent(enrollmentId, updates, currentUser.fullName);
    if (res) reloadDb();
    return res;
  };

  const recordMarks = (mark: Omit<SemesterMark, 'markId' | 'totalMarks' | 'grade' | 'gradePoints' | 'status' | 'backlog'>) => {
    const res = databaseService.recordMarks(mark, currentUser.fullName);
    reloadDb();
    return res;
  };

  const recordAttendance = (att: Omit<AttendanceRecord, 'attendanceId' | 'classesAbsent' | 'attendancePercentage' | 'status' | 'lastUpdated'>) => {
    const res = databaseService.recordAttendance(att, currentUser.fullName);
    reloadDb();
    return res;
  };

  const createTicket = (ticket: Omit<SupportTicket, 'ticketId' | 'status' | 'createdAt'>) => {
    const res = databaseService.createTicket(ticket);
    reloadDb();
    return res;
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status'], resolutionNotes?: string) => {
    const res = databaseService.updateTicketStatus(ticketId, status, resolutionNotes, currentUser.fullName, currentUser.fullName);
    if (res) reloadDb();
    return res;
  };

  const addProject = (proj: Omit<Project, 'projectId' | 'verificationStatus'>) => {
    const res = databaseService.addProject(proj, currentUser.fullName);
    reloadDb();
    return res;
  };

  const addCertificate = (cert: Omit<Certificate, 'certificateId' | 'verificationStatus'>) => {
    const res = databaseService.addCertificate(cert, currentUser.fullName);
    reloadDb();
    return res;
  };

  const updateVerification = (type: 'project' | 'certificate' | 'activity', id: number, status: 'Verified' | 'Rejected') => {
    databaseService.updateVerification(type, id, status, currentUser.fullName);
    reloadDb();
  };

  const importCsv = (csvText: string, datasetType: string) => {
    const res = databaseService.importCsvData(csvText, datasetType, currentUser.fullName);
    reloadDb();
    return res;
  };

  return (
    <DataContext.Provider
      value={{
        db,
        reloadDb,
        resetDb,
        addStudent,
        updateStudent,
        recordMarks,
        recordAttendance,
        createTicket,
        updateTicketStatus,
        addProject,
        addCertificate,
        updateVerification,
        importCsv,
        attendanceThreshold,
        setAttendanceThreshold
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
