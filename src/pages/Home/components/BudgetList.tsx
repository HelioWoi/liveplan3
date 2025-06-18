import { useDeleteWeeklyBudget } from "../../../hooks/useCreateWeeklyBudget";

export function BudgetList({ budgets }: { budgets: { id: string; description: string }[] }) {
  const { mutate: deleteBudget, isPending } = useDeleteWeeklyBudget();

  const handleDelete = (id: string) => deleteBudget(id);

  return (
   <>
    <ul className="space-y-2">
      {budgets.map((budget: any) => (
        <li key={budget.id} className="flex justify-between items-center border p-2 rounded">
          <span>{budget.description}</span>
          <span className="text-gray-500 text-sm">Amount: {budget.amount}</span>
          <span className="text-gray-500 text-sm">category: {budget.category}</span>
          <span className="text-gray-500 text-sm">description: {budget.description}</span>
          <span className="text-gray-500 text-sm">description: {budget.month}</span>
          <span className="text-gray-500 text-sm">week: {budget.week}</span>
          <button
            onClick={() => handleDelete(budget.id)}
            disabled={isPending}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            {isPending ? "Removendo..." : "Remover"}
          </button>
        </li>
      ))}
    </ul>
   </>
  );
}