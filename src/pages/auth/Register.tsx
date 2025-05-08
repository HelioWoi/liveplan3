import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { Mail, LockKeyhole, User, ArrowRight } from 'lucide-react';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export default function Register() {
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormValues>();
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setRegistrationError(null);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      
      if (error) throw error;
      
      // Show success message and redirect to login
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please check your email to confirm your account.' 
        } 
      });
    } catch (error: any) {
      setRegistrationError(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Esquerda: Mensagem inspiracional */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#A855F7] via-[#9333EA] to-[#1A1A40] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7567473/pexels-photo-7567473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A40] to-transparent opacity-90"></div>
        <div className="relative h-full flex items-center justify-center text-white p-16">
          <div className="max-w-xl text-center">
            <h2 className="text-4xl font-bold mb-6">From Small Beginnings Come Great Achievements</h2>
            <p className="text-lg text-gray-200">
              Thousands are building their future one step at a time with LivePlan³ — join them!
            </p>
          </div>
        </div>
      </div>

      {/* Direita: Formulário de cadastro */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-16 animate-fade-in">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-[#7C3AED]">Create <span className="text-[#1A1A40]">Account</span></h1>
            <p className="text-gray-600">Join LivePlan³ and start planning your future</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {registrationError && (
              <div className="p-4 rounded-lg bg-error-50 border border-error-200 animate-slide-down">
                <p className="text-sm text-error-700">{registrationError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="fullName"
                    type="text"
                    className="pl-10 w-full h-12 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="John Doe"
                    {...register('fullName', { required: 'Full name is required' })}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-error-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    className="pl-10 w-full h-12 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="you@example.com"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    className="pl-10 w-full h-12 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="••••••••"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    className="pl-10 w-full h-12 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="••••••••"
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#1A1A40] text-white transition-all duration-300 hover:from-[#9333EA] hover:to-[#A855F7] shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
            >
              Create account
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}