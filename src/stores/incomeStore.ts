import { create } from 'zustand';
import { supabase } from '../lib/supabase/supabaseClient';

interface IncomeState {
  totalIncome: number;
  isLoading: boolean;
  error: string | null;
  fetchTotalIncome: () => Promise<void>;
}

export const useIncomeStore = create<IncomeState>((set) => ({
  totalIncome: 0,
  isLoading: false,
  error: null,

  fetchTotalIncome: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('category', 'Income')
        .eq('user_id', user.id);

      if (error) throw error;

      const total = data?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
      
      set({ totalIncome: total, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching total income:', error);
      set({ error: error.message || 'Failed to fetch total income', isLoading: false });
    }
  }
}));
