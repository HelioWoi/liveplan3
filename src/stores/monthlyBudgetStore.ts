import { create } from 'zustand';
import { SupabaseClient } from '@supabase/supabase-js';

export interface MonthlyBudgetEntry {
  id: string;
  user_id: string;
  month: string;
  year: number;
  category: string;
  description: string;
  amount: number;
  created_at: string;
}

interface MonthlyBudgetStore {
  entries: MonthlyBudgetEntry[];
  fetchEntries: (supabase: SupabaseClient, userId: string, month: string, year: string) => Promise<void>;
  addEntry: (supabase: SupabaseClient, entry: Omit<MonthlyBudgetEntry, 'id' | 'created_at'>) => Promise<void>;
}

export const useMonthlyBudgetStore = create<MonthlyBudgetStore>((set) => ({
  entries: [],
  fetchEntries: async (supabase, userId, month, year) => {
    try {
      const { data, error } = await supabase
        .from('monthly_budget')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year);

      if (error) throw error;
      set({ entries: data || [] });
    } catch (error) {
      console.error('Error fetching monthly budget entries:', error);
      throw error;
    }
  },
  addEntry: async (supabase, entry) => {
    try {
      const { error } = await supabase
        .from('monthly_budget')
        .insert([entry]);

      if (error) throw error;

      // Fetch updated entries
      const { data: updatedData, error: fetchError } = await supabase
        .from('monthly_budget')
        .select('*')
        .eq('user_id', entry.user_id)
        .eq('month', entry.month)
        .eq('year', entry.year);

      if (fetchError) throw fetchError;
      set({ entries: updatedData || [] });
    } catch (error) {
      console.error('Error adding monthly budget entry:', error);
      throw error;
    }
  },
}));
