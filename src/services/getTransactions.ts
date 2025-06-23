import { supabase } from '../lib/supabase/supabaseClient';
import { Transaction } from "./types";

export async function getTransactions(user_id: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Erro ao buscar transações");

  return data as Transaction[];
}