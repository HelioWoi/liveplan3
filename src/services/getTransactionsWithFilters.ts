import type { WeekNumber } from '../pages/@types/period-selection';
import type { Transaction } from "./types";

import { supabase } from '../lib/supabase/supabaseClient';

export async function getTransactionsWithFilters(
  user_id: string,
  year?: string,
  month?: number,
  week?: any | WeekNumber
) {
  let query = supabase
    .from("transactions_with_date_parts")
    .select("*")
    .eq("user_id", user_id);
  
  if (year) query = query.eq("year", year);
  if (month) query = query.eq("month", month);
  if (week) query = query.eq("week", week);

  const { data, error } = await query;

  if (error) throw new Error("Erro ao buscar transações");

  return data as Transaction[];
}