import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const AdminAttendancePage: React.FC = () => {
  const { data: attendanceList = [], isLoading } = useQuery({
    queryKey: ['adminAttendance'],
    queryFn: async () => {
      const res = await api.get('/admin/attendance');
      return res.data.data;
    },
    refetchInterval: 10000,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="success">PRESENT</Badge>;
      case 'HALF_DAY':
        return <Badge variant="warning">HALF DAY</Badge>;
      case 'ABSENT':
        return <Badge variant="destructive">ABSENT</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <CalendarCheck className="h-6 w-6 text-emerald-500" /> Batch Attendance Roster
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor real-time intern check-in and check-out logs across the entire batch.
        </p>
      </div>

      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-4">Intern Name & Email</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check-in Time</th>
                <th className="px-6 py-4">Check-out Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Loading attendance telemetry...
                  </td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No attendance logs recorded yet.
                  </td>
                </tr>
              ) : (
                attendanceList.map((record: any) => (
                  <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{record.internName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{record.internEmail}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">{record.attendanceDate}</td>
                    <td className="px-6 py-4 font-mono text-emerald-400">
                      {record.loginTime ? new Date(record.loginTime).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-6 py-4 font-mono text-amber-400">
                      {record.logoutTime ? new Date(record.logoutTime).toLocaleTimeString() : 'In Progress'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(record.status)}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 italic">
                      {record.remarks || 'None'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
