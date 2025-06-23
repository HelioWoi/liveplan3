import { supabase } from '../lib/supabase/supabaseClient';

export async function getWeeklyBudgetsByMonth(
  user_id: string,
  month: string
) {
  const { data, error } = await supabase
    .from("weekly_budget_entries")
    .select("*")
    .eq("user_id", user_id)
    .eq("month", month)

  if (error) {
    throw new Error(`Erro ao buscar orçamentos do mês: ${error.message}`);
  }

  return data;
}