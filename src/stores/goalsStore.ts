import { create } from 'zustand';
import { supabase } from '../lib/supabase/supabaseClient';


export interface Goal {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  user_id: string;
  created_at: string;
}

export interface GoalsState {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'created_at'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
}



export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as { data: Goal[]; error: any };

      if (error) throw error;
      
      set({ goals: data || [], isLoading: false });
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      set({ error: error.message || 'Failed to fetch goals', isLoading: false });
    }
  },

  addGoal: async (goal: Omit<Goal, 'id' | 'created_at'>) => {
    set({ isLoading: true, error: null });
    
    try {
      const goalData = {
        title: goal.title,
        description: goal.description,
        target_amount: goal.target_amount,
        target_date: goal.target_date,
        user_id: goal.user_id,
        current_amount: 0
      };

      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single() as { data: any; error: any };

      if (error) throw error;
      
      if (data) {
        const formattedGoal: Goal = {
          id: data.id,
          title: data.title,
          description: data.description,
          target_amount: data.target_amount,
          current_amount: data.current_amount,
          target_date: data.target_date,
          user_id: data.user_id,
          created_at: data.created_at
        };

        set((state: GoalsState) => ({
          goals: [formattedGoal, ...state.goals],
          isLoading: false
        }));
      }
    } catch (error: any) {
      console.error('Error adding goal:', error);
      set({ error: error.message || 'Failed to add goal', isLoading: false });
      throw error;
    }
  },

  updateGoal: async (id: string, goal: Partial<Goal>) => {
    set({ isLoading: true, error: null });
    
    try {
      // Criar objeto de atualização que permite valores zero e strings vazias
      const updateData = {
        ...(goal.title !== undefined && { title: goal.title }),
        ...(goal.description !== undefined && { description: goal.description }),
        ...(goal.target_amount !== undefined && { target_amount: goal.target_amount }),
        ...(goal.current_amount !== undefined && { current_amount: goal.current_amount }),
        ...(goal.target_date !== undefined && { target_date: goal.target_date })
      };

      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      set((state: GoalsState) => ({
        goals: state.goals.map((g: Goal) => g.id === id ? { ...g, ...goal } : g),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error updating goal:', error);
      set({ error: error.message || 'Failed to update goal', isLoading: false });
      throw error;
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id) as { error: any };

      if (error) throw error;
      
      set((state: GoalsState) => ({
        goals: state.goals.filter(g => g.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      set({ error: error.message || 'Failed to delete goal', isLoading: false });
      throw error;
    }
  },

  contributeToGoal: async (id: string, amount: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const goal = get().goals.find(g => g.id === id);
      if (!goal) throw new Error('Goal not found');

      const newAmount = goal.current_amount + amount;
      
      const { error } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', id) as { error: any };

      if (error) throw error;
      
      set((state: GoalsState) => ({
        goals: state.goals.map((g: Goal) => 
          g.id === id 
            ? { ...g, current_amount: newAmount }
            : g
        ),
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error contributing to goal:', error);
      set({ error: error.message || 'Failed to contribute to goal', isLoading: false });
      throw error;
    }
  },
}));