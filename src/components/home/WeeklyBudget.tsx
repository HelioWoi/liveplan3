import { Calendar, PlusCircle, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWeeklyBudgetStore } from '../../stores/weeklyBudgetStore';
import { formatCurrency } from '../../utils/formatters';
import AddEntryModal from './AddEntryModal';

type Period = 'Month' | 'Year';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute top-0 left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-48 z-50 shadow-lg whitespace-normal">
        {content}
      </div>
    </div>
  );
}

export default function WeeklyBudget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getCurrentMonth = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[new Date().getMonth()];
  };

  const getCurrentYear = () => new Date().getFullYear();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Month');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const { entries, currentYear, setCurrentYear } = useWeeklyBudgetStore();

  // Initialize with current year
  useEffect(() => {
    setCurrentYear(getCurrentYear());
  }, []);
  
  // Anos fixos de 2022 a 2025
  const years = [2022, 2023, 2024, 2025];

  const periods: Period[] = ['Month', 'Year'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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

  const getCurrentWeek = () => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const weekNumber = Math.ceil(dayOfMonth / 7);
    return `Week ${weekNumber}`;
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

  // Categoria descriptions for tooltips
  const categoryDescriptions: Record<string, string> = {
    Fixed: 'Mandatory and recurring expenses, such as rent, school, health insurance, etc.',
    Variable: 'Flexible and monthly expenses, such as groceries, fuel, delivery.',
    Extra: 'Non-standard costs, such as unexpected repairs or last-minute travel. Should be used with caution.',
    Additional: 'Non-essential expenses that you chose to make, such as gifts or parties. Ideally, these should be planned.',
    Income: 'Money received from salary, freelance work, or other sources.',
    Investment: 'Money allocated to assets expected to generate income or appreciate in value over time.'
  };

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
          className="inline-flex items-center justify-center p-0 text-purple-600 bg-transparent hover:text-purple-700 focus:outline-none"
        >
          <PlusCircle className="h-6 w-6" />
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
                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => (
                  <th 
                    key={week}
                    className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider
                      ${week === getCurrentWeek() ? 'bg-purple-50' : 'bg-gray-50'}`}
                  >
                    {week}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map(category => (
                <tr key={category}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {categoryDescriptions[category] ? (
                      <Tooltip content={categoryDescriptions[category]}>
                        <div className="flex items-center gap-1">
                          {category}
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                      </Tooltip>
                    ) : (
                      category
                    )}
                  </td>
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => (
                    <td 
                      key={`${category}-${week}`} 
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium
                        ${week === getCurrentWeek() ? 'bg-purple-50' : ''}
                        ${getCategoryTotal(week, category) > 0 ? 'text-green-600' : getCategoryTotal(week, category) < 0 ? 'text-red-600' : 'text-gray-900'}`}
                    >
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
                  <td 
                    key={`balance-${week}`} 
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold
                      ${week === getCurrentWeek() ? 'bg-purple-50' : ''}
                      ${getWeekBalance(week) > 0 ? 'text-green-600' : getWeekBalance(week) < 0 ? 'text-red-600' : 'text-gray-900'}`}
                  >
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
