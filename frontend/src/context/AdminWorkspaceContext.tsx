import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from './AuthContext';

export interface InternProfile {
  userId: string;
  profileId: string;
  employeeId: string;
  email: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'DISABLED';
  fullName: string;
  phone?: string;
  address?: string;
  college?: string;
  degree?: string;
  department?: string;
  joiningDate?: string;
  expectedEndDate?: string;
  currentTechStack?: string;
  primarySkill?: string;
  secondarySkill?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  profilePictureUrl?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeUploadedAt?: string;
  requiredDailyHours?: number;
}

interface AdminWorkspaceContextType {
  internsList: InternProfile[];
  isLoading: boolean;
  selectedIntern: InternProfile | null;
  setSelectedIntern: (intern: InternProfile | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'PENDING_APPROVAL';
  setStatusFilter: (status: 'ALL' | 'ACTIVE' | 'PENDING_APPROVAL') => void;
  filteredInterns: InternProfile[];
}

const AdminWorkspaceContext = createContext<AdminWorkspaceContextType | undefined>(undefined);

export const AdminWorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedIntern, setSelectedIntern] = useState<InternProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_APPROVAL'>('ALL');

  const { data: rawList = [], isLoading } = useQuery<InternProfile[]>({
    queryKey: ['adminWorkspaceInterns'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/interns?size=100');
        const payload = res.data?.data;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.content)) return payload.content;
        return [];
      } catch (err) {
        console.error('Failed to fetch interns list:', err);
        return [];
      }
    },
    enabled: user?.role === 'ADMIN',
    refetchInterval: 15000,
  });

  const internsList = Array.isArray(rawList) ? rawList : [];

  // Auto-select first active intern on initial load if none selected
  useEffect(() => {
    if (!selectedIntern && internsList.length > 0) {
      const firstActive = internsList.find((i) => i && i.status === 'ACTIVE') || internsList[0];
      if (firstActive) setSelectedIntern(firstActive);
    } else if (selectedIntern && internsList.length > 0) {
      const updated = internsList.find((i) => i && i.userId === selectedIntern.userId);
      if (updated) setSelectedIntern(updated);
    }
  }, [internsList]);

  const filteredInterns = internsList.filter((intern) => {
    if (!intern) return false;
    const name = intern.fullName || '';
    const email = intern.email || '';
    const empId = intern.employeeId || '';
    const skill = intern.primarySkill || '';
    const tech = intern.currentTechStack || '';

    const q = (searchTerm || '').toLowerCase();
    const matchesSearch =
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      empId.toLowerCase().includes(q) ||
      skill.toLowerCase().includes(q) ||
      tech.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && intern.status !== statusFilter) return false;
    return true;
  });

  return (
    <AdminWorkspaceContext.Provider
      value={{
        internsList,
        isLoading,
        selectedIntern,
        setSelectedIntern,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        filteredInterns,
      }}
    >
      {children}
    </AdminWorkspaceContext.Provider>
  );
};

export const useAdminWorkspace = () => {
  const context = useContext(AdminWorkspaceContext);
  if (!context) {
    throw new Error('useAdminWorkspace must be used within an AdminWorkspaceProvider');
  }
  return context;
};
