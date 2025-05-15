import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { ArrowRight } from 'lucide-react';
import CubeLogoLivePlan from '../../components/brand/CubeLogoLivePlan';

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
  
  // Verificar se o usuário está retornando após confirmar o email
  const searchParams = new URLSearchParams(location.search);
  const verified = searchParams.get('verified') === 'true';
  
  // Mensagem de estado (por exemplo, redirecionamento)
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
        // Verificar se o email foi confirmado
        if (!authData.user.email_confirmed_at) {
          await supabase.auth.signOut();
          throw new Error('Please verify your email before logging in. Check your inbox for the confirmation link.');
        }

        // ✅ Redireciona para a página de escolha de onboarding
        navigate('/onboarding-choice');
      }
    } catch (error: any) {
      setLoginError(error.message);
      // Importar o serviço de toast para mostrar notificação de erro de login
      const { showErrorToast, ToastEvent } = await import('../../utils/toastService');
      showErrorToast(ToastEvent.LOGIN_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Esquerda: Formulário de login */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white px-4 py-8">
        <div className="max-w-[400px] w-full mx-auto">
          <CubeLogoLivePlan className="mb-6 text-center mx-auto" size="massive" withSlogan={true} />
          <p className="text-gray-500 text-center mb-6">Welcome back to your financial journey</p>
          {verified && (
            <div className="mb-4 text-green-600 text-sm text-center">
              Email verified successfully! You can now log in to access your account.
            </div>
          )}
          {message && (
            <div className="mb-4 text-green-600 text-sm text-center">{message}</div>
          )}
          {loginError && (
            <div className="mb-4 text-red-600 text-sm text-center">{loginError}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-600 mb-1">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#1A1A40] focus:border-[#1A1A40]"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2 rounded border-gray-300" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-[#1A1A40] hover:text-[#2A2A50] font-medium">Forgot password?</Link>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#1A1A40] text-white transition-all duration-300 hover:from-[#9333EA] hover:to-[#A855F7] shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
            >
              Sign in
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          <div className="mt-8 text-center">
            <span className="text-sm text-gray-500">Don't have an account? </span>
            <Link to="/signup" className="text-[#1A1A40] hover:text-[#2A2A50] text-sm font-semibold underline underline-offset-2">Create one now</Link>
          </div>
        </div>
      </div>
      {/* Direita: Mensagem inspiracional */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1A1A40] to-[#9b87f5] items-center justify-center">
        <div className="px-10">
          <h2 className="text-white text-2xl font-bold mb-4 text-center">Take the first step toward financial organization.</h2>
          <p className="text-white text-center text-sm opacity-90">With LivePlan<sup className='text-xs align-super'>3</sup>, your financial journey starts with small, consistent actions.</p>
        </div>
      </div>
    </div>
  );
}