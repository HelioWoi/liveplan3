import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';

interface EmailVerificationRouteProps {
  children: React.ReactNode;
}

export default function EmailVerificationRoute({ children }: EmailVerificationRouteProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const location = useLocation();
  const { supabase } = useSupabase();

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      
      if (currentUser) {
        setUser(currentUser);
        setEmailConfirmed(currentUser.email_confirmed_at !== null);
      }
      
      setLoading(false);
    };

    checkEmailConfirmation();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user;
      if (currentUser) {
        setUser(currentUser);
        setEmailConfirmed(currentUser.email_confirmed_at !== null);
      } else {
        setUser(null);
        setEmailConfirmed(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!emailConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verifique seu e-mail
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Por favor, verifique seu e-mail para continuar. Se você já confirmou, faça logout e login novamente.
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => supabase.auth.signOut()}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Fazer Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
