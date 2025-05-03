import { create } from 'zustand';
import { supabase } from '../lib/supabase/supabaseClient';

interface OnboardingState {
  isOnboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  checkOnboardingStatus: (userId: string) => Promise<boolean>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isOnboardingCompleted: false,
  setOnboardingCompleted: (completed) => set({ isOnboardingCompleted: completed }),
  checkOnboardingStatus: async (userId) => {
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
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },
}));
