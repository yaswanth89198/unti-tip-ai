import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: User;
  switchUser: (role: UserRole) => void;
  setCustomUser: (user: User) => void;
  hasRole: (roles: UserRole[]) => boolean;
  canViewStudent: (studentEnrollmentId: string) => boolean;
  canManageAcademics: boolean;
  canImportDatasets: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default logged in as Dean for initial inspection, or easy 1-click switcher
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);

  const switchUser = (role: UserRole) => {
    const found = DEMO_USERS.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  const setCustomUser = (user: User) => {
    setCurrentUser(user);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return roles.includes(currentUser.role);
  };

  const canViewStudent = (studentEnrollmentId: string): boolean => {
    if (currentUser.role === 'DEAN' || currentUser.role === 'COORDINATOR') return true;
    if (currentUser.role === 'HOD') return true; // HOD has department view
    if (currentUser.role === 'STUDENT') {
      return currentUser.associatedEnrollmentId === studentEnrollmentId;
    }
    return false;
  };

  const canManageAcademics = currentUser.role === 'DEAN' || currentUser.role === 'HOD' || currentUser.role === 'COORDINATOR';
  const canImportDatasets = currentUser.role === 'DEAN' || currentUser.role === 'COORDINATOR';
  const isStudent = currentUser.role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchUser,
        setCustomUser,
        hasRole,
        canViewStudent,
        canManageAcademics,
        canImportDatasets,
        isStudent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
