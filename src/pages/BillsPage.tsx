import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { ArrowLeft, Bell, Calendar, ArrowUpCircle, ArrowDownCircle, X, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import BottomNavigation from '../components/layout/BottomNavigation';
import { formatCurrency } from '../utils/formatters';
import classNames from 'classnames';
import BillDetailsModal from '../components/bills/BillDetailsModal';
import BillQuickView from '../components/bills/BillQuickView';
import { Transaction, TransactionCategory } from '../types/transaction';
import PeriodSelector from '../components/common/PeriodSelector';

type Period = 'Day' | 'Week' | 'Month' | 'Year';
type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

const CATEGORIES = [
  { value: 'Fixed', label: 'Fixed' },
  { value: 'Variable', label: 'Variable' },
  { value: 'Extra', label: 'Extra' },
  { value: 'Additional', label: 'Additional' },
  { value: 'Tax', label: 'Tax' },
  { value: 'Invoices', label: 'Invoices' },
  { value: 'Contribution', label: 'Contribution' },
  { value: 'Goal', label: 'Goal' }
];

export default function BillsPage() {
  const navigate = useNavigate();
  const { transactions, addTransaction, updateTransaction } = useTransactionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Month');
  const [selectedMonth, setSelectedMonth] = useState<Month>('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showAddModal, setShowAddModal] = useState(false);
  const [billToMarkAsPaid, setBillToMarkAsPaid] = useState<Transaction | null>(null);
  const [selectedBill, setSelectedBill] = useState<Transaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [hoveredBill, setHoveredBill] = useState<Transaction | null>(null);

  // New bill form state
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: ''
  });

  const upcomingBills = transactions.filter(t => 
    t.category === 'Fixed' && 
    !t.origin.startsWith('PAID:')
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const paidBills = transactions.filter(t => 
    t.category === 'Fixed' && 
    t.origin.startsWith('PAID:')
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getDueDateStatus = (dueDate: string) => {
    const days = Math.floor((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days > 7) return 'success';
    if (days > 3) return 'warning';
    return 'error';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success-50 border-l-success-500 text-success-700';
      case 'warning':
        return 'bg-warning-50 border-l-warning-500 text-warning-700';
      case 'error':
        return 'bg-error-50 border-l-error-500 text-error-700';
      default:
        return 'bg-gray-50 border-l-gray-500 text-gray-700';
    }
  };

  const handleAddBill = async () => {
    if (!newBill.name || !newBill.amount || !newBill.category || !newBill.dueDate) {
      // TODO: Mostrar mensagem de erro
      return;
    }

    try {
      await addTransaction({
        origin: newBill.name,
        amount: parseFloat(newBill.amount),
        category: newBill.category as TransactionCategory,
        date: newBill.dueDate,
        type: 'expense',
        user_id: ''
      });

      setShowAddModal(false);
      setNewBill({
        name: '',
        amount: '',
        dueDate: '',
        category: ''
      });
    } catch (error) {
      console.error('Error adding bill:', error);
      // TODO: Mostrar mensagem de erro
    }
  };

  const handleMarkAsPaid = async (bill: Transaction) => {
    setBillToMarkAsPaid(bill);
  };

  const confirmMarkAsPaid = async () => {
    if (!billToMarkAsPaid) return;
    
    try {
      await updateTransaction(billToMarkAsPaid.id, {
        origin: `PAID: ${billToMarkAsPaid.origin} (${new Date().toLocaleDateString()})`
      });
      setBillToMarkAsPaid(null);
    } catch (error) {
      console.error('Error marking bill as paid:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Amount', 'Due Date', 'Frequency', 'Category', 'Status', 'Payment Date', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...upcomingBills.map(bill => [
        bill.origin,
        bill.amount,
        bill.date,
        'monthly',
        bill.category,
        'Pending',
        '',
        ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bills_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-[#120B39] text-white">
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#120B39] rounded-b-[40px]"></div>
          <div className="relative px-4 pt-12 pb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold">Bills</h1>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button 
              className="btn btn-primary flex-1 sm:flex-none"
              onClick={() => setShowAddModal(true)}
            >
              <ArrowUpCircle className="h-5 w-5 mr-2" />
              Add Bill
            </button>
            <button 
              className="btn btn-outline flex-1 sm:flex-none"
              onClick={exportToCSV}
            >
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Period Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onPeriodChange={setSelectedPeriod}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Due This Month</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(upcomingBills.reduce((sum, bill) => sum + bill.amount, 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center">
                <ArrowUpCircle className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-success-600">
                  {formatCurrency(paidBills.reduce((sum, bill) => sum + bill.amount, 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
                <ArrowDownCircle className="h-6 w-6 text-warning-600" />
              </div>
              <div className="px-4 py-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
                    <p className="text-sm text-gray-500">Manage your bills and recurring expenses</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => exportToCSV()}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Add Bill
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Upcoming Bills - 2 columns */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <h2 className="text-lg font-semibold mb-4">Upcoming Bills</h2>
                      {upcomingBills.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No upcoming bills</p>
                      ) : (
                        <div className="space-y-4">
                          {upcomingBills.map((bill) => (
                            <div
                              key={bill.id}
                              className="relative flex items-center justify-between py-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 px-4 -mx-4 transition-colors"
                              onClick={() => {
                                setSelectedBill(bill);
                                setIsDetailsModalOpen(true);
                              }}
                              onMouseEnter={() => setHoveredBill(bill)}
                              onMouseLeave={() => setHoveredBill(null)}
                            >
                              {hoveredBill?.id === bill.id && <BillQuickView bill={bill} />}
                              <div className="flex-1">
                                <h3 className="font-medium">{bill.origin}</h3>
                                <p className="text-sm text-gray-500">
                                  Due {new Date(bill.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <p className="text-lg font-bold">{formatCurrency(bill.amount)}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Evita que o clique no botão abra o modal
                                    handleMarkAsPaid(bill);
                                  }}
                                  className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* All Paid Bills */}
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <h2 className="text-lg font-semibold mb-4">Bills History</h2>
                      {paidBills.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No paid bills</p>
                      ) : (
                        <div className="space-y-4">
                          {paidBills.map((bill) => {
                            const originalName = bill.origin.replace('PAID: ', '').split(' (')[0];
                            const paidDate = bill.origin.split('(')[1]?.replace(')', '');
                            
                            return (
                              <div 
                                key={bill.id} 
                                className="relative flex items-center justify-between py-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 px-4 -mx-4 transition-colors"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setIsDetailsModalOpen(true);
                                }}
                                onMouseEnter={() => setHoveredBill(bill)}
                                onMouseLeave={() => setHoveredBill(null)}
                              >
                                {hoveredBill?.id === bill.id && <BillQuickView bill={bill} />}
                                <div className="flex-1">
                                  <h3 className="font-medium">{originalName}</h3>
                                  <p className="text-sm text-gray-500">
                                    Paid {paidDate}
                                  </p>
                                </div>
                                <p className="text-lg font-bold">{formatCurrency(bill.amount)}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Paid Bills - 1 column */}
                  <div className="bg-white rounded-xl p-4 shadow-sm h-fit">
                    <h2 className="text-lg font-semibold mb-4">Recently Paid</h2>
                    {paidBills.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No recent payments</p>
                    ) : (
                      <div className="space-y-4">
                        {paidBills.slice(0, 5).map((bill) => {
                          const originalName = bill.origin.replace('PAID: ', '').split(' (')[0];
                          const paidDate = bill.origin.split('(')[1]?.replace(')', '');
                          
                          return (
                            <div
                              key={bill.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <div>
                                  <p className="font-medium">{originalName}</p>
                                  <p className="text-sm text-gray-500">{paidDate}</p>
                                </div>
                              </div>
                              <p className="font-medium">{formatCurrency(bill.amount)}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Upcoming Bills</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {upcomingBills.length > 0 ? (
              upcomingBills.map(bill => {
                const status = getDueDateStatus(bill.date);
                return (
                  <div
                    key={bill.id}
                    className={classNames(
                      'rounded-xl p-4 border-l-4 flex items-center justify-between',
                      getStatusColor(status)
                    )}
                  >
                    <div>
                      <h3 className="font-semibold">{bill.origin}</h3>
                      <p className="text-sm opacity-75">
                        Due {new Date(bill.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs mt-1">Monthly</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(bill.amount)}</p>
                      <button
                        onClick={() => handleMarkAsPaid(bill)}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Mark as Paid
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No upcoming bills</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 btn btn-primary"
                >
                  Add Your First Bill
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Bill Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add New Bill</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Bill Name</label>
                  <input
                    type="text"
                    className="input"
                    value={newBill.name}
                    onChange={(e) => setNewBill(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Electricity"
                  />
                </div>

                <div>
                  <label className="label">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="text"
                      className="input pl-8"
                      placeholder="0.00"
                      value={newBill.amount}
                      onChange={e => setNewBill(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    className="input"
                    value={newBill.dueDate}
                    onChange={e => setNewBill(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>



                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={newBill.category}
                    onChange={e => setNewBill(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddBill}
                  className="btn btn-primary w-full"
                >
                  Add Bill
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog.Root open={billToMarkAsPaid !== null} onOpenChange={() => setBillToMarkAsPaid(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-fade-in" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl animate-slide-up">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-full bg-primary-50">
                  <AlertCircle className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-semibold mb-2">
                    Mark Bill as Paid?
                  </Dialog.Title>
                  <Dialog.Description className="text-gray-500">
                    Are you sure you want to mark this bill as paid? This action cannot be undone.
                  </Dialog.Description>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                  onClick={() => setBillToMarkAsPaid(null)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                  onClick={confirmMarkAsPaid}
                >
                  Confirm
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <BillDetailsModal
          bill={selectedBill}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedBill(null);
          }}
        />

        <BottomNavigation />
      </div>
    </div>
  );
}