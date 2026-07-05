import React, { createContext, useContext, useState, useEffect } from 'react';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const loginSession = (sessionData: UserSession) => {
    if (sessionData.accessToken) localStorage.setItem('accessToken', sessionData.accessToken);
    if (sessionData.refreshToken) localStorage.setItem('refreshToken', sessionData.refreshToken);
    localStorage.setItem('user', JSON.stringify(sessionData));
    setUser(sessionData);
  };

  const updateUserSession = (data: Partial<UserSession>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
