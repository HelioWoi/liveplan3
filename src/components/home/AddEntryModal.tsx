import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useWeeklyBudgetStore } from '../../stores/weeklyBudgetStore';
import { WeeklyBudgetEntry } from '../../stores/weeklyBudgetStore';
import { TransactionCategory, TransactionType } from '../../types/transaction';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth?: string;
  selectedYear?: number;
}

export default function AddEntryModal({ isOpen, onClose, selectedMonth = 'April', selectedYear }: AddEntryModalProps) {
  const { addEntry } = useWeeklyBudgetStore();
  const [month, setMonth] = useState(selectedMonth);
  const [week, setWeek] = useState('Week 1');
  const [category, setCategory] = useState('Extra');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [syncToTransactions, setSyncToTransactions] = useState(true);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const categories = ['Income', 'Investment', 'Fixed', 'Variable', 'Extra', 'Additional'];

  const handleSubmit = async () => {
    if (!description || !amount) {
      return;
    }

    const entry: WeeklyBudgetEntry = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category: category as TransactionCategory,
      week: week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
      month,
      year: selectedYear || new Date().getFullYear()
    };

    // Adiciona a entrada ao orçamento semanal
    addEntry(entry);
    
    // Se o usuário quiser sincronizar com transações, cria apenas uma transação local
    if (syncToTransactions) {
      try {
        // Converte a semana para uma data real
        const getWeekNumber = (weekString: string) => {
          return parseInt(weekString.replace('Week ', ''));
        };
        
        const getMonthNumber = (monthName: string) => {
          const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          return months.indexOf(monthName);
        };
        
        // Cria uma data a partir da semana, mês e ano
        const weekNum = getWeekNumber(entry.week);
        const monthNum = getMonthNumber(entry.month);
        const year = entry.year;
        
        // Calcula o dia aproximado com base na semana (7 dias por semana)
        const day = (weekNum - 1) * 7 + 1;
        const entryDate = new Date(year, monthNum, day);
        
        // Log para debug
        console.log(`Criando transação para: Semana ${weekNum}, Mês ${monthNum} (${entry.month}), Ano ${year}`);
        console.log(`Data calculada: ${entryDate.toLocaleDateString()}`);
        console.log(`Mês da data: ${entryDate.getMonth()}, Ano da data: ${entryDate.getFullYear()}`);
        
        // Garantir que a data está correta
        if (entryDate.getMonth() !== monthNum) {
          console.warn('Correção de mês necessária!');
          entryDate.setMonth(monthNum);
          console.log(`Data corrigida: ${entryDate.toLocaleDateString()}`);
        }
        
        // Cria uma transação local e salva no localStorage
        const storedTransactions = localStorage.getItem('local_transactions');
        const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
        
        const newTransaction = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          date: entryDate.toISOString(),
          amount: entry.amount,
          category: entry.category,
          type: entry.amount > 0 ? 'income' as TransactionType : 'expense' as TransactionType,
          description: entry.description,
          origin: 'Weekly Budget',
          user_id: 'local-user'
        };
        
        transactions.push(newTransaction);
        localStorage.setItem('local_transactions', JSON.stringify(transactions));
        
        // Dispara um evento para notificar outras partes do app
        window.dispatchEvent(new CustomEvent('local-transaction-added', { 
          detail: newTransaction 
        }));
        
        console.log('Transação local criada com sucesso:', newTransaction);
      } catch (error) {
        console.error('Erro ao criar transação local:', error);
      }
    }

    // Reset form
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-6">
                  Add New Entry
                </Dialog.Title>

                <div className="space-y-4">
                  {/* Month Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month
                    </label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                    >
                      {months.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>



                  {/* Week Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Week
                    </label>
                    <select
                      value={week}
                      onChange={(e) => setWeek(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                    >
                      {weeks.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                    />
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2.5 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="syncTransactions"
                      checked={syncToTransactions}
                      onChange={(e) => setSyncToTransactions(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="syncTransactions" className="ml-2 block text-sm text-gray-600">
                      Also add as a transaction (will appear in Expenses page)
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 justify-center rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                  >
                    Add Entry
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
