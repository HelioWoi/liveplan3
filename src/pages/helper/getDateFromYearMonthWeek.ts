export function getDateFromYearMonthWeek(
  year: number,
  monthNumber: number,
  week: number
): string {
  console.log('getDateFromYearMonthWeek', { year, monthNumber, week });
  const jsMonth = monthNumber - 1;

  // Calcula a data da semana: adiciona (semana - 1) * 7 dias
  const day = 1 + (week - 1) * 7;

  // Cria nova data respeitando o mês
  return new Date(year, jsMonth, day).toISOString();
}