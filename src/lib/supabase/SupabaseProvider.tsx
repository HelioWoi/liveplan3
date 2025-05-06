import { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuthStore } from '../../stores/authStore';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation of Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase URL or Anonymous Key is missing!');
  console.error('Please connect to Supabase using the "Connect to Supabase" button in the top right corner.');
} else if (supabaseUrl === 'https://example.supabase.co' || supabaseAnonKey === 'dummy-key') {
  console.error('⚠️ Supabase URL or Anonymous Key is using default values!');
  console.error('Please connect to Supabase using the "Connect to Supabase" button in the top right corner.');
}

type SupabaseContextType = {
  supabase: SupabaseClient;
  isInitialized: boolean;
  connectionError: string | null;
  session: any | null;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [supabase] = useState(() => createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }));
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { setUser } = useAuthStore();

  // Check initial auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user);
      setUser(currentSession?.user || null);
      setSession(currentSession);
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing session');
        setSession(null);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setUser(initialSession?.user || null);
      setSession(initialSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, setUser]);

  useEffect(() => {
    let isMounted = true;
    const retryDelay = 2000; // 2 seconds between retries
    const maxRetries = 3;

    const checkConnection = async () => {
      if (!isMounted) return;

      try {
        setConnectionError(null);

        // Simple health check query
        const { error } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST204') {
            // No data found is not an error
            console.log('Supabase connection successful (no data found)');
            setIsInitialized(true);
            setRetryCount(0);
            return;
          }

          throw error;
        }

        console.log('Supabase connection successful');
        setIsInitialized(true);
        setRetryCount(0);

      } catch (err) {
        const error = err as Error;
        console.error('Supabase connection error:', error);

        // Set a user-friendly error message
        const errorMessage = error.message.includes('fetch')
          ? 'Unable to connect to Supabase. Please check your internet connection.'
          : `Database error: ${error.message}`;

        if (isMounted) {
          setConnectionError(errorMessage);

          if (retryCount < maxRetries) {
            console.log(`Retrying connection (attempt ${retryCount + 1} of ${maxRetries})...`);
            setRetryCount(prev => prev + 1);
            setTimeout(checkConnection, retryDelay * (retryCount + 1)); // Exponential backoff
          } else {
            console.error('Max retry attempts reached');
            setIsInitialized(true); // Set to true so the app doesn't hang
          }
        }
      }
    };

    // Initial connection check
    checkConnection();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [supabase, retryCount]);

  const value = {
    supabase,
    isInitialized,
    connectionError,
    session
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}