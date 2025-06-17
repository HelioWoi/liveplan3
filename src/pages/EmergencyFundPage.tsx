import PageHeader from '../components/layout/PageHeader';
import EmergencyFund from '../components/goals/EmergencyFund';

export default function EmergencyFundPage() {
  return (
    <div className="pb-24">
      <PageHeader title="Emergency Fund Calculator" />
      
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* Emergency Fund Section */}
        <EmergencyFund />
      </div>
    </div>
  );
}
