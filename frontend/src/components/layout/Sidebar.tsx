import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAdminWorkspace } from '@/context/AdminWorkspaceContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CalendarCheck,
  Code2,
  CheckSquare,
  Flame,
  UserCheck,
  Search,
  Users,
  Code,
  CalendarDays,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (user?.role === 'ADMIN') {
    return <AdminSidebar />;
  }

  const internLinks = [
    { to: '/intern/profile', icon: UserCheck, label: 'My Profile & Tech Stack' },
    { to: '/intern/attendance', icon: CalendarCheck, label: 'Attendance Check-In' },
    { to: '/intern/leaves', icon: CalendarDays, label: 'Leave Requests' },
    { to: '/intern/assignments', icon: Code2, label: 'Coding Assignments' },
    { to: '/intern/tasks', icon: CheckSquare, label: 'My Daily Tasks' },
    { to: '/intern/duolingo', icon: Flame, label: 'Duolingo Streak Log' },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/60 p-4 min-h-[calc(100vh-4rem)] backdrop-blur-md flex flex-col justify-between">
      <div>
        <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Intern Workspace
        </div>
        <nav className="space-y-1.5">
          {internLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/5'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-12 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
          <Flame className="h-4 w-4 text-amber-500" />
          <span>Learning Sprint</span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
          Consistent daily task execution and problem solving drive high batch ratings.
        </p>
      </div>
    </aside>
  );
};

const AdminSidebar: React.FC = () => {
  const {
    filteredInterns,
    selectedIntern,
    setSelectedIntern,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    internsList,
    isLoading: internsLoading,
    isError: internsError,
  } = useAdminWorkspace();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectIntern = (intern: any) => {
    setSelectedIntern(intern);
    if (location.pathname !== '/admin/dashboard') {
      navigate('/admin/dashboard');
    }
  };

  return (
    <aside className="w-80 shrink-0 border-r border-slate-800/80 bg-slate-950/80 p-4 min-h-[calc(100vh-4rem)] flex flex-col gap-4 backdrop-blur-xl">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-white">
            Interns Directory
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono border-slate-700 text-slate-400">
          {internsLoading ? '…' : internsError ? 'ERR' : `${internsList.length} total`}
        </Badge>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search intern..."
          className="pl-8.5 h-9 bg-slate-900/90 border-slate-800 text-xs text-white placeholder:text-slate-500 focus:border-blue-500/50 rounded-lg"
        />
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800/60">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`py-1 text-[10px] font-bold rounded-md transition-all ${
            statusFilter === 'ALL'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`py-1 text-[10px] font-bold rounded-md transition-all ${
            statusFilter === 'ACTIVE'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter('PENDING_APPROVAL')}
          className={`py-1 text-[10px] font-bold rounded-md transition-all ${
            statusFilter === 'PENDING_APPROVAL'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Pending
        </button>
      </div>

      {/* Scrollable Interns List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
        {internsLoading ? (
          <div className="py-10 text-center text-xs text-slate-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto mb-2" />
            Loading interns...
          </div>
        ) : internsError ? (
          <div className="py-10 text-center text-xs text-rose-400 italic px-2">
            Failed to load intern directory. Check your connection and reload.
          </div>
        ) : !Array.isArray(filteredInterns) || filteredInterns.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500 italic">
            {internsList.length === 0 ? 'No interns registered yet.' : 'No interns match criteria.'}
          </div>
        ) : (
          filteredInterns.map((intern) => {
            if (!intern) return null;
            const isSelected = selectedIntern?.userId === intern.userId;
            const avatarChar = intern.fullName ? intern.fullName.charAt(0).toUpperCase() : 'I';
            return (
              <div
                key={intern.userId || intern.employeeId || intern.email || 'intern'}
                onClick={() => handleSelectIntern(intern)}
                className={`group cursor-pointer rounded-xl p-3 border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-900/50 border-slate-800/60 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Profile Picture / Avatar */}
                  <div
                    className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black text-sm text-white shadow overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 ring-2 ring-blue-400/50'
                        : 'bg-slate-800 group-hover:bg-slate-700'
                    }`}
                  >
                    {intern.profilePictureUrl ? (
                      <img
                        src={intern.profilePictureUrl}
                        alt="avatar"
                        className="h-full w-full object-cover"
                    />
                    ) : (
                      avatarChar
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {intern.fullName || 'Unnamed Intern'}
                      </p>
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          intern.status === 'ACTIVE' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'
                        }`}
                        title={intern.status || 'UNKNOWN'}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono text-blue-400/90">{intern.employeeId || 'N/A'}</span>
                      <span className="uppercase font-semibold tracking-wider text-[9px] text-slate-500">
                        {intern.status === 'ACTIVE' ? 'Active' : 'Pending'}
                      </span>
                    </div>

                    {/* Tech Stack Badge */}
                    <div className="mt-2 flex items-center gap-1">
                      <Code className="h-3 w-3 text-purple-400 shrink-0" />
                      <span className="text-[10px] font-medium text-purple-300 truncate">
                        {intern.primarySkill || (intern.currentTechStack ? intern.currentTechStack.split(',')[0] : 'Software Dev')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
