import { create } from 'zustand';
import { SupabaseClient } from '@supabase/supabase-js';

export interface WeeklyBudgetEntry {
  id?: string;
  user_id?: string;
  month: string;
  week: number;
  year: number;
  category: string;
  description: string;
  amount: number;
  created_at?: string;
}

interface WeeklyBudgetState {
  entries: WeeklyBudgetEntry[];
  fetchEntries: (supabase: SupabaseClient, userId: string, month: string, year: string) => Promise<void>;
  addEntry: (supabase: SupabaseClient, entry: WeeklyBudgetEntry) => Promise<void>;
  deleteEntry: (supabase: SupabaseClient, id: string) => Promise<void>;
}

export const useWeeklyBudgetStore = create<WeeklyBudgetState>((set) => ({
  entries: [],
  fetchEntries: async (supabase: SupabaseClient, userId: string, month: string, year: string) => {
    try {
      const { data, error } = await supabase
        .from('weekly_budget')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)
        .order('week', { ascending: true });

      if (error) throw error;
      set({ entries: data || [] });
    } catch (error) {
      console.error('Error fetching weekly budget entries:', error);
      set({ entries: [] });
    }
  },
  addEntry: async (supabase: SupabaseClient, entry: WeeklyBudgetEntry) => {
    try {
      const { data, error } = await supabase
        .from('weekly_budget')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        entries: [...state.entries, data],
      }));
    } catch (error) {
      console.error('Error adding weekly budget entry:', error);
    }
  },
  deleteEntry: async (supabase: SupabaseClient, id: string) => {
    try {
      const { error } = await supabase
        .from('weekly_budget')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting weekly budget entry:', error);
    }
  },

  clearEntries: () => {
    set({ entries: [], error: null });
  }
}));