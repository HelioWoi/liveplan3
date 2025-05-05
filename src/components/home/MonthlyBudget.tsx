import { useState, useEffect } from 'react';

import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useAuthStore } from '../../stores/authStore';
import { useMonthlyBudgetStore, MonthlyBudgetEntry } from '../../stores/monthlyBudgetStore';
import { PlusCircle, X, Calendar, Download } from 'lucide-react';
import MonthYearSelector from '../common/MonthYearSelector';
import { formatCurrency } from '../../utils/formatters';


const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
const categories = ['Income', 'Investment', 'Fixed', 'Variable', 'Extra', 'Additional'];

export default function MonthlyBudget() {
  const { supabase } = useSupabase();
  const { user } = useAuthStore();
  const { entries, fetchEntries, addEntry } = useMonthlyBudgetStore();

  const [selectedPeriod, setPeriod] = useState<'Month' | 'Year'>('Month');
  const [selectedMonth, setSelectedMonth] = useState<typeof months[number]>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [newEntry, setNewEntry] = useState<MonthlyBudgetEntry>({
    month: selectedMonth,
    category: 'Extra',
    description: '',
    amount: 0,
    user_id: '',
    year: parseInt(selectedYear),
    created_at: '',
    id: '',
  });

  // Define handleAmountChange function
  const handleAmountChange = (value: number) => {
    const currentAmount = parseFloat(newEntry.amount);
    const newAmount = Math.max(0, Math.min(currentAmount + value, 100000.00));
    setNewEntry(prev => ({
      ...prev,
      amount: newAmount
    }));
  };

  // Define handleManualAmountChange function
  const handleManualAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      if (value) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          const limitedValue = Math.min(numValue, 100000);
          setNewEntry(prev => ({
            ...prev,
            amount: limitedValue
          }));
        }
      }
    }
  };

  // Fetch entries when month/year changes or user changes
  useEffect(() => {
    if (!user) return;
    fetchEntries(supabase, user.id, selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, user, supabase, fetchEntries]);

  // Process entries into budget data
  const budgetData = entries.reduce((acc: Record<string, Record<string, number>>, entry: MonthlyBudgetEntry) => {
    if (!acc[entry.month]) {
      acc[entry.month] = {};
    }
    if (!acc[entry.month][entry.category]) {
      acc[entry.month][entry.category] = 0;
    }
    acc[entry.month][entry.category] += entry.amount;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEntry.description || !newEntry.amount) return;

    setIsSubmitting(true);

    try {
      const amount = parseFloat(newEntry.amount.toString().replace(/[^0-9.-]+/g, ''));

      await addEntry(supabase, {
        user_id: user.id,
        month: newEntry.month,
        year: parseInt(selectedYear),
        category: newEntry.category,
        description: newEntry.description,
        amount: amount,
      });

      // Reset form and close modal
      setNewEntry({
        month: selectedMonth as typeof months[number],
        category: 'Extra',
        description: '',
        amount: 0,
        user_id: '',
        year: parseInt(selectedYear),
        created_at: '',
        id: '',
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBalance = (monthData: Record<string, number> = {}) => {
    const income = monthData['Income'] || 0;
    const expenses = Object.entries(monthData)
      .filter(([category]) => category !== 'Income')
      .reduce((sum, [_, amount]) => sum + amount, 0);
    return income - expenses;
  };

  const exportToCSV = () => {
    // Create headers
    const headers = ['Category', 'Amount'];

    // Create rows with data
    const rows = categories.map(category => [
      category,
      budgetData[selectedMonth]?.[category] || 0
    ]);

    // Add balance row
    const balance = getBalance(budgetData[selectedMonth]);
    rows.push(['Balance', balance]);

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `budget_${selectedMonth}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
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
            <h2 className="text-xl font-bold text-gray-900">Monthly Budget</h2>
            <p className="text-sm text-gray-500">Track and manage your monthly expenses</p>
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
        <MonthYearSelector
          selectedPeriod={selectedPeriod}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onPeriodChange={setPeriod}
          onMonthChange={setSelectedMonth}
          onYearChange={setYear => setSelectedYear(setYear)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl p-4 shadow-sm overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-700">
              <th className="p-3">Category</th>
              <th className="p-3 text-right">Total</th>
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
                <td className="p-3 text-right">{formatCurrency(budgetData[selectedMonth]?.[category] || 0)}</td>
                <td></td>
              </tr>
            ))}
            {/* Balance row */}
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="p-3">Balance</td>
              <td className="p-3 text-right">{formatCurrency(getBalance(budgetData[selectedMonth]))}</td>
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
                  onChange={(e) => setNewEntry({ ...newEntry, month: e.target.value as typeof months[number] })}
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
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