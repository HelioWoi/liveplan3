import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import type { WeekNumber } from "../pages/@types/period-selection";

import { getTransactionsWithFilters } from "../services/getTransactionsWithFilters";

import { monthMap } from "../constants";

export function useTransactions(user_id: string, month?: string, year?: string, week?: WeekNumber, period?: "Week" | "Month" | "Year") {
  const monthNumber = monthMap[month as keyof typeof monthMap];

  const query = useQuery({
    queryKey: ["transactions", user_id, year, monthNumber, week, period],
    // queryFn: () => getTransactionsWithFilters(user_id, year, monthNumber, period === "Week" ? week : false),
    queryFn: () => getTransactionsWithFilters(user_id, year, monthNumber, week),
    enabled: !!user_id && !!year && !!monthNumber && !!week && !!period,
  });

  if (query.error) {
    toast.error((query.error as Error).message);
  }

  return {
    ...query,
    data: query.data?.map((item) => {
      return {
        ...item,
        type: (item as any).category === "Income" ? "income" : "expense",
      }
    }) || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}