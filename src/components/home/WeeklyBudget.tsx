import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useAuthStore } from '../../stores/authStore';
import { useWeeklyBudgetStore } from '../../stores/weeklyBudgetStore';
import { PlusCircle, X, Calendar, Download } from 'lucide-react';
import PeriodSelector from '../common/PeriodSelector';
import { formatCurrency } from '../../utils/formatters';

const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
const categories = ['Income', 'Investment', 'Fixed', 'Variable', 'Extra', 'Additional'];

export default function WeeklyBudget() {
  const { supabase } = useSupabase();
  const { user } = useAuthStore();
  const { entries, fetchEntries, addEntry } = useWeeklyBudgetStore();
  
  const [selectedPeriod, setPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [selectedMonth, setSelectedMonth] = useState<typeof months[number]>(months[new Date().getMonth()]);
  const [selectedYear] = useState(new Date().getFullYear().toString());
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [newEntry, setNewEntry] = useState<{
    month: typeof months[number];
    week: number;
    category: string;
    description: string;
    amount: string;
  }>({
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
      <div className="mb-6">
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          selectedMonth={selectedMonth}
          onPeriodChange={setPeriod}
          onMonthChange={setSelectedMonth}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-700">
              <th className="p-3">Category</th>
              {weeks.map((week, i) => (
                <th key={week} className="p-3 relative">
                  <div className="flex items-center gap-2">
                    {week}
                    {i === currentWeekIndex && (
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-3 text-right">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-1 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add New
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category} className="border-t border-gray-200 text-sm text-gray-900">
                <td className="p-3 font-medium">{category}</td>
                {weeks.map(week => (
                  <td key={week} className="p-3">
                    {formatCurrency(budgetData[week]?.[category] || 0)}
                  </td>
                ))}
                <td></td>
              </tr>
            ))}
            {/* Balance row */}
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="p-3">Balance</td>
              {weeks.map(week => {
                const balance = getBalance(budgetData[week]);
                const color = balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-500' : 'text-black';
                return (
                  <td key={week} className={cn("p-3", color)}>
                    {formatCurrency(balance)}
                  </td>
                );
              })}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add New Entry</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  className="input w-full"
                  value={newEntry.month}
                  onChange={(e) => setNewEntry({ ...newEntry, month: e.target.value })}
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
                <select
                  className="input w-full"
                  value={newEntry.week}
                  onChange={(e) => setNewEntry({ ...newEntry, week: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4].map(week => (
                    <option key={week} value={week}>Week {week}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="input w-full"
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Enter description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="text"
                    className="input w-full pl-8"
                    placeholder="0.00"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1"
                >
                  {isSubmitting ? 'Adding...' : 'Add Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}