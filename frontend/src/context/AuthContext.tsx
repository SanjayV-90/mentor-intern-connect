import React, { createContext, useContext, useState } from 'react';
import { queryClient } from '@/lib/queryClient';

export interface UserSession {
  userId: string;
  email: string;
  role: 'ADMIN' | 'INTERN';
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'DISABLED';
  fullName: string;
  profilePictureUrl?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loginSession: (sessionData: UserSession) => void;
  updateUserSession: (data: Partial<UserSession>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// ---------------------------------------------------------------------------
// Storage helpers — all auth state lives in sessionStorage so each browser
// tab maintains its own independent session. Two tabs logged in as different
// roles (ADMIN / INTERN) cannot overwrite each other's tokens.
// ---------------------------------------------------------------------------

const KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
} as const;

function readSession(): UserSession | null {
  try {
    const raw = sessionStorage.getItem(KEYS.user);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

function writeSession(session: UserSession): void {
  if (session.accessToken) {
    sessionStorage.setItem(KEYS.accessToken, session.accessToken);
  }
  if (session.refreshToken) {
    sessionStorage.setItem(KEYS.refreshToken, session.refreshToken);
  }
  sessionStorage.setItem(KEYS.user, JSON.stringify(session));
}

function clearSession(): void {
  sessionStorage.removeItem(KEYS.accessToken);
  sessionStorage.removeItem(KEYS.refreshToken);
  sessionStorage.removeItem(KEYS.user);
  // Remove legacy localStorage entries written by the old implementation.
  // This ensures the old token can never leak into the Axios interceptor.
  localStorage.removeItem(KEYS.accessToken);
  localStorage.removeItem(KEYS.refreshToken);
  localStorage.removeItem(KEYS.user);
}

// ---------------------------------------------------------------------------
// Exported token helpers used by api.ts (avoids circular imports).
// api.ts must NOT read from localStorage at all.
// ---------------------------------------------------------------------------

export function getSessionToken(): string | null {
  return sessionStorage.getItem(KEYS.accessToken);
}

export function setSessionToken(token: string): void {
  sessionStorage.setItem(KEYS.accessToken, token);
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(KEYS.refreshToken);
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hydrate from sessionStorage — each tab gets its own independent session.
  const [user, setUser] = useState<UserSession | null>(() => readSession());

  const loginSession = (sessionData: UserSession): void => {
    // Clear any stale TanStack Query cache that belongs to the previous user
    // before committing the new session. This prevents data from one account
    // appearing momentarily for another account within the same tab.
    queryClient.clear();
    writeSession(sessionData);
    setUser(sessionData);
  };

  const updateUserSession = (data: Partial<UserSession>): void => {
    if (!user) return;
    const updated: UserSession = { ...user, ...data };
    writeSession(updated);
    setUser(updated);
  };

  const logout = (): void => {
    // Clear all cached query data for this tab before destroying the session.
    queryClient.clear();
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginSession, updateUserSession, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
