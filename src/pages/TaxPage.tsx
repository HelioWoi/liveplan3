import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoalsStore } from '../stores/goalsStore';
import { useTransactionStore } from '../stores/transactionStore';
import { Calculator, DollarSign, HelpCircle, PlusCircle, TrendingUp, ChevronDown, Trash2 } from 'lucide-react';
import { formatCurrency, parseNumericInput } from '../utils/formatters';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import classNames from 'classnames';
import { TaxType, TAX_TYPES } from '../types/transaction';

type Period = 'weekly' | 'monthly' | 'yearly';

// Australian Tax Brackets 2024-25
const TAX_BRACKETS = [
  { min: 0, max: 18200, rate: 0 },
  { min: 18201, max: 45000, rate: 0.19 },
  { min: 45001, max: 120000, rate: 0.325 },
  { min: 120001, max: 180000, rate: 0.37 },
  { min: 180001, max: Infinity, rate: 0.45 },
];

export default function TaxPage() {
  const navigate = useNavigate();
  const { addGoal } = useGoalsStore();
  const { transactions, taxEntries, fetchTaxEntries, addTaxEntry, deleteTaxEntry } = useTransactionStore();
  const [showTaxTips, setShowTaxTips] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showSaveGoalModal, setShowSaveGoalModal] = useState(false);
  const [period, setPeriod] = useState<Period>('yearly');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Tax Entry Form State
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'Withheld' as TaxType,
    notes: '',
  });

  // Tax Calculator State
  const [income, setIncome] = useState('');

  // Auto-fill income on component mount
  useEffect(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setIncome(totalIncome.toFixed(2));
  }, [transactions]);

  useEffect(() => {
    fetchTaxEntries();
  }, [fetchTaxEntries]);

  const calculateTax = (annualIncome: number): number => {
    let tax = 0;
    let remainingIncome = annualIncome;

    for (const bracket of TAX_BRACKETS) {
      if (remainingIncome <= 0) break;
      
      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.max - (bracket.min - 1)
      );
      
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    return tax;
  };

  const handleIncomeChange = (value: string) => {
    const cleanValue = parseNumericInput(value);
    setIncome(cleanValue);
  };

  const calculateAnnualIncome = (value: number, period: Period): number => {
    switch (period) {
      case 'weekly':
        return value * 52;
      case 'monthly':
        return value * 12;
      case 'yearly':
        return value;
    }
  };

  const annualIncome = calculateAnnualIncome(Number(income), period);
  const estimatedTax = calculateTax(annualIncome);
  const netIncome = annualIncome - estimatedTax;
  const effectiveRate = annualIncome > 0 ? (estimatedTax / annualIncome) * 100 : 0;

  const totalTaxPaid = taxEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSaveGoal = async () => {
    if (estimatedTax <= 0) return;

    try {
      await addGoal({
        title: 'Tax Savings',
        description: `Save for ${new Date().getFullYear()} tax payment`,
        targetAmount: estimatedTax,
        currentAmount: 0,
        targetDate: new Date(new Date().getFullYear(), 6, 30).toISOString(),
        userId: 'current-user',
      });
      
      setShowSaveGoalModal(false);
      navigate('/goals');
    } catch (error) {
      console.error('Failed to create tax goal:', error);
    }
  };

  const handleAddTaxEntry = async () => {
    if (!newEntry.amount || !newEntry.type) return;

    try {
      await addTaxEntry({
        ...newEntry,
        amount: Number(newEntry.amount),
        userId: 'current-user',
      });

      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        type: 'Withheld',
        notes: '',
      });
      setShowAddEntry(false);
    } catch (error) {
      console.error('Failed to add tax entry:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteTaxEntry(id);
    } catch (error) {
      console.error('Failed to delete tax entry:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  // Prepare chart data
  const chartData = transactions
    .filter(t => t.type === 'income')
    .map(t => ({
      date: new Date(t.date).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
      income: t.amount,
      tax: t.amount * 0.3, // Simplified tax calculation for visualization
    }))
    .slice(-6);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Tax Overview" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Annual Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="font-semibold">Total Income</h3>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-error-600" />
              </div>
              <h3 className="font-semibold">Tax Paid</h3>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalTaxPaid)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-success-600" />
              </div>
              <h3 className="font-semibold">On Track</h3>
            </div>
            <p className="text-2xl font-bold">{(totalTaxPaid / totalIncome * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Tax Estimator */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Tax Estimator</h2>
              <p className="text-sm text-gray-500">Calculate your estimated tax</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Income
                  </label>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      className={classNames(
                        "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                        period === 'weekly' ? "bg-white shadow-sm" : "text-gray-600"
                      )}
                      onClick={() => setPeriod('weekly')}
                    >
                      Weekly
                    </button>
                    <button
                      className={classNames(
                        "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                        period === 'monthly' ? "bg-white shadow-sm" : "text-gray-600"
                      )}
                      onClick={() => setPeriod('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      className={classNames(
                        "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                        period === 'yearly' ? "bg-white shadow-sm" : "text-gray-600"
                      )}
                      onClick={() => setPeriod('yearly')}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="input pl-8"
                    value={income}
                    onChange={(e) => handleIncomeChange(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {period === 'yearly' ? 'Annual income before tax' : 
                   period === 'monthly' ? 'Monthly income before tax' : 
                   'Weekly income before tax'}
                </p>
              </div>

              <div className="bg-primary-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Tax Brackets 2024-25</h3>
                <div className="space-y-2 text-sm">
                  <p>$0 - $18,200: 0%</p>
                  <p>$18,201 - $45,000: 19%</p>
                  <p>$45,001 - $120,000: 32.5%</p>
                  <p>$120,001 - $180,000: 37%</p>
                  <p>$180,001+: 45%</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Tax Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Annual Income</p>
                  <p className="text-2xl font-bold">{formatCurrency(annualIncome)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Estimated Tax</p>
                  <p className="text-2xl font-bold text-error-600">
                    {formatCurrency(estimatedTax)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Net Income</p>
                  <p className="text-2xl font-bold text-success-600">
                    {formatCurrency(netIncome)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {period === 'monthly' ? `${formatCurrency(netIncome / 12)} per month` :
                     period === 'weekly' ? `${formatCurrency(netIncome / 52)} per week` : ''}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Effective Tax Rate</p>
                  <p className="text-2xl font-bold">
                    {effectiveRate.toFixed(1)}%
                  </p>
                </div>

                {estimatedTax > 0 && (
                  <button
                    onClick={() => setShowSaveGoalModal(true)}
                    className="btn btn-primary w-full"
                  >
                    Save as Tax Goal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tax Tracker */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Tax Payments</h2>
              <button
                onClick={() => setShowAddEntry(true)}
                className="btn btn-primary"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Tax Payment
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {taxEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(entry.date).toLocaleDateString('en-AU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.type}</td>
                    <td className="px-6 py-4 text-sm">{entry.notes || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        disabled={isDeleting === entry.id}
                        className="text-error-600 hover:text-error-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Income vs Tax Chart */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <h2 className="text-xl font-bold mb-6">Income vs Tax Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="income" name="Income" stroke="#4F46E5" />
                <Line type="monotone" dataKey="tax" name="Tax" stroke="#EF4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tax Tips */}
        <div className="bg-white rounded-xl p-6 shadow-card">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setShowTaxTips(!showTaxTips)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">Tax Tips</h2>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${showTaxTips ? 'rotate-180' : ''}`} />
          </button>

          {showTaxTips && (
            <div className="mt-4 space-y-4 text-gray-600">
              <p>• Most Australians can claim work-related expenses like mobile usage or home office equipment.</p>
              <p>• Keep all receipts and records for at least five years from the date you lodge your tax return.</p>
              <p>• Consider salary sacrificing into your superannuation to reduce your taxable income.</p>
              <p>• Use myGov to lodge returns or track activity with your registered tax agent.</p>
              <p>• The tax-free threshold is $18,200 - you can only claim it from one employer.</p>
              <a
                href="https://www.ato.gov.au/calculators-and-tools/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 block"
              >
                Visit ATO Calculator Tools →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Add Tax Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
            <h2 className="text-xl font-bold mb-4">Add Tax Payment</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Type</label>
                <select
                  className="input"
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as TaxType })}
                >
                  {TAX_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="text"
                    className="input pl-8"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  className="input"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder="Add any additional details..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleAddTaxEntry}
                className="btn btn-primary w-full"
              >
                Add Payment
              </button>
              <button
                onClick={() => setShowAddEntry(false)}
                className="btn btn-outline w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Goal Modal */}
      {showSaveGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
            <h2 className="text-xl font-bold mb-4">Save Tax Goal</h2>
            <p className="text-gray-600 mb-6">
              Do you want to create a goal to save {formatCurrency(estimatedTax)} for your estimated tax payment?
            </p>
            
            <div className="space-y-4">
              <button
                onClick={handleSaveGoal}
                className="btn btn-primary w-full"
              >
                Create Goal
              </button>
              <button
                onClick={() => setShowSaveGoalModal(false)}
                className="btn btn-outline w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}