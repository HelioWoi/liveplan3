import { isAfter, setMonth, setYear } from "date-fns";

import { supabase } from '../lib/supabase/supabaseClient';
import { WeeklyBudgetEntry, Transaction } from "./types";
import { getDateFromYearMonthWeek } from '../pages/helper/getDateFromYearMonthWeek';
import { monthMap } from '../constants';

function getWeekFromDate(date: Date): number {
  const day = date.getDate();
  return Math.ceil(day / 7);
}

function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getFormattedMonthShort(date: Date): string {
  const rawMonth = date
    .toLocaleString("en-US", { month: "short" })
    .replace(".", "");
  return capitalizeFirstLetter(rawMonth);
}

export async function createBudgetWithRecurrence(
  budgetData: Omit<WeeklyBudgetEntry, "id" | "created_at">,
  transactionsData: Omit<Transaction, "id" | "created_at" | "weekly_budget_id">[],
  recurrence: "None" | "Weekly" | "Monthly" | "Annually" = "None"
) {
  
  const createdBudgets = [];
  const baseDate = new Date(transactionsData[0].date);
  const startMonth = baseDate.getMonth();
  const selectedWeek = budgetData.week;
  const endOfYear = new Date(new Date().getFullYear(), 11, 31);

  let i = 0;
  while (true) {
    let recurrenceDate: Date;

    if (recurrence === "Weekly" || recurrence === "Monthly") {
      recurrenceDate = setMonth(new Date(baseDate), startMonth + i);
      if (isAfter(recurrenceDate, endOfYear)) break;
      recurrenceDate.setDate(1); // início do mês
      const targetDay = 1 + (selectedWeek - 1) * 7;
      recurrenceDate.setDate(targetDay);
    } else if (recurrence === "Annually") {
      recurrenceDate = setYear(new Date(baseDate), baseDate.getFullYear() + i);
      if (isAfter(recurrenceDate, endOfYear)) break;
    } else {
      recurrenceDate = new Date(baseDate);
    }

    if (recurrence !== "None") i++;

    const monthShort = getFormattedMonthShort(recurrenceDate);
    const week = getWeekFromDate(recurrenceDate);

    const newBudgetData = {
      ...budgetData,
      week: recurrence === "Annually" ? week : selectedWeek,
      month: monthShort,
      year: recurrenceDate.getFullYear(),
    };

    const { data: budget, error } = await supabase
      .from("weekly_budget_entries")
      .insert(newBudgetData)
      .select()
      .single();

    if (error) {
      await Promise.all(
        createdBudgets.map((b: any) =>
          supabase.from("weekly_budget_entries").delete().eq("id", b.id)
        )
      );
      throw new Error(`Erro ao criar orçamento: ${error.message}`);
    }

    if (transactionsData.length > 0) {
      const transactionsWithDate = transactionsData.map((t: any) => ({
        ...t,
        weekly_budget_entry_id: budget.id,
      }));

      const { error: txError } = await supabase
        .from("transactions")
        .insert(transactionsWithDate);

      if (txError) {
        await supabase.from("weekly_budget_entries").delete().eq("id", budget.id);
        throw new Error(`Erro ao criar transações: ${txError.message}`);
      }
    }

    createdBudgets.push(newBudgetData);

    if (recurrence === "None") break;
  }

  return createdBudgets;
}

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
  const { data: budget, error: updateError } = await supabase
    .from("weekly_budget_entries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) throw new Error("Erro ao atualizar orçamento");

  // Se atualizações em transações forem necessárias
  if (relatedTransactionsUpdate && Object.keys(relatedTransactionsUpdate).length > 0) {
    const monthNumber = monthMap[(budget as any)?.month as keyof typeof monthMap];
    const date = getDateFromYearMonthWeek((budget as any)?.year, monthNumber, (budget as any)?.week);

    const { error: txUpdateError } = await supabase
      .from("transactions")
      .update({
        amount: (budget as any)?.amount,
        description: (budget as any)?.description,
        category: (budget as any)?.category,
        date,
      })
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
