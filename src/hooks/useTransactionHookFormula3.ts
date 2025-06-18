import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { getTransactionsWithFilters } from "../services/getTransactionsWithFilters";

export function useTransactionHookFormula3(user_id: string) {
  const query = useQuery({
    queryKey: ["transactions", user_id],
    queryFn: () => getTransactionsWithFilters(user_id),
    enabled: !!user_id,
  });

  if (query.error) {
    toast.error((query.error as Error).message);
  }

  return query;
}