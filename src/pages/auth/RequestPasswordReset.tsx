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
      
      console.log('Reset password email sent to:', data.email, 'with redirect to:', `${window.location.origin}/reset-password`);
      
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
      {/* Esquerda: Formulário de reset */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white px-4 py-8">
        <div className="max-w-[400px] w-full mx-auto">
          <h2 className="text-3xl font-bold text-[#1A1A40] mb-2 text-center">Reset <span className="text-[#A855F7]">Password</span></h2>
          <p className="text-gray-500 text-center mb-6">Enter your email and we'll send you instructions to reset your password</p>
          {resetSuccess ? (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Check your email</h3>
              <p className="mt-2 text-sm text-gray-600">
                We've sent you an email with instructions to reset your password. Please check your inbox.
              </p>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-[#1A1A40] hover:text-[#2A2A50] text-sm font-medium">&lt; Back to login</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {resetError && (
                <div className="mb-2 text-red-600 text-sm text-center">{resetError}</div>
              )}
              <div>
                <label htmlFor="email" className="block text-gray-600 mb-1">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#1A1A40] focus:border-[#1A1A40]"
                  placeholder="you@example.com"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors && errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-[#1A1A40] text-white rounded-lg font-semibold hover:bg-[#2A2A50] transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
              <div className="mt-6 text-center">
                <Link to="/login" className="text-[#1A1A40] hover:text-[#2A2A50] text-sm font-medium">&lt; Back to login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
      {/* Direita: Mensagem inspiracional */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1A1A40] to-[#9b87f5] items-center justify-center">
        <div className="px-10">
          <h2 className="text-white text-2xl font-bold mb-4 text-center">Forgot Your Password?</h2>
          <p className="text-white text-center text-sm opacity-90">Don't worry! It happens to the best of us. Let's get you back into your account.</p>
        </div>
      </div>
    </div>
  );
}