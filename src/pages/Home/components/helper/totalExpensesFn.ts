export const totalExpensesFn = (transactions: any[]) => {
  return transactions?.filter(t => t.type !== 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
}