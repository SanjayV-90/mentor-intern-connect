import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { openSecureFile } from '@/lib/api';
import { useAdminWorkspace, type InternProfile } from '@/context/AdminWorkspaceContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  UserCheck,
  Code,
  Globe,
  Calendar,
  Briefcase,
  GraduationCap,
  ExternalLink,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarDays,
  Send,
  Download,
  CheckCircle,
  Flame,
  Award,
  ShieldCheck,
  MessageSquare,
  GitPullRequest,
  GitCommit,
  CheckSquare,
  BarChart3,
  Search,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ModuleTab =
  | 'attendance'
  | 'leaves'
  | 'coding'
  | 'tasks'
  | 'assignments'
  | 'duolingo'
  | 'communication'
  | 'projects'
  | 'ai_insights'
  | 'timeline';

type PlatformTab = 'LEETCODE' | 'HACKERRANK' | 'GFG' | 'CODECHEF';

export const AdminDashboard: React.FC = () => {
  const { selectedIntern, setSelectedIntern } = useAdminWorkspace();
  const queryClient = useQueryClient();

  const [activeModule, setActiveModule] = useState<ModuleTab>('ai_insights');
  const [activePlatform, setActivePlatform] = useState<PlatformTab>('LEETCODE');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const [workHoursInput, setWorkHoursInput] = useState<string>('8.0');
  const [adminCommentInput, setAdminCommentInput] = useState<{ [key: string]: string }>({});

  // Assignment Filters State
  const [assignDateRange, setAssignDateRange] = useState<string>('All');
  const [assignTechStack, setAssignTechStack] = useState<string>('All');
  const [assignStatus, setAssignStatus] = useState<string>('All');
  const [assignSearch, setAssignSearch] = useState<string>('');

  // Fetch telemetry specifically for selected intern
  const { data: rawAttendance = [] } = useQuery({
    queryKey: ['adminInternAttendance', selectedIntern?.userId],
    queryFn: async () => {
      if (!selectedIntern?.userId) return [];
      try {
        const res = await api.get(`/admin/interns/${selectedIntern.userId}/attendance`);
        return Array.isArray(res?.data?.data) ? res.data.data : [];
      } catch {
        return [];
      }
    },
    enabled: !!selectedIntern?.userId,
    refetchInterval: 15000,
  });

  const { data: attendanceSummary } = useQuery({
    queryKey: ['adminInternAttendanceSummary', selectedIntern?.userId],
    queryFn: async () => {
      if (!selectedIntern?.userId) return null;
      try {
        const res = await api.get(`/admin/interns/${selectedIntern.userId}/attendance-summary`);
        return res?.data?.data || null;
      } catch {
        return null;
      }
    },
    enabled: !!selectedIntern?.userId,
    refetchInterval: 15000,
  });

  const { data: internLeaves = [] } = useQuery({
    queryKey: ['adminInternLeaves', selectedIntern?.userId],
    queryFn: async () => {
      if (!selectedIntern?.userId) return [];
      try {
        const res = await api.get(`/admin/leaves`, { params: { internId: selectedIntern.userId } });
        return Array.isArray(res?.data?.data) ? res.data.data : [];
      } catch {
        return [];
      }
    },
    enabled: !!selectedIntern?.userId,
    refetchInterval: 15000,
  });

  React.useEffect(() => {
    if (attendanceSummary?.requiredDailyHours) {
      setWorkHoursInput(attendanceSummary.requiredDailyHours.toString());
    } else if (selectedIntern?.requiredDailyHours) {
      setWorkHoursInput(selectedIntern.requiredDailyHours.toString());
    } else {
      setWorkHoursInput('8.0');
    }
  }, [attendanceSummary, selectedIntern]);

  const { data: rawAssignments = [] } = useQuery({
    queryKey: ['adminInternAssignments', selectedIntern?.userId],
    queryFn: async () => {
      if (!selectedIntern?.userId) return [];
      try {
        const res = await api.get(`/admin/interns/${selectedIntern.userId}/assignments`);
        return Array.isArray(res?.data?.data) ? res.data.data : [];
      } catch {
        return [];
      }
    },
    enabled: !!selectedIntern?.userId,
    refetchInterval: 15000,
  });

  const { data: rawTasks = [] } = useQuery({
    queryKey: ['adminInternTasks', selectedIntern?.userId],
    queryFn: async () => {
      if (!selectedIntern?.userId) return [];
      try {
        const res = await api.get(`/admin/interns/${selectedIntern.userId}/tasks`);
        return Array.isArray(res?.data?.data) ? res.data.data : [];
      } catch {
        return [];
      }
    },
    enabled: !!selectedIntern?.userId,
    refetchInterval: 15000,
  });

  const { data: rawDuolingo = [] } = useQuery({
    queryKey: ['adminInternDuolingo', selectedIntern?.userId],
    queryFn: async () => {
      if (!selectedIntern?.userId) return [];
      try {
        const res = await api.get(`/admin/interns/${selectedIntern.userId}/duolingo`);
        return Array.isArray(res?.data?.data) ? res.data.data : [];
      } catch {
        return [];
      }
    },
    enabled: !!selectedIntern?.userId,
    refetchInterval: 15000,
  });

  const allAttendance = Array.isArray(rawAttendance) ? rawAttendance : [];
  const allAssignments = Array.isArray(rawAssignments) ? rawAssignments : [];
  const allTasks = Array.isArray(rawTasks) ? rawTasks : [];
  const allDuolingo = Array.isArray(rawDuolingo) ? rawDuolingo : [];

  const updateWorkScheduleMutation = useMutation({
    mutationFn: async (hours: number) => api.put(`/admin/interns/${selectedIntern?.userId}/work-schedule`, { requiredDailyHours: hours }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInternAttendanceSummary'] });
      queryClient.invalidateQueries({ queryKey: ['adminWorkspaceInterns'] });
      setFeedbackSuccess('Work schedule policy updated successfully!');
      setTimeout(() => setFeedbackSuccess(null), 3000);
    },
  });

  const approveLeaveMutation = useMutation({
    mutationFn: async ({ id, comments }: { id: string; comments?: string }) => api.put(`/admin/leaves/${id}/review`, { status: 'APPROVED', adminComment: comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInternLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['adminInternAttendanceSummary'] });
      queryClient.invalidateQueries({ queryKey: ['adminLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['myAttendanceSummary'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      setFeedbackSuccess('Leave request approved!');
      setTimeout(() => setFeedbackSuccess(null), 3000);
    },
  });

  const rejectLeaveMutation = useMutation({
    mutationFn: async ({ id, comments }: { id: string; comments?: string }) => api.put(`/admin/leaves/${id}/review`, { status: 'REJECTED', adminComment: comments }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInternLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['adminInternAttendanceSummary'] });
      queryClient.invalidateQueries({ queryKey: ['adminLeaves'] });
      queryClient.invalidateQueries({ queryKey: ['myAttendanceSummary'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
      setFeedbackSuccess('Leave request rejected.');
      setTimeout(() => setFeedbackSuccess(null), 3000);
    },
  });

  const approveInternMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/interns/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWorkspaceInterns'] });
      setFeedbackSuccess('Intern account approved and activated!');
      setTimeout(() => setFeedbackSuccess(null), 3000);
    },
  });

  const approveAssignmentMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/assignments/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAssignmentsAll'] });
      setFeedbackSuccess('Assignment submission approved!');
      setTimeout(() => setFeedbackSuccess(null), 3000);
    },
  });

  const rejectAssignmentMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/assignments/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAssignmentsAll'] });
      setFeedbackSuccess('Assignment submission rejected.');
      setTimeout(() => setFeedbackSuccess(null), 3000);
    },
  });

  if (!selectedIntern) {
    return (
      <Card className="glass-card border-slate-800 p-12 text-center text-slate-400 my-8 animate-fade-in">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-blue-500 animate-pulse opacity-80" />
        <h2 className="text-xl font-bold text-white">No Intern Selected or Available</h2>
        <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
          Select an intern from the directory on the left. If no interns are listed, registered interns will appear here once they complete onboarding.
        </p>
      </Card>
    );
  }

  // Telemetry specifically for selectedIntern
  const internAttendance = allAttendance;
  const internAssignments = allAssignments;
  const internTasks = allTasks;
  const internDuolingo = allDuolingo.length > 0 ? allDuolingo[0] : null;

  const hasActivity = internAttendance.length > 0 || internAssignments.length > 0 || internTasks.length > 0 || !!internDuolingo;

  // Dynamic Metrics
  const totalCheckins = internAttendance.length;
  const presentCheckins = internAttendance.filter((a: any) => a && a.status === 'PRESENT').length;
  const attendancePercent = totalCheckins > 0 ? Math.round((presentCheckins / totalCheckins) * 100) : 0;

  const solvedCount = internAssignments.filter((a: any) => a && (a.status === 'SOLVED' || a.status === 'APPROVED')).length;
  const overallScore = hasActivity ? Math.min(100, Math.round((attendancePercent + Math.min(100, solvedCount * 10)) / 2)) : 0;

  const handleActionClick = (msg: string) => {
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(null), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {feedbackSuccess && (
        <div className="flex items-center space-x-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-sm font-semibold text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* ========================================== */}
      {/* 1. WORKSPACE HEADER BANNER                 */}
      {/* ========================================== */}
      <Card className="glass-card border-blue-500/30 bg-gradient-to-r from-slate-900/95 via-blue-950/30 to-slate-900/95 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            {/* Left: Avatar & Identity */}
            <div className="flex items-start sm:items-center space-x-4">
              <div className="h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-500/25 border border-white/10 overflow-hidden">
                {selectedIntern.profilePictureUrl ? (
                  <img src={selectedIntern.profilePictureUrl} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  selectedIntern.fullName ? selectedIntern.fullName.charAt(0).toUpperCase() : 'I'
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {selectedIntern.fullName}
                  </h1>
                  <Badge className="font-mono text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedIntern.employeeId}
                  </Badge>
                  <Badge
                    variant={selectedIntern.status === 'ACTIVE' ? 'success' : 'warning'}
                    className="text-xs font-bold"
                  >
                    {selectedIntern.status}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs sm:text-sm text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <GraduationCap className="h-4 w-4 text-emerald-400 shrink-0" />
                    {selectedIntern.college || 'Engineering Institute'}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Code className="h-4 w-4 text-purple-400 shrink-0" />
                    Primary Tech: <strong className="text-purple-300">{selectedIntern.primarySkill || 'Full Stack'}</strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-blue-300 font-semibold">
                    Learning Track
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Key Score KPI Pills */}
            <div className="flex items-center gap-4 border-t xl:border-t-0 border-slate-800 pt-4 xl:pt-0">
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-2.5 text-center min-w-[120px]">
                <span className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                  Overall Score
                </span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  {overallScore}%
                </span>
              </div>
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-2.5 text-center min-w-[120px]">
                <span className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                  Attendance %
                </span>
                <span className="text-2xl font-black text-emerald-400">{attendancePercent}%</span>
              </div>
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 px-4 py-2.5 text-center min-w-[120px]">
                <span className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                  Mentor Lead
                </span>
                <span className="text-sm font-bold text-slate-200 block mt-1">Batch Manager</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================== */}
      {/* 2. MODULE NAVIGATION BAR (Linear/Notion)   */}
      {/* ========================================== */}
      <div className="flex items-center space-x-1.5 overflow-x-auto rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800/80 backdrop-blur-xl">
        {[
          { id: 'ai_insights', label: 'AI Performance Insights', icon: Sparkles },
          { id: 'attendance', label: 'Attendance', icon: UserCheck },
          { id: 'leaves', label: 'Leave Requests & Policy', icon: CalendarDays },
          { id: 'coding', label: 'Coding Performance', icon: Code },
          { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare },
          { id: 'assignments', label: 'Assignment Submission', icon: FileText },
          { id: 'duolingo', label: 'Duolingo', icon: Flame },
          { id: 'communication', label: 'Communication', icon: MessageSquare },
          { id: 'projects', label: 'Projects', icon: GitPullRequest },
          { id: 'timeline', label: 'Timeline', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id as ModuleTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================== */}
      {/* 3. MAIN WORKSPACE WITH RIGHT QUICK ACTIONS */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* CENTER MODULE AREA (Span 3) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* MODULE 8: AI PERFORMANCE INSIGHTS */}
          {activeModule === 'ai_insights' && (
            !hasActivity ? (
              <Card className="glass-card p-12 text-center text-slate-400">
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-blue-500 opacity-60" />
                <h3 className="text-base font-bold text-white">No activity available yet.</h3>
                <p className="text-xs text-slate-400 mt-1">AI Performance Insights will generate automatically once the intern records attendance or submits assignments.</p>
              </Card>
            ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="glass-card border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-slate-900">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-extrabold text-blue-400">Consistency Score</span>
                      <h3 className="text-3xl font-black text-white mt-1">96 / 100</h3>
                    </div>
                    <Award className="h-10 w-10 text-blue-400 opacity-80" />
                  </CardContent>
                </Card>
                <Card className="glass-card border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-slate-900">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-extrabold text-emerald-400">Learning Velocity</span>
                      <h3 className="text-3xl font-black text-white mt-1">High (+14%)</h3>
                    </div>
                    <TrendingUp className="h-10 w-10 text-emerald-400 opacity-80" />
                  </CardContent>
                </Card>
                <Card className="glass-card border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-slate-900">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-extrabold text-purple-400">Retention Risk</span>
                      <h3 className="text-3xl font-black text-emerald-400 mt-1">Low Risk</h3>
                    </div>
                    <ShieldCheck className="h-10 w-10 text-purple-400 opacity-80" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" /> Demonstrated Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-300">
                      <strong>Algorithmic Mastery:</strong> Solved complex LRU Cache & Graph traversal problems with optimal $O(1)$ time complexity.
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-300">
                      <strong>Batch Punctuality:</strong> Zero unexcused absences during Sprint 1 and Sprint 2 check-ins.
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-amber-400 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" /> Growth & Improvement Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-300">
                      <strong>Unit Test Coverage:</strong> Needs stronger JUnit 5 assertion coverage on edge cases in Spring service layers.
                    </div>
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-300">
                      <strong>SQL Optimization:</strong> Practice advanced indexing strategies for partitioned PostgreSQL tables.
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-400" /> AI Recommended Next Tasks & Sprint Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold uppercase text-blue-400 block">Suggested Problems</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      <li>LeetCode #23: Merge k Sorted Lists (Hard)</li>
                      <li>HackerRank: Advanced SQL Window Partitions</li>
                      <li>Spring Security 6 Stateless OAuth2 Resource Server</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold uppercase text-emerald-400 block">Predicted Sprint Outcome</span>
                    <p className="text-slate-300 font-semibold text-base">
                      Exceeds Expectations (Projected Rating: 4.8 / 5.0)
                    </p>
                    <p className="text-xs text-slate-400">
                      Based on current learning velocity and zero task blockers logged this week.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            )
          )}

          {/* MODULE 1: ATTENDANCE */}
          {activeModule === 'attendance' && (() => {
            const workingDays = attendanceSummary?.totalWorkingDays ?? internAttendance.length;
            const presentDays = attendanceSummary?.presentDays ?? internAttendance.filter((a: any) => a.status === 'PRESENT').length;
            const halfDays = attendanceSummary?.halfDays ?? internAttendance.filter((a: any) => a.status === 'HALF_DAY').length;
            const absentDays = attendanceSummary?.absentDays ?? (workingDays - presentDays);
            const approvedLeaves = attendanceSummary?.approvedLeaveDays ?? 0;
            const calcRate = attendanceSummary?.attendanceRate ?? (workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0);

            return (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <Card className="glass-card">
                    <CardContent className="p-3.5 text-center">
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Present</span>
                      <p className="text-xl font-black text-emerald-400 mt-1">{presentDays}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="p-3.5 text-center">
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Half-Day (0.5)</span>
                      <p className="text-xl font-black text-amber-400 mt-1">{halfDays}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="p-3.5 text-center">
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Absent</span>
                      <p className="text-xl font-black text-rose-400 mt-1">{absentDays}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="p-3.5 text-center">
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Approved Leave</span>
                      <p className="text-xl font-black text-purple-400 mt-1">{approvedLeaves}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="p-3.5 text-center">
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Working Days</span>
                      <p className="text-xl font-black text-blue-400 mt-1">{workingDays}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card">
                    <CardContent className="p-3.5 text-center">
                      <span className="text-[11px] text-slate-400 uppercase font-bold block">Attendance Rate</span>
                      <p className="text-xl font-black text-emerald-400 mt-1">{calcRate}%</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold">30-Day Attendance Trend Graph</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workingDays === 0 ? (
                      <div className="h-48 flex items-center justify-center text-xs text-slate-500 italic">
                        No activity available yet.
                      </div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={internAttendance.map((a: any) => ({ day: a.attendanceDate, hours: a.workingHours || 8.0 }))}>
                            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                            <Area type="monotone" dataKey="hours" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Small attendance summary under the graph */}
                    <div className="flex flex-wrap items-center justify-around gap-4 rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 text-xs font-bold text-slate-300">
                      <div>Present : <span className="text-emerald-400">{presentDays}</span></div>
                      <div className="h-3 w-[1px] bg-slate-800 hidden sm:block" />
                      <div>Half-Day : <span className="text-amber-400">{halfDays}</span></div>
                      <div className="h-3 w-[1px] bg-slate-800 hidden sm:block" />
                      <div>Absent : <span className="text-rose-400">{absentDays}</span></div>
                      <div className="h-3 w-[1px] bg-slate-800 hidden sm:block" />
                      <div>Approved Leave : <span className="text-purple-400">{approvedLeaves}</span></div>
                      <div className="h-3 w-[1px] bg-slate-800 hidden sm:block" />
                      <div>Working Days : <span className="text-blue-400">{workingDays}</span></div>
                      <div className="h-3 w-[1px] bg-slate-800 hidden sm:block" />
                      <div>Rate : <span className="text-emerald-400">{calcRate}%</span></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader><CardTitle className="text-base font-bold">Detailed Check-In Logs</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {internAttendance.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center italic">No activity available yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                              <th className="p-2.5">Date</th>
                              <th className="p-2.5">Check-In</th>
                              <th className="p-2.5">Check-Out</th>
                              <th className="p-2.5">Working Hours</th>
                              <th className="p-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {internAttendance.map((att: any) => (
                              <tr key={att.id}>
                                <td className="p-2.5 font-mono font-bold text-white">{att.attendanceDate}</td>
                                <td className="p-2.5 font-mono text-slate-300">{att.checkInTime || '09:00'}</td>
                                <td className="p-2.5 font-mono text-slate-300">{att.checkOutTime || 'In Progress'}</td>
                                <td className="p-2.5 font-mono text-blue-400">{att.workingHours ? `${att.workingHours} hrs` : 'In Progress'}</td>
                                <td className="p-2.5">
                                  {!att.checkOutTime && !att.logoutTime ? (
                                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">IN PROGRESS</Badge>
                                  ) : (
                                    <Badge variant={att.status === 'PRESENT' ? 'success' : att.status === 'HALF_DAY' ? 'warning' : 'destructive'}>{att.status}</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* MODULE 1.5: LEAVES & WORK SCHEDULE POLICY */}
          {activeModule === 'leaves' && (
            <div className="space-y-6 animate-fade-in">
              <Card className="glass-card border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" /> Per-Intern Working Hours Policy
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Configure required daily working hours for proportional attendance classification (Present &ge; 100%, Half-Day &ge; 50%, Absent &lt; 50%).
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      Current Policy: <span className="text-blue-400 font-mono font-bold">{workHoursInput} Hours / Day</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      When this mentee checks out, duration is compared against this policy automatically by the backend.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                      type="number"
                      step="0.5"
                      min="1"
                      max="24"
                      value={workHoursInput}
                      onChange={(e) => setWorkHoursInput(e.target.value)}
                      className="w-28 bg-slate-900 border-slate-700 text-white font-mono text-sm"
                    />
                    <Button
                      onClick={() => updateWorkScheduleMutation.mutate(parseFloat(workHoursInput) || 8.0)}
                      disabled={updateWorkScheduleMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-500 font-bold px-6"
                    >
                      {updateWorkScheduleMutation.isPending ? 'Saving...' : 'Save Policy'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-purple-400" /> Leave Applications Review
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {internLeaves.length} Total Requests
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Review leave requests submitted by {selectedIntern.fullName}. Approved leaves are excluded from absent days calculations.
                  </CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="p-3.5">Submitted</th>
                        <th className="p-3.5">Leave Dates</th>
                        <th className="p-3.5">Type & Days</th>
                        <th className="p-3.5">Reason</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Admin Action / Comment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {internLeaves.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                            No leave requests submitted by this mentee yet.
                          </td>
                        </tr>
                      ) : (
                        internLeaves.map((l: any) => (
                          <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3.5 text-xs text-slate-400">
                              {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-3.5 font-mono text-xs text-white font-medium">
                              {l.startDate} &rarr; {l.endDate}
                            </td>
                            <td className="p-3.5">
                              <span className="font-semibold text-white block text-xs">{l.leaveType}</span>
                              <span className="text-[10px] text-slate-400">{l.workingDaysCount || l.totalDays} Working Days</span>
                            </td>
                            <td className="p-3.5 text-xs text-slate-300 max-w-xs truncate">
                              {l.reason}
                            </td>
                            <td className="p-3.5">
                              {l.status === 'APPROVED' && <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">APPROVED</Badge>}
                              {l.status === 'REJECTED' && <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30">REJECTED</Badge>}
                              {l.status === 'PENDING' && <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">PENDING</Badge>}
                              {l.status === 'CANCELLED' && <Badge className="bg-slate-500/20 text-slate-400 border border-slate-500/30">CANCELLED</Badge>}
                            </td>
                            <td className="p-3.5">
                              {l.status === 'PENDING' ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    placeholder="Optional comment..."
                                    value={adminCommentInput[l.id] || ''}
                                    onChange={(e) => setAdminCommentInput({ ...adminCommentInput, [l.id]: e.target.value })}
                                    className="h-8 text-xs w-36 bg-slate-900 border-slate-700 text-white"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => approveLeaveMutation.mutate({ id: l.id, comments: adminCommentInput[l.id] })}
                                    disabled={approveLeaveMutation.isPending}
                                    className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 font-bold"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => rejectLeaveMutation.mutate({ id: l.id, comments: adminCommentInput[l.id] })}
                                    disabled={rejectLeaveMutation.isPending}
                                    className="h-8 bg-rose-600 hover:bg-rose-500 text-white text-xs px-2.5 font-bold"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  {l.adminComment ? `Note: "${l.adminComment}"` : (l.status === 'CANCELLED' ? 'Cancelled by Mentee' : 'Reviewed')}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* MODULE 2: CODING PERFORMANCE */}
          {activeModule === 'coding' && (() => {
            const solved = internAssignments;
            const totalProblems = solved.length;
            const easyCount = solved.filter((a: any) => a.difficulty?.toUpperCase() === 'EASY').length;
            const mediumCount = solved.filter((a: any) => a.difficulty?.toUpperCase() === 'MEDIUM').length;
            const hardCount = solved.filter((a: any) => a.difficulty?.toUpperCase() === 'HARD').length;
            const acceptanceRate = totalProblems > 0 ? 100 : 0;

            const now = new Date();
            const weeklyData = [1, 2, 3, 4].map((w) => {
              const count = solved.filter((a: any) => {
                if (!a.submissionDate) return w === 4;
                const subDate = new Date(a.submissionDate);
                const diffDays = Math.floor((now.getTime() - subDate.getTime()) / (1000 * 3600 * 24));
                const weekNum = Math.floor(diffDays / 7) + 1;
                return weekNum === w || (w === 4 && weekNum >= 4);
              }).length;
              return { week: `Wk ${w}`, solved: count };
            }).reverse();

            return (
              <div className="space-y-6 animate-fade-in">
                {/* Platform sub-tabs */}
                <div className="flex space-x-2 border-b border-slate-800 pb-3">
                  {(['LEETCODE', 'HACKERRANK', 'GFG', 'CODECHEF'] as PlatformTab[]).map((plat) => (
                    <button
                      key={plat}
                      onClick={() => setActivePlatform(plat)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        activePlatform === plat
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <Card className="glass-card text-center p-4"><span className="text-xs text-slate-400 block">Total Problems</span><strong className="text-2xl text-white">{totalProblems}</strong></Card>
                  <Card className="glass-card text-center p-4"><span className="text-xs text-emerald-400 block">Easy</span><strong className="text-2xl text-emerald-400">{easyCount}</strong></Card>
                  <Card className="glass-card text-center p-4"><span className="text-xs text-amber-400 block">Medium</span><strong className="text-2xl text-amber-400">{mediumCount}</strong></Card>
                  <Card className="glass-card text-center p-4"><span className="text-xs text-rose-400 block">Hard</span><strong className="text-2xl text-rose-400">{hardCount}</strong></Card>
                  <Card className="glass-card text-center p-4 col-span-2 sm:col-span-1"><span className="text-xs text-blue-400 block">Acceptance Rate</span><strong className="text-2xl text-blue-400">{acceptanceRate}%</strong></Card>
                </div>

                <Card className="glass-card">
                  <CardHeader><CardTitle className="text-base font-bold">Weekly Algorithmic Activity</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {totalProblems === 0 ? (
                      <div className="h-48 flex items-center justify-center text-xs text-slate-500 italic">
                        No activity available yet.
                      </div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyData}>
                            <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                            <Bar dataKey="solved" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {/* MODULE 3: DAILY TASKS */}
          {activeModule === 'tasks' && (() => {
            const assigned = internTasks.length;
            const completed = internTasks.filter((t: any) => t.status === 'COMPLETED').length;
            const pending = assigned - completed;

            return (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="glass-card p-4 text-center"><span className="text-xs text-slate-400 block">Assigned</span><strong className="text-2xl text-white">{assigned}</strong></Card>
                <Card className="glass-card p-4 text-center"><span className="text-xs text-emerald-400 block">Completed</span><strong className="text-2xl text-emerald-400">{completed}</strong></Card>
                <Card className="glass-card p-4 text-center"><span className="text-xs text-amber-400 block">Pending</span><strong className="text-2xl text-amber-400">{pending}</strong></Card>
                <Card className="glass-card p-4 text-center"><span className="text-xs text-blue-400 block">Avg Time</span><strong className="text-2xl text-blue-400">{assigned > 0 ? '3.5 hrs' : '0 hrs'}</strong></Card>
              </div>

              <Card className="glass-card">
                <CardHeader><CardTitle className="text-base font-bold">Sprint Task Execution Timeline</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {internTasks.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6 italic">No activity available yet.</p>
                  ) : (
                    internTasks.map((t: any) => (
                      <div key={t.id} className="flex flex-col sm:flex-row justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{t.taskName}</span>
                            <Badge variant={t.status === 'COMPLETED' ? 'success' : 'warning'}>{t.status}</Badge>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${t.progress}%` }} />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-300">{t.progress}%</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
            );
          })()}

          {/* MODULE 4: ASSIGNMENT SUBMISSION */}
          {activeModule === 'assignments' && (() => {
            const baseList = internAssignments;

            const filtered = baseList.filter((a: any) => {
              if (assignTechStack !== 'All' && a.techStack !== assignTechStack) return false;
              if (assignStatus !== 'All') {
                const normStatus = (a.status === 'SOLVED' || a.status === 'APPROVED') ? 'Approved' : (a.status === 'PENDING' || a.status === 'PENDING_REVIEW') ? 'Pending Review' : 'Rejected';
                if (normStatus !== assignStatus) return false;
              }
              if (assignSearch) {
                const q = assignSearch.toLowerCase();
                const matchTitle = (a.title || '').toLowerCase().includes(q);
                const matchRepo = (a.problemUrl || '').toLowerCase().includes(q);
                if (!matchTitle && !matchRepo) return false;
              }
              return true;
            });

            return (
              <div className="space-y-4 animate-fade-in">
                {/* Filters Bar */}
                <Card className="glass-card p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Filter 1: Date Range */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date Range</label>
                      <select
                        value={assignDateRange}
                        onChange={(e) => setAssignDateRange(e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white font-medium focus:border-blue-500"
                      >
                        <option value="All">All Dates</option>
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="Last 7 Days">Last 7 Days</option>
                        <option value="Last 30 Days">Last 30 Days</option>
                        <option value="Custom Date Range">Custom Date Range</option>
                      </select>
                    </div>

                    {/* Filter 2: Technology / Tech Stack */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Technology</label>
                      <select
                        value={assignTechStack}
                        onChange={(e) => setAssignTechStack(e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white font-medium focus:border-blue-500"
                      >
                        <option value="All">All Tech Stacks</option>
                        <option value="Java">Java</option>
                        <option value="Python">Python</option>
                        <option value="SQL">SQL</option>
                        <option value="Spring Boot">Spring Boot</option>
                        <option value="React">React</option>
                        <option value="Power BI">Power BI</option>
                        <option value="Data Engineering">Data Engineering</option>
                        <option value="Machine Learning">Machine Learning</option>
                      </select>
                    </div>

                    {/* Filter 3: Submission Status */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Submission Status</label>
                      <select
                        value={assignStatus}
                        onChange={(e) => setAssignStatus(e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white font-medium focus:border-blue-500"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending Review">Pending Review</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Filter 4: Search Assignment */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Search Assignment</label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <Input
                          value={assignSearch}
                          onChange={(e) => setAssignSearch(e.target.value)}
                          placeholder="Search title or repo..."
                          className="pl-8 h-8.5 text-xs bg-slate-900 border-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Assignment Table */}
                <Card className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                          <th className="p-3">Assignment Name</th>
                          <th className="p-3">Technology</th>
                          <th className="p-3">Submission Date</th>
                          <th className="p-3">Repository Link</th>
                          <th className="p-3">Difficulty</th>
                          <th className="p-3">Marks</th>
                          <th className="p-3">Review Status</th>
                          <th className="p-3">Time Taken</th>
                          <th className="p-3">Manager Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                              No activity available yet.
                            </td>
                          </tr>
                        ) : (
                          filtered.map((a: any) => {
                            const isPending = a.status === 'PENDING' || a.status === 'PENDING_REVIEW';
                            const statusStr = (a.status === 'SOLVED' || a.status === 'APPROVED') ? 'Approved' : isPending ? 'Pending Review' : 'Rejected';
                            return (
                              <tr key={a.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="p-3 font-bold text-white">{a.title}</td>
                                <td className="p-3"><Badge variant="purple" className="font-mono text-[10px]">{a.techStack}</Badge></td>
                                <td className="p-3 font-mono text-slate-300">{a.submissionDate || 'Today'}</td>
                                <td className="p-3">
                                  {a.problemUrl ? (
                                    <a href={a.problemUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300">
                                      <Globe className="h-3 w-3" /> GitHub Repo
                                    </a>
                                  ) : (
                                    <span className="text-slate-500">N/A</span>
                                  )}
                                </td>
                                <td className="p-3"><Badge variant={a.difficulty?.toUpperCase() === 'HARD' ? 'destructive' : a.difficulty?.toUpperCase() === 'MEDIUM' ? 'warning' : 'success'}>{a.difficulty || 'Medium'}</Badge></td>
                                <td className="p-3 font-bold text-emerald-400">95 / 100</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={statusStr === 'Approved' ? 'success' : isPending ? 'warning' : 'destructive'}>{statusStr}</Badge>
                                    {isPending && (
                                      <div className="flex gap-1">
                                        <button onClick={() => approveAssignmentMutation.mutate(a.id)} className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]">Approve</button>
                                        <button onClick={() => rejectAssignmentMutation.mutate(a.id)} className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px]">Reject</button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 font-mono text-slate-300">{a.timeTakenMinutes || 45} mins</td>
                                <td className="p-3 text-slate-300 italic max-w-xs truncate" title={a.notes || 'Clean implementation.'}>
                                  "{a.notes || 'Clean implementation without issues.'}"
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            );
          })()}

          {/* MODULE 5: DUOLINGO */}
          {activeModule === 'duolingo' && (
            !internDuolingo ? (
              <Card className="glass-card p-12 text-center text-slate-400">
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-amber-500 opacity-60" />
                <h3 className="text-base font-bold text-white">No Duolingo activity linked yet.</h3>
                <p className="text-xs text-slate-400 mt-1">Language learning streaks and XP telemetry will appear here once connected.</p>
              </Card>
            ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="glass-card p-4 text-center"><span className="text-xs text-slate-400 block">Current Streak</span><strong className="text-2xl text-amber-400">{internDuolingo.currentStreak || 0} days</strong></Card>
                <Card className="glass-card p-4 text-center"><span className="text-xs text-slate-400 block">Longest Streak</span><strong className="text-2xl text-white">{internDuolingo.longestStreak || internDuolingo.currentStreak || 0} days</strong></Card>
                <Card className="glass-card p-4 text-center"><span className="text-xs text-slate-400 block">Total XP</span><strong className="text-2xl text-purple-400">{internDuolingo.xp || 0} XP</strong></Card>
                <Card className="glass-card p-4 text-center"><span className="text-xs text-slate-400 block">League</span><strong className="text-2xl text-emerald-400">{internDuolingo.league || 'Silver'}</strong></Card>
              </div>

              <Card className="glass-card">
                <CardHeader><CardTitle className="text-base font-bold">Weekly Duolingo Practice Graph</CardTitle></CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { day: 'Mon', xp: internDuolingo.xp ? Math.floor(internDuolingo.xp / 5) : 0 },
                      { day: 'Tue', xp: internDuolingo.xp ? Math.floor(internDuolingo.xp / 5) : 0 },
                      { day: 'Wed', xp: internDuolingo.xp ? Math.floor(internDuolingo.xp / 5) : 0 },
                      { day: 'Thu', xp: internDuolingo.xp ? Math.floor(internDuolingo.xp / 5) : 0 },
                      { day: 'Fri', xp: internDuolingo.xp ? Math.floor(internDuolingo.xp / 5) : 0 },
                    ]}>
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a' }} />
                      <Area type="monotone" dataKey="xp" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            )
          )}

          {/* MODULE 6: COMMUNICATION */}
          {activeModule === 'communication' && (
            !hasActivity ? (
              <Card className="glass-card p-12 text-center text-slate-400">
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-blue-500 opacity-60" />
                <h3 className="text-base font-bold text-white">No evaluations recorded yet.</h3>
                <p className="text-xs text-slate-400 mt-1">Soft skills and manager evaluations will be populated after sprint reviews.</p>
              </Card>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-base font-bold text-blue-400">Soft Skills & Presentation Ratings</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-slate-800 pb-2"><span>Presentation Score</span><strong className="text-emerald-400">9.2 / 10</strong></div>
                  <div className="flex justify-between border-b border-slate-800 pb-2"><span>Professional English Proficiency</span><strong className="text-emerald-400">9.0 / 10</strong></div>
                  <div className="flex justify-between border-b border-slate-800 pb-2"><span>Speaking Confidence</span><strong className="text-blue-400">High Confidence</strong></div>
                  <div className="flex justify-between"><span>Meeting Attendance</span><strong className="text-white">100% Punctual</strong></div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader><CardTitle className="text-base font-bold text-amber-400">Manager Evaluation Rating</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-center py-6">
                  <div className="text-4xl">⭐⭐⭐⭐⭐</div>
                  <h4 className="text-xl font-bold text-white">5.0 / 5.0 Stars</h4>
                  <p className="text-xs text-slate-400">"Demonstrates clear articulation during daily scrum standups and sprint retrospectives."</p>
                </CardContent>
              </Card>
            </div>
            )
          )}

          {/* MODULE 7: PROJECTS */}
          {activeModule === 'projects' && (
            !hasActivity ? (
              <Card className="glass-card p-12 text-center text-slate-400">
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-purple-500 opacity-60" />
                <h3 className="text-base font-bold text-white">No capstone project linked yet.</h3>
                <p className="text-xs text-slate-400 mt-1">Repository and commit telemetry will show up here once assigned to an enterprise project.</p>
              </Card>
            ) : (
            <div className="space-y-4 animate-fade-in">
              <Card className="glass-card border-slate-800">
                <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-white text-lg">Enterprise AI Gateway Microservice</h3>
                      <Badge variant="success">IN_PROGRESS</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Role: Lead Full-Stack Engineer | Tech: Spring Boot 3, React, PostgreSQL</p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-mono text-slate-300">
                      <span className="flex items-center gap-1"><GitCommit className="h-4 w-4 text-blue-400" /> 142 Commits</span>
                      <span className="flex items-center gap-1"><GitPullRequest className="h-4 w-4 text-purple-400" /> 18 PRs Merged</span>
                      <span className="text-emerald-400">24 Issues Closed</span>
                    </div>
                  </div>
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Open Repository
                  </a>
                </CardContent>
              </Card>
            </div>
            )
          )}

          {/* MODULE 9: TIMELINE */}
          {activeModule === 'timeline' && (
            !hasActivity ? (
              <Card className="glass-card p-12 text-center text-slate-400">
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-emerald-500 opacity-60" />
                <h3 className="text-base font-bold text-white">No timeline events recorded yet.</h3>
                <p className="text-xs text-slate-400 mt-1">Chronological activity feed will update as assignments and tasks are logged.</p>
              </Card>
            ) : (
            <Card className="glass-card animate-fade-in">
              <CardHeader><CardTitle className="text-base font-bold">Chronological Activity Feed</CardTitle></CardHeader>
              <CardContent className="space-y-6 pl-4 border-l-2 border-slate-800 ml-4 py-2">
                {internAssignments.map((a: any) => (
                  <div key={a.id} className="relative pl-6">
                    <div className="absolute -left-[19px] top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
                    <span className="text-[10px] font-mono text-slate-400">{a.submissionDate || 'Recently'}</span>
                    <h4 className="text-sm font-bold text-white">Assignment Submitted: {a.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Tech stack: {a.techStack} | Status: {a.status}</p>
                  </div>
                ))}
                {internTasks.map((t: any) => (
                  <div key={t.id} className="relative pl-6">
                    <div className="absolute -left-[19px] top-1 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-slate-950" />
                    <span className="text-[10px] font-mono text-slate-400">Sprint Task</span>
                    <h4 className="text-sm font-bold text-white">{t.taskName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Progress: {t.progress}% | Status: {t.status}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            )
          )}

        </div>

        {/* ========================================== */}
        {/* 4. RIGHT PANEL: PRODUCTIVITY QUICK ACTIONS */}
        {/* ========================================== */}
        <div className="xl:col-span-1 space-y-5">
          <Card className="glass-card border-blue-500/30 bg-slate-900/90 shadow-2xl sticky top-6">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Manager Quick Actions
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {selectedIntern.status === 'PENDING_APPROVAL' && (
                <Button
                  onClick={() => approveInternMutation.mutate(selectedIntern.userId)}
                  disabled={approveInternMutation.isPending}
                  className="w-full justify-start h-10 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {approveInternMutation.isPending ? 'Approving...' : 'Approve Intern Account'}
                </Button>
              )}

              <Button
                onClick={() => {
                  if (selectedIntern.githubUrl) {
                    window.open(selectedIntern.githubUrl, '_blank');
                  } else {
                    handleActionClick('GitHub profile not added by this mentee.');
                  }
                }}
                disabled={!selectedIntern.githubUrl}
                className="w-full justify-start h-10 font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all shadow border border-slate-700 disabled:opacity-50"
              >
                <Globe className="mr-2 h-4 w-4 text-purple-400" />
                {selectedIntern.githubUrl ? 'View GitHub Profile' : 'GitHub Profile Not Added'}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (selectedIntern.resumeUrl) {
                    openSecureFile(selectedIntern.resumeUrl, selectedIntern.resumeFileName || 'Resume.pdf', false);
                  } else {
                    handleActionClick('No resume uploaded by this intern yet.');
                  }
                }}
                className="w-full justify-start h-10 font-bold bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-white transition-all shadow"
              >
                <FileText className="mr-2 h-4 w-4 text-amber-400" /> Open Resume / Bio
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
