import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { useWeeklyBudgetStore } from '../../stores/weeklyBudgetStore';
import { formatCurrency } from '../../utils/formatters';
import AddEntryModal from './AddEntryModal';

type Period = 'Month' | 'Year';

export default function WeeklyBudget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const { entries, currentYear, setCurrentYear } = useWeeklyBudgetStore();
  
  // Anos fixos de 2022 a 2025
  const years = [2022, 2023, 2024, 2025];

  const periods: Period[] = ['Month', 'Year'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getCategoryTotal = (week: string, category: string) => {
    return entries
      .filter(entry => 
        entry.week === week && 
        entry.category === category && 
        entry.month === selectedMonth &&
        entry.year === currentYear
      )
      .reduce((total, entry) => total + entry.amount, 0);
  };

  const getWeekBalance = (week: string) => {
    return entries
      .filter(entry => 
        entry.week === week && 
        entry.month === selectedMonth &&
        entry.year === currentYear
      )
      .reduce((total, entry) => total + entry.amount, 0);
  };

  const categories = ['Income', 'Investment', 'Fixed', 'Variable', 'Extra', 'Additional'];

  return (
    <div>
      {/* Title Section */}
      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Weekly Budget</h2>
            <p className="text-sm text-gray-500">Track and manage your weekly expenses</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Add New
        </button>
      </div>

      {/* Period Selection */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 mb-4">
          {periods.map(period => (
            <button
              key={period}
              onClick={() => {
                setSelectedPeriod(period);
                if (period === 'Year') {
                  setSelectedMonth('');
                }
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {selectedPeriod === 'Year' ? (
          <div className="flex gap-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => {
                  setCurrentYear(year);
                  setSelectedPeriod('Month');
                }}
                className={`py-1.5 px-4 rounded-md text-sm font-medium transition-colors ${
                  currentYear === year
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'border border-gray-200 text-gray-700 hover:border-purple-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        ) : selectedPeriod === 'Month' && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
            {months.map(month => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                  selectedMonth === month
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'border border-gray-200 text-gray-700 hover:border-purple-200'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Budget Table */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week 1
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week 2
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week 3
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week 4
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => (
                <tr key={category}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category}
                  </td>
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => (
                    <td key={`${category}-${week}`} className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(getCategoryTotal(week, category))}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  Balance
                </td>
                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => (
                  <td key={`balance-${week}`} className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                    {formatCurrency(getWeekBalance(week))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedMonth={selectedMonth}
        selectedYear={currentYear}
      />
    </div>
  );
}
