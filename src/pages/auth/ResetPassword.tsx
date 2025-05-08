import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { LockKeyhole, ArrowLeft } from 'lucide-react';

interface ResetFormValues {
  password: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetFormValues>();
  const password = watch('password');

  // Get access token from URL hash or location state
  useEffect(() => {
    const setupSession = async () => {
      try {
        // First check URL hash for access token
        const hash = window.location.hash;
        let accessToken = '';

        if (hash && hash.includes('type=recovery')) {
          accessToken = hash.split('access_token=')[1]?.split('&')[0];
          // Clean up URL
          window.history.replaceState(null, '', window.location.pathname);
        }

        // If no token in hash, check location state
        if (!accessToken && location.state?.accessToken) {
          accessToken = location.state.accessToken;
        }

        if (!accessToken) {
          setResetError('Invalid reset link. Please request a new password reset.');
          return;
        }

        // Set up the session with the access token
        const { data: { session }, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '',
        });

        if (error || !session) {
          throw new Error('Failed to validate reset link');
        }

      } catch (error: any) {
        console.error('Failed to set up session:', error);
        setResetError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    setupSession();
  }, [supabase.auth, location.state]);

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setResetError(null);
    
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;
      
      // Sign out to clear the recovery session
      await supabase.auth.signOut();
      
      // Redirect to login with success message
      navigate('/login', {
        state: { message: 'Password has been reset successfully. Please sign in with your new password.' }
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      setResetError(error.message || 'Failed to reset password. Please try again.');
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
              Set New Password
            </h1>
            <p className="text-gray-600">Create a new password for your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {resetError && (
              <div className="p-4 rounded-lg bg-error-50 border border-error-200 animate-slide-down">
                <p className="text-sm text-error-700">{resetError}</p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  className="pl-10 w-full h-12 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'New password is required',
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
                Confirm New Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#1A1A40] text-white transition-all duration-300 hover:from-[#9333EA] hover:to-[#A855F7] shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
            >
              Reset password
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Background */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#1A1A40] to-[#9b87f5] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7567473/pexels-photo-7567473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A40] to-transparent opacity-90"></div>
        <div className="relative h-full flex items-center justify-center text-white p-16">
          <div className="max-w-xl text-center">
            <h2 className="text-4xl font-bold mb-6">Reset with Confidence</h2>
            <p className="text-lg text-gray-200">
              Your financial journey is important to us. Let's get you back on track with a secure password reset.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}