import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../stores/transactionStore';
import { useNotificationStore } from '../stores/notificationStore';
import { Calendar, X, CheckCircle2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { formatCurrency } from '../utils/formatters';
import { Transaction, TransactionCategory } from '../types/transaction';
import BillDetailsModal from '../components/bills/BillDetailsModal';
import PeriodSelector from '../components/common/PeriodSelector';
import BottomNavigation from '../components/layout/BottomNavigation';
import PageHeader from '../components/layout/PageHeader';

type Period = 'Day' | 'Week' | 'Month' | 'Year';
type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
type WeekNumber = '1' | '2' | '3' | '4' | '5';

const CATEGORIES = [
  { value: 'Fixed', label: 'Fixed' },
  { value: 'Variable', label: 'Variable' },
  { value: 'Extra', label: 'Extra' },
  { value: 'Additional', label: 'Additional' }
];

export default function BillsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate(); // Required for PageHeader component to work properly
  const { transactions, addTransaction, updateTransaction } = useTransactionStore();
  // Initialize notification store to ensure it's available
  useNotificationStore();
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const months: Month[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = months[currentDate.getMonth()] as Month;
  
  // Calculate current week of the month (1-5)
  const getWeekOfMonth = (): WeekNumber => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    const weekNumber = Math.ceil((dayOfMonth + firstDay.getDay() - 1) / 7);
    return (weekNumber > 5 ? '5' : weekNumber.toString()) as WeekNumber;
  };
  
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Month');
  const [selectedMonth, setSelectedMonth] = useState<Month>(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState<WeekNumber>(getWeekOfMonth());
  const [showAddModal, setShowAddModal] = useState(false);
  const [billToMarkAsPaid, setBillToMarkAsPaid] = useState<Transaction | null>(null);
  const [selectedBill, setSelectedBill] = useState<Transaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  // Removemos o estado de hoveredBill pois não é mais necessário

  // New bill form state
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: ''
  });

  const upcomingBills = useMemo(() => {
    // Primeiro, remover transações duplicadas com o mesmo ID
    const uniqueTransactions = Array.from(
      new Map(transactions.map(t => [t.id, t])).values()
    );
    
    return uniqueTransactions
      .filter(t => t.category === 'Fixed' && !t.origin.includes('PAID:'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const paidBills = useMemo(() => {
    // Primeiro, remover transações duplicadas com o mesmo ID
    const uniqueTransactions = Array.from(
      new Map(transactions.map(t => [t.id, t])).values()
    );
    
    return uniqueTransactions
      .filter(t => t.category === 'Fixed' && t.origin.includes('PAID:'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // Estas funções foram removidas pois não estavam sendo utilizadas

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
      // Verificar se é uma transação local (ID começa com 'tx-')
      if (billToMarkAsPaid.id.startsWith('tx-')) {
        // Tratar transação local manualmente
        const updatedBill = {
          ...billToMarkAsPaid,
          origin: `PAID: ${billToMarkAsPaid.origin} (${new Date().toLocaleDateString()})`
        };
        
        // Atualizar no localStorage
        const storedTransactions = localStorage.getItem('local_transactions');
        if (storedTransactions) {
          const transactions = JSON.parse(storedTransactions);
          const updatedTransactions = transactions.map((t: any) => 
            t.id === billToMarkAsPaid.id ? updatedBill : t
          );
          localStorage.setItem('local_transactions', JSON.stringify(updatedTransactions));
        }
        
        // Atualizar no estado global
        const { transactions } = useTransactionStore.getState();
        const updatedTransactions = transactions.map(t => 
          t.id === billToMarkAsPaid.id ? updatedBill : t
        );
        useTransactionStore.setState({ transactions: updatedTransactions });
      } else {
        // Transação normal do banco de dados
        await updateTransaction(billToMarkAsPaid.id, {
          origin: `PAID: ${billToMarkAsPaid.origin} (${new Date().toLocaleDateString()})`
        });
      }
      
      setBillToMarkAsPaid(null);
    } catch (error) {
      console.error('Error marking bill as paid:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader 
        title="Bills" 
        showBackButton={true}
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-700">Manage Your Bills</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 bg-[#120B39] text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors"
              >
                <span className="text-sm font-medium">Add Bill</span>
              </button>
            </div>
          </div>

          <p className="text-gray-500 mt-1 mb-4">Manage your bills and recurring expenses</p>

          {/* Period Selector */}
          <div className="mt-4">
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              selectedWeek={selectedWeek}
              onPeriodChange={setSelectedPeriod}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              onWeekChange={setSelectedWeek}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary-50">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Due This Month</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    upcomingBills
                      .filter(bill => {
                        const billDate = new Date(bill.date);
                        const now = new Date();
                        return (
                          billDate.getMonth() === now.getMonth() &&
                          billDate.getFullYear() === now.getFullYear()
                        );
                      })
                      .reduce((sum: number, bill: Transaction) => sum + bill.amount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    paidBills.reduce((sum: number, bill: Transaction) => sum + bill.amount, 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bills</h3>
              <p className="text-sm text-gray-500">Manage your bills and recurring expenses</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Bill
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Upcoming Bills - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className="px-4 py-2 border-b-2 border-primary-600 text-primary-600 font-medium"
                >
                  Upcoming Bills
                </button>
                <button
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Recently Paid
                </button>
              </div>
              
              {upcomingBills.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No upcoming bills</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Your First Bill
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBills.map((bill: Transaction) => (
                    <div
                      key={bill.id}
                      className="relative flex items-center justify-between py-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedBill(bill);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{bill.origin}</h3>
                        <p className="text-sm text-gray-500">
                          Due {new Date(bill.date).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold">{formatCurrency(bill.amount)}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Evita que o clique no botão abra o modal
                            handleMarkAsPaid(bill);
                          }}
                          className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bills History - 1 column */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Bills History</h2>
            </div>
            
            {paidBills.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No paid bills</p>
            ) : (
              <div className="space-y-4">
                {paidBills.slice(0, 5).map((bill: Transaction) => {
                  const originalName = bill.origin.replace('PAID: ', '').split(' (')[0];
                  const paidDate = bill.origin.split('(')[1]?.replace(')', '');
                  
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-100"
                      onClick={() => {
                        setSelectedBill(bill);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">{originalName}</p>
                          <p className="text-sm text-gray-500">{paidDate || 'Paid'}</p>
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
      {/* NotificationModal is now handled by PageHeader */}
    </div>
  );
}