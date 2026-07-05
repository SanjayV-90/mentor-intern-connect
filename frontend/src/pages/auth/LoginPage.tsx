import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginSession } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@portal.com',
      password: 'Admin@12345',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.post('/auth/login', data);
      const authData = response.data.data;
      loginSession(authData);
      if (authData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/intern/profile');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true, shouldDirty: true });
    setValue('password', 'Admin@12345', { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Glow background effects */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-xl shadow-blue-500/25 mb-3">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            InternManagement<span className="text-blue-500">.AI</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Internal Learning & Batch Portal
          </p>
        </div>

        <Card className="border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your dashboard workspace</CardDescription>
          </CardHeader>

          <CardContent>
            {errorMsg && (
              <div className="mb-4 flex items-center space-x-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    {...register('email')}
                    placeholder="name@company.com"
                    className="pl-9"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className="pl-9"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 border-t border-slate-800 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center mb-3">
                Quick Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fillDemo('admin@portal.com');
                  }}
                  className="flex flex-col items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 p-2.5 text-xs text-purple-300 hover:bg-purple-500/20 transition-all"
                >
                  <span className="font-bold">Batch Manager</span>
                  <span className="text-[10px] text-purple-400">admin@portal.com</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fillDemo('alex.intern@gmail.com');
                  }}
                  className="flex flex-col items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-blue-300 hover:bg-blue-500/20 transition-all"
                >
                  <span className="font-bold">Active Intern</span>
                  <span className="text-[10px] text-blue-400">alex.intern@gmail.com</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-400">
              New intern joining the batch?{' '}
              <Link to="/register" className="font-semibold text-blue-400 hover:underline">
                Submit Registration Application
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
