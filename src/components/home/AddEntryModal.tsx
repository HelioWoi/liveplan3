import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useWeeklyBudgetStore, WeeklyBudgetEntry } from '../../stores/weeklyBudgetStore';
import { TransactionCategory } from '../../types/transaction';

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
  const [repeatOption, setRepeatOption] = useState('Does not repeat');
  const [weeklyDay, setWeeklyDay] = useState('Monday');
  const [monthlyWeek, setMonthlyWeek] = useState('First');
  const [monthlyDay, setMonthlyDay] = useState('Monday');
  const [annualDate, setAnnualDate] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const categories = ['Income', 'Investment', 'Fixed', 'Variable', 'Extra', 'Additional'];
  
  const repeatOptions = [
    'Does not repeat',
    'Daily',
    'Weekly',
    'Monthly',
    'Annually',
    'Every weekday'
  ];
  
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const monthlyWeeks = ['First', 'Second', 'Third', 'Fourth', 'Last'];

  // Função para gerar entradas recorrentes com base na opção selecionada
  const generateRecurringEntries = (baseEntry: WeeklyBudgetEntry) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const futureEntries: WeeklyBudgetEntry[] = [];
    
    // Determinar quantas entradas futuras gerar com base na opção de repetição
    switch (repeatOption) {
      case 'Daily':
        // Gerar entradas para os próximos 30 dias
        for (let i = 1; i <= 30; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i);
          
          const futureMonth = futureDate.toLocaleString('default', { month: 'long' });
          const futureYear = futureDate.getFullYear();
          const dayOfMonth = futureDate.getDate();
          
          // Determinar a semana com base no dia do mês
          let futureWeek = 'Week 1';
          if (dayOfMonth > 21) {
            futureWeek = 'Week 4';
          } else if (dayOfMonth > 14) {
            futureWeek = 'Week 3';
          } else if (dayOfMonth > 7) {
            futureWeek = 'Week 2';
          }
          
          futureEntries.push({
            ...baseEntry,
            id: `${baseEntry.id}-daily-${i}`,
            week: futureWeek as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
            month: futureMonth,
            year: futureYear
          });
        }
        break;
        
      case 'Weekly':
        // Gerar entradas para as próximas 12 semanas
        for (let i = 1; i <= 12; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + (i * 7));
          
          const futureMonth = futureDate.toLocaleString('default', { month: 'long' });
          const futureYear = futureDate.getFullYear();
          const dayOfMonth = futureDate.getDate();
          
          // Determinar a semana com base no dia do mês
          let futureWeek = 'Week 1';
          if (dayOfMonth > 21) {
            futureWeek = 'Week 4';
          } else if (dayOfMonth > 14) {
            futureWeek = 'Week 3';
          } else if (dayOfMonth > 7) {
            futureWeek = 'Week 2';
          }
          
          futureEntries.push({
            ...baseEntry,
            id: `${baseEntry.id}-weekly-${i}`,
            week: futureWeek as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
            month: futureMonth,
            year: futureYear
          });
        }
        break;
        
      case 'Monthly':
        // Gerar entradas para os próximos 12 meses
        for (let i = 1; i <= 12; i++) {
          const futureDate = new Date();
          futureDate.setMonth(futureDate.getMonth() + i);
          
          const futureMonth = futureDate.toLocaleString('default', { month: 'long' });
          const futureYear = futureDate.getFullYear();
          
          futureEntries.push({
            ...baseEntry,
            id: `${baseEntry.id}-monthly-${i}`,
            month: futureMonth,
            year: futureYear
          });
        }
        break;
        
      case 'Annually':
        // Gerar entradas para os próximos 5 anos
        for (let i = 1; i <= 5; i++) {
          const futureYear = currentYear + i;
          
          futureEntries.push({
            ...baseEntry,
            id: `${baseEntry.id}-annual-${i}`,
            year: futureYear
          });
        }
        break;
        
      case 'Every weekday':
        // Gerar entradas para os próximos 30 dias úteis (seg-sex)
        let daysAdded = 0;
        let dayCounter = 1;
        
        while (daysAdded < 30) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + dayCounter);
          dayCounter++;
          
          // Verificar se é dia útil (1-5 são seg-sex, 0 e 6 são dom e sáb)
          const dayOfWeek = futureDate.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;
          
          daysAdded++;
          
          const futureMonth = futureDate.toLocaleString('default', { month: 'long' });
          const futureYear = futureDate.getFullYear();
          const dayOfMonth = futureDate.getDate();
          
          // Determinar a semana com base no dia do mês
          let futureWeek = 'Week 1';
          if (dayOfMonth > 21) {
            futureWeek = 'Week 4';
          } else if (dayOfMonth > 14) {
            futureWeek = 'Week 3';
          } else if (dayOfMonth > 7) {
            futureWeek = 'Week 2';
          }
          
          futureEntries.push({
            ...baseEntry,
            id: `${baseEntry.id}-weekday-${daysAdded}`,
            week: futureWeek as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
            month: futureMonth,
            year: futureYear
          });
        }
        break;
    }
    
    // Adicionar todas as entradas futuras geradas
    futureEntries.forEach(entry => {
      addEntry(entry);
    });
    
    console.log(`Geradas ${futureEntries.length} entradas recorrentes para ${repeatOption}`);
  };

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
    
    // Se a opção de repetição for diferente de 'Does not repeat', gerar entradas futuras
    if (repeatOption !== 'Does not repeat') {
      generateRecurringEntries(entry);
    }
    
    // Não precisamos criar a transação aqui, pois o weeklyBudgetStore já faz isso
    // A criação duplicada estava causando problemas de cálculo
    console.log('Entrada adicionada ao Weekly Budget. A transação será criada pelo weeklyBudgetStore.');

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
                  
                  {/* Repeat Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repeat
                    </label>
                    <select
                      value={repeatOption}
                      onChange={(e) => setRepeatOption(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                    >
                      {repeatOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Weekly Options - Show when Weekly is selected */}
                  {repeatOption === 'Weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day of week
                      </label>
                      <select
                        value={weeklyDay}
                        onChange={(e) => setWeeklyDay(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                      >
                        {weekDays.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Monthly Options - Show when Monthly is selected */}
                  {repeatOption === 'Monthly' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Week of month
                        </label>
                        <select
                          value={monthlyWeek}
                          onChange={(e) => setMonthlyWeek(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                        >
                          {monthlyWeeks.map((week) => (
                            <option key={week} value={week}>
                              {week}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Day of week
                        </label>
                        <select
                          value={monthlyDay}
                          onChange={(e) => setMonthlyDay(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                        >
                          {weekDays.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {/* Annual Options - Show when Annually is selected */}
                  {repeatOption === 'Annually' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={annualDate}
                        onChange={(e) => setAnnualDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
                      />
                    </div>
                  )}
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
