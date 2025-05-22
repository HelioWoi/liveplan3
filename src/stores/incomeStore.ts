import { create } from 'zustand';
import { supabase } from '../lib/supabase/supabaseClient';

interface IncomeState {
  totalIncome: number;
  isLoading: boolean;
  error: string | null;
  fetchTotalIncome: () => Promise<void>;
}

// Function to initialize event listeners
const initializeEventListeners = (fetchTotalIncome: () => Promise<void>) => {
  // Add listeners for events that might change income
  window.addEventListener('local-transaction-added', () => {
    console.log('Income Store: Detected local-transaction-added event');
    fetchTotalIncome();
  });
  
  window.addEventListener('weekly-budget-updated', () => {
    console.log('Income Store: Detected weekly-budget-updated event');
    fetchTotalIncome();
  });
};

export const useIncomeStore = create<IncomeState>((set, get) => {
  // Initialize listeners after store creation
  setTimeout(() => {
    initializeEventListeners(get().fetchTotalIncome);
  }, 100);
  
  return {
    totalIncome: 0,
    isLoading: false,
    error: null,

    fetchTotalIncome: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // Fetch transactions from database
        let dbTotal = 0;
        
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData.session?.user;

          if (user) {
            const { data, error } = await supabase
              .from('transactions')
              .select('amount')
              .eq('category', 'Income')
              .eq('user_id', user.id);

            if (error) throw error;

            dbTotal = data?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;
          }
        } catch (dbError) {
          console.error('Error fetching income from database:', dbError);
          // Continue to fetch local transactions even if there's a database error
        }
        
        // Fetch local transactions from localStorage
        let localTotal = 0;
        
        try {
          const storedTransactions = localStorage.getItem('local_transactions');
          if (storedTransactions) {
            const localTransactions = JSON.parse(storedTransactions);
            
            // Filter only income transactions
            const incomeTransactions = localTransactions.filter(
              (t: any) => (t.category === 'Income' && t.type === 'income')
            );
            
            // Calculate local income total
            localTotal = incomeTransactions.reduce(
              (sum: number, t: any) => sum + (Number(t.amount) || 0), 
              0
            );
          }
        } catch (localError) {
          console.error('Error fetching income from localStorage:', localError);
        }
        
        // Combine database and local totals
        const total = dbTotal + localTotal;
        
        set({ totalIncome: total, isLoading: false });
      } catch (error: any) {
        console.error('Error fetching total income:', error);
        set({ error: error.message || 'Failed to fetch total income', isLoading: false });
      }
    }
  };
});
