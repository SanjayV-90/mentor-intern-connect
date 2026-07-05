import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Code2, Plus, ExternalLink, Clock, UploadCloud, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

export const InternAssignmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    platform: 'LEETCODE',
    problemUrl: '',
    techStack: 'JAVA',
    difficulty: 'MEDIUM',
    timeTakenMinutes: 45,
    notes: '',
  });

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['myAssignments'],
    queryFn: async () => {
      const res = await api.get('/intern/assignments');
      return res.data.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(form)], { type: 'application/json' }));
      if (file) {
        formData.append('screenshot', file);
      }
      if (editingId) {
        const res = await api.put(`/intern/assignments/${editingId}`, formData);
        return res.data;
      } else {
        const res = await api.post('/intern/assignments', formData);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['adminInternAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['adminWorkspaceInterns'] });
      queryClient.invalidateQueries({ queryKey: ['myAttendanceSummary'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      setIsModalOpen(false);
      setFile(null);
      setEditingId(null);
      setForm({
        title: '',
        platform: 'LEETCODE',
        problemUrl: '',
        techStack: 'JAVA',
        difficulty: 'MEDIUM',
        timeTakenMinutes: 45,
        notes: '',
      });
      setSuccessMsg('Coding problem logged successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Unable to save submission. Please try again.';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/intern/assignments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const handleEdit = (sub: any) => {
    setEditingId(sub.id);
    setForm({
      title: sub.title || '',
      platform: sub.platform || 'LEETCODE',
      problemUrl: sub.problemUrl || '',
      techStack: sub.techStack || 'JAVA',
      difficulty: sub.difficulty || 'MEDIUM',
      timeTakenMinutes: sub.timeTakenMinutes || 30,
      notes: sub.notes || '',
    });
    setFile(null);
    setIsModalOpen(true);
  };

  const openNewSubmissionModal = () => {
    setEditingId(null);
    setForm({
      title: '',
      platform: 'LEETCODE',
      problemUrl: '',
      techStack: 'JAVA',
      difficulty: 'MEDIUM',
      timeTakenMinutes: 45,
      notes: '',
    });
    setFile(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Code2 className="h-6 w-6 text-purple-500" /> Coding Assignment Submissions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Log your daily algorithm solutions and upload screenshot proof of acceptance.
          </p>
        </div>
        <Button onClick={openNewSubmissionModal} className="font-bold shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> Submit Problem Solution
        </Button>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Submission Table */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4">Problem Title & Link</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Time Taken</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Loading your submissions...</td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No problem submissions logged yet. Click "Submit Problem Solution" above!
                  </td>
                </tr>
              ) : (
                assignments.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{sub.title}</div>
                      <a
                        href={sub.problemUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-blue-400 hover:underline mt-0.5"
                      >
                        Open Problem <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4 font-bold uppercase text-purple-400">{sub.platform}</td>
                    <td className="px-6 py-4 text-slate-300">{sub.techStack}</td>
                    <td className="px-6 py-4">
                      <Badge variant={sub.difficulty === 'EASY' ? 'success' : sub.difficulty === 'MEDIUM' ? 'warning' : 'destructive'}>
                        {sub.difficulty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" /> {sub.timeTakenMinutes} mins
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">{sub.notes || '—'}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(sub)}
                      >
                        <Edit2 className="h-3.5 w-3.5 text-blue-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(sub.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Submission Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Problem Submission" : "Log Completed Coding Problem"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMutation.mutate();
          }}
          className="space-y-4 text-sm"
        >
          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              <span className="font-bold">Error:</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Problem Title</label>
            <Input
              required
              placeholder="e.g. Two Sum / LRU Cache"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                <option value="LEETCODE">LeetCode</option>
                <option value="HACKERRANK">HackerRank</option>
                <option value="GEEKSFORGEEKS">GeeksForGeeks</option>
                <option value="CODEFORCES">Codeforces</option>
                <option value="CODECHEF">CodeChef</option>
                <option value="CUSTOM">Custom / Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tech Stack / Language</label>
              <select
                value={form.techStack}
                onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                <option value="JAVA">Java</option>
                <option value="PYTHON">Python</option>
                <option value="SQL">SQL</option>
                <option value="DATA_ENGINEERING">Data Engineering</option>
                <option value="SPARK">Spark</option>
                <option value="SPRING_BOOT">Spring Boot</option>
                <option value="DSA">DSA</option>
                <option value="REACT">React</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time Taken (Minutes)</label>
              <Input
                type="number"
                value={form.timeTakenMinutes}
                onChange={(e) => setForm({ ...form, timeTakenMinutes: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Problem URL</label>
            <Input
              required
              type="url"
              placeholder="https://leetcode.com/problems/..."
              value={form.problemUrl}
              onChange={(e) => setForm({ ...form, problemUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Solution Notes / Approach</label>
            <Input
              placeholder="Brief summary of algorithm complexity..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Screenshot Evidence (Optional)</label>
            <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-4 cursor-pointer hover:border-blue-500/50 transition-colors">
              <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
              <span className="text-xs text-slate-300">
                {file ? file.name : 'Click to attach accepted solution screenshot'}
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitMutation.isPending} className="font-bold">
              {submitMutation.isPending ? 'Submitting...' : editingId ? 'Update Submission' : 'Log Submission'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
