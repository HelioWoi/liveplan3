import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import type { WeekNumber } from "../pages/@types/period-selection";

import { getTransactionsWithFilters } from "../services/getTransactionsWithFilters";

export function useTransactions(user_id: string, year?: number, month?: string, week?: WeekNumber) {
  const query = useQuery({
    queryKey: ["transactions", user_id, year, month, week],
    queryFn: () => getTransactionsWithFilters(user_id, year?.toString(), month ? parseInt(month) : undefined, week),
    enabled: !!user_id,
  });

  if (query.error) {
    toast.error((query.error as Error).message);
  }

  return query;
}