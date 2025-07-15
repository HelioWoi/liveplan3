export const totalIncomeFn = (transactions: any[]) => {
  // Cálculo do Total Income - APENAS entradas de receita (Income) do período selecionado
  return transactions?.filter(t => t.type === 'income' || (t as any).category === 'Income')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
}
