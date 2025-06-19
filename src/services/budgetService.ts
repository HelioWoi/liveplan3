import { supabase } from '../lib/supabase/supabaseClient';
import { WeeklyBudgetEntry, Transaction } from "./types";

export async function createWeeklyBudgetWithTransactions(
  budgetData: Omit<WeeklyBudgetEntry, "id" | "created_at">,
  transactionsData: Omit<Transaction, "id" | "created_at" | "weekly_budget_id">[]
) {
  const { data: budget, error } = await supabase
    .from("weekly_budget_entries")
    .insert(budgetData)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar orçamento: ${error.message}`);
  }

  if (transactionsData.length > 0) {
    const transactionsWithBudgetId = transactionsData.map((t) => ({
      ...t,
      weekly_budget_entry_id: budget.id,
    }));

    const { error: txError } = await supabase
      .from("transactions")
      .insert(transactionsWithBudgetId);

    if (txError) {
      // Rollback manual: deletar o orçamento criado
      await supabase.from("weekly_budget_entries").delete().eq("id", budget.id);
      console.error("Erro ao criar transações:", txError);
      throw new Error(`Erro ao criar transações: ${txError.message}`);
    }
  }

  return budget;
}

export async function getWeeklyBudgets(user_id: string) {
  const { data, error } = await supabase
    .from("weekly_budget_entries")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Erro ao buscar orçamentos semanais");

  return data;
}

export async function updateWeeklyBudget(
  id: string,
  updates: Partial<Omit<WeeklyBudgetEntry, "id" | "created_at">>,
  relatedTransactionsUpdate?: Partial<Transaction>
) {
  const { error: updateError } = await supabase
    .from("weekly_budget_entries")
    .update(updates)
    .eq("id", id);

  if (updateError) throw new Error("Erro ao atualizar orçamento");

  // Se atualizações em transações forem necessárias
  if (relatedTransactionsUpdate && Object.keys(relatedTransactionsUpdate).length > 0) {
    const { error: txUpdateError } = await supabase
      .from("transactions")
      .update(relatedTransactionsUpdate)
      .eq("weekly_budget_entry_id", id);

    if (txUpdateError) throw new Error("Erro ao atualizar transações relacionadas");
  }
}

export async function deleteWeeklyBudget(id: string) {
  const { error } = await supabase
    .from("weekly_budget_entries")
    .delete()
    .eq("id", id);

  if (error) throw new Error("Erro ao excluir orçamento");
}
