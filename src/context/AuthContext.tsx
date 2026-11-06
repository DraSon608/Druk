import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'LOGOUT' | 'ROLE_SWITCH' | 'SECURITY_CHECK' | 'CAMPAIGN_UPDATE' | 'POS_TRANSACTION';
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED';
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (perm: string) => boolean;
  auditLogs: AuditLogEntry[];
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  sessionToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Admin for immediate exploration, but provide full login/logout flows
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => `DRUK-SEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-01',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      userId: 'user-01',
      userName: 'Tenzin Dorji (Admin)',
      action: 'LOGIN',
      details: 'Authenticated via biometric POS security token',
      ipAddress: '192.168.1.101',
      status: 'SUCCESS',
    },
    {
      id: 'log-02',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      userId: 'user-02',
      userName: 'Sarah Chen (Marketing)',
      action: 'CAMPAIGN_UPDATE',
      details: 'Activated White Dragon Welcome (DRUK15) barcode promo',
      ipAddress: '192.168.1.144',
      status: 'SUCCESS',
    },
    {
      id: 'log-03',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      userId: 'user-03',
      userName: 'Leo Vargas (POS Lead)',
      action: 'POS_TRANSACTION',
      details: 'Completed Barcode Checkout Terminal POS-01',
      ipAddress: '192.168.1.50',
      status: 'SUCCESS',
    },
  ]);

  const recordAudit = (action: AuditLogEntry['action'], details: string, status: 'SUCCESS' | 'DENIED' = 'SUCCESS') => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'anonymous',
      userName: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Unauthenticated',
      action,
      details,
      ipAddress: '192.168.1.108',
      status,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const login = (email: string, requestedRole?: UserRole): boolean => {
    const found = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || (requestedRole && u.role === requestedRole)
    );

    if (found) {
      setCurrentUser(found);
      const newToken = `DRUK-SEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setSessionToken(newToken);
      recordAudit('LOGIN', `User signed into secure workspace as ${found.role}`, 'SUCCESS');
      setIsLoginModalOpen(false);
      return true;
    } else {
      // Fallback create user
      const customUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0] || 'Client User',
        email,
        role: requestedRole || 'pos_operator',
        permissions: requestedRole === 'admin' ? ['all'] : ['pos_scan', 'checkout'],
        lastLogin: new Date().toISOString(),
      };
      setCurrentUser(customUser);
      recordAudit('LOGIN', `Custom client authenticated as ${customUser.role}`, 'SUCCESS');
      setIsLoginModalOpen(false);
      return true;
    }
  };

  const logout = () => {
    if (currentUser) {
      recordAudit('LOGOUT', `User ${currentUser.name} logged out securely`, 'SUCCESS');
    }
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    const userWithRole = INITIAL_USERS.find((u) => u.role === role);
    if (userWithRole) {
      setCurrentUser(userWithRole);
      recordAudit('ROLE_SWITCH', `Switched active role session to ${role}`, 'SUCCESS');
    }
  };

  const hasPermission = (perm: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.permissions.includes('all')) return true;
    return currentUser.permissions.includes(perm);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchRole,
        hasPermission,
        auditLogs,
        isLoginModalOpen,
        setIsLoginModalOpen,
        sessionToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
