import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getWeeklyBudgetsByMonth } from "../services/getWeeklyBudgetsByMonth";

export function useWeeklyBudgetsByMonth(
  user_id: string,
  month: string
) {
  const query = useQuery({
    queryKey: ["weekly_budget_entries", user_id, month],
    queryFn: () => getWeeklyBudgetsByMonth(user_id, month),
    enabled: !!user_id && !!month,
  });

  if (query.error) {
    toast.error((query.error as Error).message);
  }

  return query;
}
