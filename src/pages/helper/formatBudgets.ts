type Entry = {
  id: string;
  category: string;
  week: number;
  amount: number;
  description?: string;
};

type BudgetItem = {
  amount: number;
  id: string | null;
  category: string;
  type: "income" | "expense" | "balance";
  count: number;
  entries: Entry[];
  week: number;
};

export function formatBudgets(entries: Entry[]) {
  const result: Record<string, Record<number, BudgetItem>> = {};

  const weeks = [1, 2, 3, 4];
  const categories = [
    "Income",
    "Fixed",
    "Variable",
    "Extra",
    "Additional",
    "Balance",
  ];

  // Inicializa todas as categorias e semanas com valor zero
  for (const category of categories) {
    result[category] = {};
    for (const week of weeks) {
      result[category][week] = {
        amount: 0,
        id: null,
        category,
        type:
          category === "Income"
            ? "income"
            : category === "Balance"
            ? "balance"
            : "expense",
        count: 0,
        entries: [],
        week,
      };
    }
  }

  // Agrupa e acumula valores
  for (const entry of entries) {
    const { category, week, amount, id } = entry;
    const item = result[category][week];

    item.amount += amount;
    item.count += 1;
    item.id = item.id ?? id;
    item.entries.push(entry);
  }

  // Calcula o Balance
  for (const week of weeks) {
    const weekEntries = entries.filter((entry) => entry.week === week);

    const income = weekEntries
      .filter((e) => e.category === "Income")
      .reduce((total, e) => total + Math.abs(e.amount), 0);

    const expenses = weekEntries
      .filter((e) =>
        ["Fixed", "Variable", "Extra", "Additional"].includes(e.category)
      )
      .reduce((total, e) => total + Math.abs(e.amount), 0);

    result["Balance"][week] = {
      amount: income - expenses,
      id: null,
      category: "Balance",
      type: "balance",
      count: 0,
      entries: [],
      week,
    };
  }

  return result;
}
