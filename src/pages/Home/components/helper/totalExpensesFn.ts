export const totalExpensesFn = (transactions: any[]) => {
  return transactions?.filter(t => t.type !== 'income')
      .reduce((sum, t) => sum + t.amount, 0) || 0;
}