import PeriodSummaryCards from './PeriodSummaryCards';

interface PeriodSummaryProps {
  selectedMonth?: string;
  selectedYear?: string;
}

export default function PeriodSummary({ selectedMonth, selectedYear }: PeriodSummaryProps = {}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <PeriodSummaryCards period="Weekly" selectedMonth={selectedMonth} selectedYear={selectedYear} />
      <PeriodSummaryCards period="Monthly" selectedMonth={selectedMonth} selectedYear={selectedYear} />
      <PeriodSummaryCards period="Annual" selectedMonth={selectedMonth} selectedYear={selectedYear} />
    </div>
  );
}
