import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import type { WeeklyBudgetEntry, Transaction } from "../services/types";

import { 
  createWeeklyBudgetWithTransactions,
  getWeeklyBudgets,
  updateWeeklyBudget,
  deleteWeeklyBudget,
  createBudgetWithRecurrence,
} from "../services/budgetService";

export function useCreateBudgetWithRecurrence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      budgetData,
      transactionsData,
      recurrence = "None"
    }: {
      budgetData: Omit<WeeklyBudgetEntry, "id" | "created_at">;
      transactionsData: Omit<Transaction, "id" | "created_at" | "weekly_budget_id">[];
      recurrence?:  "None" | "Weekly" | "Monthly" | "Annually";
      occurrences?: number;
    }) =>
      createBudgetWithRecurrence(
        budgetData,
        transactionsData,
        recurrence
      ),

    onSuccess: () => {
      toast.success("Budget entries completed successfully");
      queryClient.invalidateQueries({ queryKey: ["weekly_budget_entries"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Exemplo: criação
export function useCreateWeeklyBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      budgetData,
      transactionsData,
    }: {
      budgetData: Omit<WeeklyBudgetEntry, "id" | "created_at">;
      transactionsData: any[];
    }) => createWeeklyBudgetWithTransactions(budgetData, transactionsData),

    onSuccess: () => {
      toast.success("Budget entries completed successfully");
      queryClient.invalidateQueries({ queryKey: ["weekly_budget_entries"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}


// Exemplo: leitura
export function useWeeklyBudgets(user_id: string) {
  const query = useQuery({
    queryKey: ["weekly_budget_entries", user_id],
    queryFn: () => getWeeklyBudgets(user_id),
  });

  if (query.error) {
    toast.error((query.error as Error).message);
  }

  return query;
}


export function useUpdateWeeklyBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
      relatedTransactionsUpdate,
    }: {
      id: string;
      updates: Partial<Omit<WeeklyBudgetEntry, "id" | "created_at">>;
      relatedTransactionsUpdate?: Partial<Transaction>;
    }) => updateWeeklyBudget(id, updates, relatedTransactionsUpdate),

    onSuccess: () => {
      toast.success("Budget updated successfully");
      queryClient.invalidateQueries({ queryKey: ["weekly_budget_entries"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteWeeklyBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWeeklyBudget(id),

    onSuccess: () => {
      toast.success("Budget deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["weekly_budget_entries"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
