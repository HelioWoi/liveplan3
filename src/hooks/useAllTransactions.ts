import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { getTransactionsWithFilters } from "../services/getTransactionsWithFilters";

export function useAllTransactions(user_id: string) {
  const query = useQuery({
    queryKey: ["transactions", user_id],
    queryFn: () => getTransactionsWithFilters(user_id),
  });

  if (query.error) {
    toast.error((query.error as Error).message);
  }

  const incomeItems = query.data
  ?.filter((item: any) => item.category?.trim().toLowerCase() === "income")
  .map((item) => ({
    ...item,
    type: "income",
  })) || [];

  return {
    data: incomeItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}