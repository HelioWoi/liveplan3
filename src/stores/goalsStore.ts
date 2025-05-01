import { create } from 'zustand';
import { formatISO } from 'date-fns';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  userId: string;
  createdAt: string;
}

interface GoalsState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  fetchGoals: () => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ goals: [], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      set({ error: error.message || 'Failed to fetch goals', isLoading: false });
    }
  },

  addGoal: async (goal) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newGoal = {
        ...goal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({
        goals: [newGoal, ...state.goals],
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error adding goal:', error);
      set({ error: error.message || 'Failed to add goal', isLoading: false });
      throw error;
    }
  },

  updateGoal: async (id, goal) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...goal } : g),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error updating goal:', error);
      set({ error: error.message || 'Failed to update goal', isLoading: false });
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        goals: state.goals.filter(g => g.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      set({ error: error.message || 'Failed to delete goal', isLoading: false });
    }
  },

  contributeToGoal: async (id, amount) => {
    set({ isLoading: true, error: null });
    
    try {
      const goal = get().goals.find(g => g.id === id);
      if (!goal) throw new Error('Goal not found');

      const newAmount = goal.currentAmount + amount;
      
      await get().updateGoal(id, { currentAmount: newAmount });
    } catch (error: any) {
      console.error('Error contributing to goal:', error);
      set({ error: error.message || 'Failed to contribute to goal', isLoading: false });
    }
  },
}));