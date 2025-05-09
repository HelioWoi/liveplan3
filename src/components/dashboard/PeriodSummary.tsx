import PeriodSummaryCards from './PeriodSummaryCards';

export default function PeriodSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <PeriodSummaryCards period="Weekly" />
      <PeriodSummaryCards period="Monthly" />
      <PeriodSummaryCards period="Annual" />
    </div>
  );
}
