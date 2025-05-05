import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useAuthStore } from '../../stores/authStore';
import { useWeeklyBudgetStore } from '../../stores/weeklyBudgetStore';
import { PlusCircle, X, Calendar, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const years = ['2022', '2023', '2024', '2025'];
const categories = ['Income', 'Investment', 'Fixed', 'Variable', 'Extra', 'Additional'];

export default function WeeklyBudget() {
  const { supabase } = useSupabase();
  const { user } = useAuthStore();
  const { entries, fetchEntries, addEntry } = useWeeklyBudgetStore();
  
  const [selectedPeriod, setPeriod] = useState('Month');
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [newEntry, setNewEntry] = useState({
    month: selectedMonth,
    week: 1,
    category: 'Extra',
    description: '',
    amount: '',
  });

  // Fetch entries when month/year changes or user changes
  useEffect(() => {
    if (!user) return;
    fetchEntries(supabase, user.id, selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, user, supabase, fetchEntries]);

  // Process entries into budget data
  const budgetData = entries.reduce((acc, entry) => {
    const weekKey = `Week ${entry.week}`;
    if (!acc[weekKey]) {
      acc[weekKey] = {};
    }
    if (!acc[weekKey][entry.category]) {
      acc[weekKey][entry.category] = 0;
    }
    acc[weekKey][entry.category] += entry.amount;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEntry.description || !newEntry.amount) return;
    
    setIsSubmitting(true);
    
    try {
      const amount = parseFloat(newEntry.amount.replace(/[^0-9.-]+/g, ''));
      
      await addEntry(supabase, {
        user_id: user.id,
        month: newEntry.month,
        week: newEntry.week,
        year: parseInt(selectedYear),
        category: newEntry.category,
        description: newEntry.description,
        amount: amount,
      });

      // Reset form and close modal
      setNewEntry({
        month: selectedMonth,
        week: 1,
        category: 'Extra',
        description: '',
        amount: '',
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBalance = (weekData: Record<string, number> = {}) => {
    const income = weekData['Income'] || 0;
    const expenses = Object.entries(weekData)
      .filter(([category]) => category !== 'Income')
      .reduce((sum, [_, amount]) => sum + amount, 0);
    return income - expenses;
  };

  const currentWeekIndex = new Date().getDate() <= 7 ? 0 : new Date().getDate() <= 14 ? 1 : new Date().getDate() <= 21 ? 2 : 3;

  const exportToCSV = () => {
    // Create headers
    const headers = ['Category', ...weeks, 'Total'];
    
    // Create rows with data
    const rows = categories.map(category => {
      const rowData = [category];
      let total = 0;
      
      // Add data for each week
      weeks.forEach(week => {
        const amount = budgetData[week]?.[category] || 0;
        total += amount;
        rowData.push(formatCurrency(amount));
      });
      
      // Add total
      rowData.push(formatCurrency(total));
      
      return rowData;
    });
    
    // Add balance row
    const balanceRow = ['Balance'];
    let totalBalance = 0;
    weeks.forEach(week => {
      const balance = getBalance(budgetData[week]);
      totalBalance += balance;
      balanceRow.push(formatCurrency(balance));
    });
    balanceRow.push(formatCurrency(totalBalance));
    rows.push(balanceRow);
    
    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `weekly_budget_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Title Section */}
      <div className="flex items-center justify-between mb-6">
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
          onClick={exportToCSV}
          className="btn btn-outline flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Period Selection */}
      <div className="flex gap-3 mb-6 items-center flex-wrap">
        {['Day', 'Week', 'Month', 'Year'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-4 py-1 rounded-full text-sm font-medium border',
              selectedPeriod === p
                ? 'bg-purple-600 text-white border-purple-600'
                : 'text-gray-700 border-gray-300 hover:border-purple-300'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Month Buttons */}
      {selectedPeriod === 'Month' && (
        <div className="flex flex-wrap gap-2 mb-6">
          {months.map(month => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={cn(
                'px-3 py-1 rounded-md text-sm border',
                selectedMonth === month ? 'bg-purple-500 text-white border-purple-600' : 'text-gray-700 border-gray-300'
              )}
            >
              {month}
            </button>
          ))}
        </div>
      )}

      {/* Year Selection */}
      {selectedPeriod === 'Month' && (
        <div className="flex gap-2 mb-6">
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                'px-3 py-1 rounded-md text-sm border',
                selectedYear === year ? 'bg-purple-500 text-white border-purple-600' : 'text-gray-700 border-gray-300'
              )}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      {/* Budget Grid */}
      <div className="grid grid-cols-2 gap-4">
        {weeks.map(week => {
          const weekData = budgetData[week] || {};
          const balance = getBalance(weekData);
          const isCurrentWeek = week === weeks[currentWeekIndex];
          
          return (
            <div
              key={week}
              className={cn(
                'p-4 rounded-xl border',
                isCurrentWeek ? 'border-purple-200 bg-purple-50/50' : 'border-gray-100'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{week}</h3>
                <span className={cn(
                  'text-sm font-medium',
                  balance >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {formatCurrency(balance)}
                </span>
              </div>
              
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{category}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(weekData[category] || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Entry Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        <PlusCircle className="h-6 w-6" />
      </button>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Add Entry</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week
                </label>
                <select
                  value={newEntry.week}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, week: parseInt(e.target.value) }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  {[1, 2, 3, 4].map(week => (
                    <option key={week} value={week}>
                      Week {week}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newEntry.category}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter amount"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'w-full py-2 px-4 rounded-lg text-white font-medium',
                  isSubmitting
                    ? 'bg-purple-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                )}
              >
                {isSubmitting ? 'Adding...' : 'Add Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
