import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface OnboardingState {
  isOnboardingCompleted: boolean;
  loading: boolean;
  error: string | null;
  setOnboardingCompleted: (completed: boolean) => void;
  checkOnboardingStatus: (userId: string) => Promise<boolean>;
  completeOnboarding: (userId: string | undefined) => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isOnboardingCompleted: false,
  loading: false,
  error: null,
  setOnboardingCompleted: (completed) => set({ isOnboardingCompleted: completed }),
  checkOnboardingStatus: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const isCompleted = data?.onboarding_completed ?? false;
      set({ isOnboardingCompleted: isCompleted });
      return isCompleted;
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error checking onboarding status:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  completeOnboarding: async (userId) => {
    if (!userId) throw new Error('User ID is required');
    
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert([
          {
            user_id: userId,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      set({ isOnboardingCompleted: true });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

