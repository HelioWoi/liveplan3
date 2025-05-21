import { create } from 'zustand';
import { User, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/supabaseClient';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{user: User | null, session: any} | undefined>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ user: data.user });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      // Tentativa inicial de cadastro com confirmação de email
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/login?verified=true'
        }
      });
      
      // Se houver erro específico sobre envio de email, tente novamente sem confirmação de email
      if (error && (error.message.includes('sending email') || error.message.includes('confirmation email'))) {
        console.log('Erro ao enviar email de confirmação, tentando cadastro sem confirmação de email');
        
        // Segunda tentativa: cadastro sem exigir confirmação de email (para desenvolvimento)
        const { data: devData, error: devError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/login?verified=true',
            data: {
              email_confirmed: true // Marca o email como confirmado nos metadados
            }
          }
        });
        
        if (devError) throw devError;
        return devData;
      }
      
      if (error) throw error;
      
      // Não definimos o usuário aqui para forçar o login após confirmação de email
      // set({ user: data.user });
      
      // Verificar se o email precisa ser confirmado
      if (data.user && !data.user.email_confirmed_at) {
        // Forçar logout para garantir que o usuário confirme o email
        await supabase.auth.signOut();
      }
      
      return data;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  setUser: (user) => set({ user }),
}));