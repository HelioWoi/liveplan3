
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

type Entry = {
  id: string;
  category: string;
  week: number;
  amount: number;
};

export function formatBudgets(entries: Entry[]) {
  const result: Record<
    string,
    any
  > = {};

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
      result[category][week] = { amount: 0, id: null, category };
    }
  }

  // Preenche os dados reais com amount e id
  for (const entry of entries) {
    const { category, week, amount, id } = entry;

    if (!result[category]) {
      result[category] = {};
    }

    result[category][week] = {
      amount,
      id,
      category,
      type: category === 'Income' ? 'income' : 'expense'
    };
  }

  // Calcula o Balance por semana
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

    const balance = income - expenses;

    result["Balance"][week] = {
      amount: balance,
      id: null,
      category: "Balance",
    };
  }

  return result;
}
