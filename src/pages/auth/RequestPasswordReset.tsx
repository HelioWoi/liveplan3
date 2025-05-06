import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { Mail } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[400px] w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-[#1A1A40]">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your email and we'll send you instructions to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded text-white bg-[#1A1A40] hover:bg-[#2A2A50]"
                >
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {resetError && (
                <div className="text-red-500 text-sm text-center">{resetError}</div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm text-gray-500">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="mt-1 appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-[#1A1A40] focus:border-[#1A1A40]"
                  placeholder="you@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    }
                  })}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 border border-transparent text-sm font-medium rounded bg-[#1A1A40] text-white hover:bg-[#2A2A50] disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-[#1A1A40] hover:text-[#2A2A50]"
                >
                  ← Back to login
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}