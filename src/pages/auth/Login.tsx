import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { Mail, LockKeyhole, ArrowRight } from 'lucide-react';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function Login() {
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>();
  
  const from = (location.state as any)?.from?.pathname || '/';
  const message = (location.state as any)?.message;
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      
      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('The email or password you entered is incorrect. Please check your credentials and try again.');
        }
        throw error;
      }
      
      if (authData.session) {
        // Criar ou atualizar o perfil do usuário
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: authData.user.id,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        // Verificar se o usuário já completou o onboarding
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('user_id', authData.user.id)
          .single();

        // Se o onboarding não foi completado, redirecionar para /onboarding
        if (!profile?.onboarding_completed) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-16 animate-fade-in">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#1A1A40] to-[#9b87f5] bg-clip-text text-transparent">
              LivePlan³
            </h1>
            <p className="text-gray-600">Welcome back to your financial journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {message && (
              <div className="p-4 rounded-lg bg-success-50 border border-success-200 animate-slide-down">
                <p className="text-sm text-success-700">{message}</p>
              </div>
            )}

            {loginError && (
              <div className="p-4 rounded-lg bg-error-50 border border-error-200 animate-slide-down">
                <p className="text-sm text-error-700">{loginError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
                  <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    className="pl-10 w-full h-12 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="relative w-full h-12 bg-[#1A1A40] text-white rounded-lg font-medium hover:bg-[#2A2A50] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 overflow-hidden group"
              disabled={isLoading}
            >
              <span className="absolute inset-0 w-0 bg-[#9b87f5] transition-all duration-500 ease-out group-hover:w-full"></span>
              <span className="relative flex items-center justify-center">
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign in
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </span>
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Create one now
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Background */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#1A1A40] to-[#9b87f5] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A40] to-transparent opacity-90"></div>
        <div className="relative h-full flex items-center justify-center text-white p-16">
          <div className="max-w-xl text-center">
            <h2 className="text-4xl font-bold mb-6">Take the first step toward financial organization.</h2>
            <p className="text-lg text-gray-200">
              With LivePlan³, your financial journey starts with small, consistent actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
