import { create } from 'zustand';
import { SupabaseClient } from '@supabase/supabase-js';

export interface WeeklyBudgetEntry {
  id: string;
  user_id: string;
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
  isLoading: boolean;
  error: string | null;
  fetchEntries: (supabase: SupabaseClient, userId: string, month: string, year: string) => Promise<void>;
  addEntry: (supabase: SupabaseClient, entry: Omit<WeeklyBudgetEntry, 'id' | 'created_at'>) => Promise<void>;
  deleteEntry: (supabase: SupabaseClient, id: string) => Promise<void>;
  clearEntries: () => void;
}

export const useWeeklyBudgetStore = create<WeeklyBudgetState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  fetchEntries: async (supabase, userId, month, year) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('weekly_budget_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', parseInt(year));

      if (error) throw error;
      
      set({ entries: data || [], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching entries:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  addEntry: async (supabase, entry) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('weekly_budget_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      
      set(state => ({
        entries: [...state.entries, data],
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error adding entry:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteEntry: async (supabase, id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('weekly_budget_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set(state => ({
        entries: state.entries.filter(entry => entry.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  clearEntries: () => {
    set({ entries: [], error: null });
  }
}));