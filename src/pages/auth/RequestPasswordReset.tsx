import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { Mail, ArrowLeft } from 'lucide-react';

interface RequestResetFormValues {
  email: string;
}

export default function RequestPasswordReset() {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RequestResetFormValues>();
  
  const onSubmit = async (data: RequestResetFormValues) => {
    setIsLoading(true);
    setResetError(null);
    setResetSuccess(false);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetSuccess(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setResetError(error.message || 'Failed to send reset email. Please try again.');
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
              Reset Password
            </h1>
            <p className="text-gray-600">
              Enter your email and we'll send you instructions to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {resetSuccess ? (
              <div className="text-center">
                <div className="rounded-full bg-success-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-success-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Check your email</h3>
                <p className="mt-2 text-sm text-gray-600">
                  We've sent you an email with instructions to reset your password. Please check your inbox.
                </p>
                <div className="mt-6">
                  <Link
                    to="/login"
                    className="btn btn-primary w-full py-3"
                  >
                    Return to login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {resetError && (
                  <div className="p-4 rounded-lg bg-error-50 border border-error-200 animate-slide-down">
                    <p className="text-sm text-error-700">{resetError}</p>
                  </div>
                )}
                
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
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Instructions'
                    )}
                  </span>
                </button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Right side - Background */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#1A1A40] to-[#9b87f5] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7567473/pexels-photo-7567473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A40] to-transparent opacity-90"></div>
        <div className="relative h-full flex items-center justify-center text-white p-16">
          <div className="max-w-xl text-center">
            <h2 className="text-4xl font-bold mb-6">Forgot Your Password?</h2>
            <p className="text-lg text-gray-200">
              Don't worry! It happens to the best of us. Let's get you back into your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}