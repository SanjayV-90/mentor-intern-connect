import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Bell, Shield, User as UserIcon, Check, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifs(false);
      }
    };
    if (showNotifs) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifs]);

  const { data: notifications = [], isLoading: notifsLoading, isError: notifsError } = useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data || [];
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const avatarUrl = user?.profilePictureUrl;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/20">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white">
            InternManagement<span className="text-blue-500">.AI</span>
          </span>
          <p className="text-[11px] font-medium tracking-wide text-slate-400">
            ENTERPRISE LEARNING PORTAL
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <Badge variant={user.role === 'ADMIN' ? 'purple' : 'default'} className="px-3 py-1">
            {user.role === 'ADMIN' ? 'BATCH MANAGER' : 'INTERN ENGINEER'}
          </Badge>
        )}

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 p-3.5 bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {user?.role === 'ADMIN' ? 'Mentor Notifications' : 'Intern Notifications'}
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-500/20 text-blue-400 px-2 py-0.5 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifsLoading ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Loading notifications...
                  </div>
                ) : notifsError ? (
                  <div className="p-6 text-center text-xs text-rose-400">
                    Failed to load notifications. Please try again.
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.read) markReadMutation.mutate(n.id);
                      }}
                      className={`p-3.5 transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                        !n.read ? 'bg-blue-500/10 hover:bg-blue-500/15' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{n.title}</span>
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {!n.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markReadMutation.mutate(n.id);
                          }}
                          title="Mark as read"
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-800" />

        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-200 overflow-hidden shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-5 w-5" />
            )}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-none text-white">
              {user?.fullName || 'User'}
            </p>
            <p className="mt-1 text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
