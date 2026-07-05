import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  gender: z.string().min(1, 'Please select gender'),
  dob: z.string().min(10, 'Date of birth is required'),
  phone: z.string().min(7, 'Contact phone number is required'),
  address: z.string().min(5, 'Residential address is required'),
  college: z.string().min(2, 'College / University name is required'),
  degree: z.string().min(2, 'Degree program is required'),
  department: z.string().min(2, 'Department is required'),
  techStack: z.string().min(2, 'List current tech stack skills'),
  primarySkill: z.string().min(1, 'Primary programming skill is required'),
  secondarySkill: z.string().optional(),
  githubUrl: z.string().url('Must be a valid URL starting with http/https').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Must be a valid URL starting with http/https').optional().or(z.literal('')),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: 'Other',
      techStack: 'Java, Spring Boot, React, TypeScript',
      primarySkill: 'Java',
      secondarySkill: 'React',
      college: 'Stanford University',
      degree: 'B.S. Computer Science',
      department: 'Software Engineering',
    },
  });

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof RegisterForm)[] = [];
    if (step === 1) {
      fieldsToValidate = ['email', 'password', 'fullName', 'phone', 'dob', 'gender'];
    } else if (step === 2) {
      fieldsToValidate = ['college', 'degree', 'department', 'techStack', 'primarySkill'];
    }
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep((prev) => prev + 1);
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/auth/register', data);
      setSuccessMsg(
        'Your registration request has been submitted successfully! Your account status is currently PENDING APPROVAL by the Batch Manager. You will be able to log in once approved.'
      );
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 animate-fade-in my-8">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/25 mb-2">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Intern Registration Portal
          </h1>
          <p className="text-sm text-slate-400">
            Submit your profile for batch onboarding and verification
          </p>
        </div>

        <Card className="border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Step {step} of 3
              </span>
              <div className="flex space-x-1.5">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 w-8 rounded-full transition-all ${
                      s === step
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        : s < step
                        ? 'bg-emerald-500'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
            <CardTitle className="text-lg font-bold">
              {step === 1 && 'Personal Credentials & Account Setup'}
              {step === 2 && 'Academic Background & Core Tech Stack'}
              {step === 3 && 'Developer Profiles & Submission'}
            </CardTitle>
            <CardDescription>
              All fields are stored securely in 3NF normalized PostgreSQL tables
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMsg && (
              <div className="mb-4 flex items-center space-x-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center animate-fade-in">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Application Received!</h3>
                <p className="text-sm text-emerald-200/90 leading-relaxed mb-6">
                  {successMsg}
                </p>
                <Button onClick={() => navigate('/login')} className="w-full max-w-xs font-bold">
                  Return to Sign In Page
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name
                      </label>
                      <Input {...register('fullName')} placeholder="Alex Rivera" />
                      {errors.fullName && (
                        <p className="mt-1 text-xs text-rose-400">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <Input {...register('email')} placeholder="alex@gmail.com" />
                      {errors.email && (
                        <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Password
                      </label>
                      <Input type="password" {...register('password')} placeholder="••••••••" />
                      {errors.password && (
                        <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Phone Number
                      </label>
                      <Input {...register('phone')} placeholder="+1-555-0192" />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-rose-400">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Date of Birth
                      </label>
                      <Input type="date" {...register('dob')} />
                      {errors.dob && (
                        <p className="mt-1 text-xs text-rose-400">{errors.dob.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Gender
                      </label>
                      <select
                        {...register('gender')}
                        className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other / Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        College / University Name
                      </label>
                      <Input {...register('college')} placeholder="Stanford University" />
                      {errors.college && (
                        <p className="mt-1 text-xs text-rose-400">{errors.college.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Degree Pursuing
                      </label>
                      <Input {...register('degree')} placeholder="B.S. Computer Science" />
                      {errors.degree && (
                        <p className="mt-1 text-xs text-rose-400">{errors.degree.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Department / Specialization
                      </label>
                      <Input {...register('department')} placeholder="Software Engineering" />
                      {errors.department && (
                        <p className="mt-1 text-xs text-rose-400">{errors.department.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Current Tech Stack (comma separated)
                      </label>
                      <Input
                        {...register('techStack')}
                        placeholder="Java, Spring Boot, React, TypeScript, SQL"
                      />
                      {errors.techStack && (
                        <p className="mt-1 text-xs text-rose-400">{errors.techStack.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Primary Programming Skill
                      </label>
                      <Input {...register('primarySkill')} placeholder="Java" />
                      {errors.primarySkill && (
                        <p className="mt-1 text-xs text-rose-400">{errors.primarySkill.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Secondary Skill (Optional)
                      </label>
                      <Input {...register('secondarySkill')} placeholder="React" />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Residential Address
                      </label>
                      <Input {...register('address')} placeholder="123 Tech Avenue, Silicon Valley, CA" />
                      {errors.address && (
                        <p className="mt-1 text-xs text-rose-400">{errors.address.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        GitHub Profile URL
                      </label>
                      <Input {...register('githubUrl')} placeholder="https://github.com/username" />
                      {errors.githubUrl && (
                        <p className="mt-1 text-xs text-rose-400">{errors.githubUrl.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        LinkedIn Profile URL
                      </label>
                      <Input {...register('linkedinUrl')} placeholder="https://linkedin.com/in/username" />
                      {errors.linkedinUrl && (
                        <p className="mt-1 text-xs text-rose-400">{errors.linkedinUrl.message}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-800 mt-6">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep((prev) => prev - 1)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                  ) : (
                    <Link to="/login">
                      <Button type="button" variant="ghost">
                        Cancel
                      </Button>
                    </Link>
                  )}

                  {step < 3 ? (
                    <Button type="button" onClick={handleNextStep}>
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="px-6 font-bold">
                      {loading ? 'Submitting Application...' : 'Submit Onboarding Application'}
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
