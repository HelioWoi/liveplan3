import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { useWeeklyBudgetStore, WeeklyBudgetEntry } from '../../stores/weeklyBudgetStore';
import { TransactionCategory } from '../../types/transaction';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth?: string;
  selectedYear?: number;
}

export default function AddEntryModal({ isOpen, onClose, selectedMonth, selectedYear }: AddEntryModalProps) {
  const { addEntry } = useWeeklyBudgetStore();
  
  // Obter o mês atual
  const getCurrentMonth = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentDate = new Date();
    return months[currentDate.getMonth()];
  };
  
  // Obter a semana atual com base no dia do mês
  const getCurrentWeek = () => {
    const currentDate = new Date();
    const dayOfMonth = currentDate.getDate();
    
    if (dayOfMonth > 21) {
      return 'Week 4';
    } else if (dayOfMonth > 14) {
      return 'Week 3';
    } else if (dayOfMonth > 7) {
      return 'Week 2';
    } else {
      return 'Week 1';
    }
  };
  
  const [month, setMonth] = useState(selectedMonth || getCurrentMonth());
  const [week, setWeek] = useState(getCurrentWeek());
  const [category, setCategory] = useState('Extra');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [syncToTransactions, setSyncToTransactions] = useState(true);
  const [repeatOption, setRepeatOption] = useState('Does not repeat');
  const [weeklyDay, setWeeklyDay] = useState('Monday');
  const [monthlyWeek, setMonthlyWeek] = useState('First');
  const [monthlyDay, setMonthlyDay] = useState('Monday');
  const [annualDate, setAnnualDate] = useState('');
  
  // Atualizar o mês e a semana sempre que o modal for aberto
  useEffect(() => {
    if (isOpen) {
      // Usar o mês selecionado se disponível, caso contrário usar o mês atual
      setMonth(selectedMonth || getCurrentMonth());
      // Manter a semana selecionada pelo usuário se já tiver sido definida
      if (!week) {
        setWeek(getCurrentWeek());
      }
      console.log('Modal aberto com mês:', selectedMonth || getCurrentMonth(), 'e semana:', week || getCurrentWeek());
    }
  }, [isOpen, selectedMonth]);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const categories = ['Income', 'Fixed', 'Variable', 'Extra', 'Additional'];
  
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
    return futureEntries;
  };
  
  const handleSubmit = () => {
    if (!description || !amount) {
      return;
    }
    
    console.log(`Adicionando entrada para semana: ${week}, mês: ${month}, ano: ${selectedYear || new Date().getFullYear()}`);
    
    // Validar que a semana está corretamente definida
    if (!week || !['Week 1', 'Week 2', 'Week 3', 'Week 4'].includes(week)) {
      console.error('Erro ao adicionar entrada: semana inválida', week);
      setWeek('Week 1'); // Definir uma semana padrão se inválida
    }
    
    // Criar uma nova entrada
    const newEntry: WeeklyBudgetEntry = {
      id: `entry-${Date.now()}`,
      week: week as 'Week 1' | 'Week 2' | 'Week 3' | 'Week 4',
      description,
      amount: parseFloat(amount),
      category: category as TransactionCategory,
      month,
      year: selectedYear || new Date().getFullYear(),
      syncToTransactions: syncToTransactions // Adicionar flag para sincronização com transações
    };
    
    console.log('Nova entrada a ser adicionada:', newEntry);
    
    // Adicionar a entrada ao Weekly Budget
    addEntry(newEntry);
    
    // Se a opção de repetição estiver selecionada, gerar entradas recorrentes
    if (repeatOption !== 'Does not repeat') {
      console.log(`Gerando entradas recorrentes com opção: ${repeatOption}`);
      const recurringEntries = generateRecurringEntries(newEntry);
      console.log(`${recurringEntries.length} entradas recorrentes geradas`);
    }
    
    // Reset form
    setDescription('');
    setAmount('');
    // Não resetar o mês e a semana para manter a seleção do usuário
    // setMonth(getCurrentMonth());
    // setWeek(getCurrentWeek());
    
    // Disparar evento para atualizar a interface
    window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
    
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
                      onChange={(e) => {
                        setSyncToTransactions(e.target.checked);
                        console.log('Sincronização com transações:', e.target.checked ? 'ativada' : 'desativada');
                      }}
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
