import { Calendar, PlusCircle, HelpCircle, Edit, Trash2, X, ArrowRight, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWeeklyBudgetStore } from '../../stores/weeklyBudgetStore';
import { formatCurrency } from '../../utils/formatters';
import AddEntryModal from './AddEntryModal';
import { useAuthStore } from '../../stores/authStore';
import { CATEGORY_DESCRIPTIONS, YEARS, MONTHS, MONTHS_SHORT, CATEGORIES } from '../../constants';

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

const getCurrentMonth = () => MONTHS_SHORT[new Date().getMonth()];
const getCurrentYear = () => new Date().getFullYear();

const getCurrentWeek = () => {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const weekNumber = Math.ceil(dayOfMonth / 7);
  return `Week ${weekNumber}`;
};

export default function WeeklyBudget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<any>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [entryToMove, setEntryToMove] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Month');
  const [showMonths, setShowMonths] = useState(true); // Show months by default
  const [showYears, setShowYears] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [detailsData, setDetailsData] = useState<{category: string, week: string, entries: any[]}>({category: '', week: '', entries: []});

  // Estado para controlar a entrada selecionada para movimentação
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  
  const { entries, currentYear, setCurrentYear, fetchEntries, updateEntry, deleteEntry, moveEntryToWeek, syncWithTransactions } = useWeeklyBudgetStore();

  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      fetchEntries(user.id);
    }
  }, [user?.id]);

  // Forçar atualização quando novas transações forem adicionadas
  useEffect(() => {
    // Função para sincronizar com transações quando eventos forem disparados
    const handleTransactionsUpdated = () => {
      console.log('WeeklyBudget: Detectada atualização de transações');
      syncWithTransactions();
    };
    
    // Adicionar listeners para eventos de atualização de transações
    window.addEventListener('transactions-updated', handleTransactionsUpdated);
    window.addEventListener('transaction-added', handleTransactionsUpdated);
    
    // Limpar listeners ao desmontar o componente
    return () => {
      window.removeEventListener('transactions-updated', handleTransactionsUpdated);
      window.removeEventListener('transaction-added', handleTransactionsUpdated);
    };
  }, [syncWithTransactions]);
  
  // Função para selecionar uma entrada para mover
  const handleSelectEntry = (entryId: string) => {
    if (selectedEntry === entryId) {
      // Se clicar no mesmo item novamente, alterna a exibição das opções
      setShowOptions(!showOptions);
    } else {
      // Se clicar em um novo item, seleciona e mostra as opções
      setSelectedEntry(entryId);
      setShowOptions(true);
    }
  };
  
  // Função para mover a entrada selecionada para uma semana
  const handleMoveToWeek = (targetWeek: string) => {
    if (selectedEntry) {
      moveEntryToWeek(selectedEntry, targetWeek);
      setSelectedEntry(null); // Limpa a seleção após mover
      setShowOptions(false); // Esconde as opções após mover
      
      // Notificar outras partes do app que os dados foram atualizados
      // Sem sincronização automática para evitar adição de valores aleatórios
      window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
    }
  };
  
  // Função para editar uma entrada
  const handleEditEntry = () => {
    if (selectedEntry) {
      const entry = entries.find(e => e.id === selectedEntry);

      if (entry) {
        setEntryToEdit(entry);
        setIsEditModalOpen(true);
      }
    }
  };

   // Função para salvar as edições
  const handleSaveEdit = (updatedEntry: any) => {
    if (entryToEdit) {
      updateEntry(entryToEdit.id, updatedEntry);
      setIsEditModalOpen(false);
      setEntryToEdit(null);
      setSelectedEntry(null);
      setShowOptions(false);
      
      // Notificar outras partes do app que os dados foram atualizados
      // Sem sincronização automática para evitar adição de valores aleatórios
      window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
    }
  };
  
  // Função para abrir o modal de confirmação de deleção
  const handleDeleteEntry = (selectedEntry: any) => {
    if (selectedEntry) {
      setEntryToDelete(selectedEntry);
      setIsDeleteModalOpen(true);
    }
  };
  
  // Função para confirmar a deleção
  const confirmDelete = () => {
    if (entryToDelete) {
      deleteEntry(entryToDelete);
      setEntryToDelete(null);
      setIsDeleteModalOpen(false);
      setSelectedEntry(null);
      setShowOptions(false);
      
      // Notificar outras partes do app que os dados foram atualizados
      // Sem sincronização automática para evitar adição de valores aleatórios
      // window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
    }
  };
  
 
  
  // Nota: As funções de sincronização manual e limpeza foram removidas
  // pois agora a sincronização é feita automaticamente via eventos

  // Initialize with current year and sync with transactions
  useEffect(() => {
    setCurrentYear(getCurrentYear());
    // Show months by default on mount
    setShowMonths(true);
    setShowYears(false);
    
    // Não sincronizar automaticamente ao montar o componente
    // Isso evita a adição de valores aleatórios
    window.dispatchEvent(new CustomEvent('weekly-budget-updated'));
  }, []);
  
  // Função para renderizar as opções de período
  const renderPeriodOptions = () => {
    return (
      <>
        {/* Replace 'Month' with current month and keep 'Year' */}
        <button
          onClick={() => {
            setSelectedPeriod('Month');
            setShowMonths(!showMonths);
            setShowYears(false);
          }}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            selectedPeriod === 'Month'
              ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
              : 'text-gray-700 hover:text-purple-600'
          }`}
        >
          {selectedMonth} {/* Show current month instead of 'Month' */}
        </button>
        <button
          onClick={() => {
            setSelectedPeriod('Year');
            // Don't clear the selected month
            // setSelectedMonth('');
            setShowYears(!showYears);
            setShowMonths(false);
          }}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            selectedPeriod === 'Year'
              ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
              : 'text-gray-700 hover:text-purple-600'
          }`}
        >
          Year
        </button>
      </>
    );
  };
  
  const getWeekBalance = (week: string) => {
    // Filtrar entradas para a semana, mês e ano atual
    const weekEntries = entries.filter(entry => {
      const month = MONTHS.find(month => month.short === selectedMonth);

      return entry.week === week && 
      entry.month === month?.short &&
      entry.year === currentYear
    });

    // Calcular o Income (receita) - sempre positivo
    const income = weekEntries
      .filter(entry => entry.category === 'Income')
      .reduce((total, entry) => total + Math.abs(entry.amount), 0);
    
    // Calcular as despesas (Fixed, Variable, Extra, Additional)
    // Convertemos para valores positivos para facilitar o cálculo
    const expenses = weekEntries
      .filter(entry => ['Fixed', 'Variable', 'Extra', 'Additional'].includes(entry.category))
      .reduce((total, entry) => total + Math.abs(entry.amount), 0);
    
    // Calcular o saldo: Income - expenses
    // Subtraímos todas as despesas do income conforme solicitado
    return income - expenses;
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center p-0 text-purple-600 bg-transparent hover:text-purple-700 focus:outline-none"
          >
            <PlusCircle className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 mb-4">
          {renderPeriodOptions()}
        </div>

        {selectedPeriod === 'Year' && showYears && (
          <div className="flex gap-2">
            {YEARS.map(year => (
              <button
                key={year}
                onClick={() => {
                  setCurrentYear(year);
                  setShowYears(false);
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
        )}

        {selectedPeriod === 'Month' && showMonths && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
            {MONTHS.map(({ full, short }) => (
              <button
                key={short}
                onClick={() => {
                  setSelectedMonth(short);
                }}
                className={`py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                  selectedMonth === short
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'border border-gray-200 text-gray-700 hover:border-purple-200'
                }`}
              >
                {short}
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
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 
                      ${week === getCurrentWeek() ? 'bg-purple-50' : 'bg-gray-50'} 
                      ${selectedEntry ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                    onClick={() => selectedEntry && handleMoveToWeek(week)}
                  >
                    {week}
                    {selectedEntry && (
                      <span className="ml-1 text-blue-600 text-xs">→</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {CATEGORIES.map(category => (
                <tr key={category} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {category}
                      <Tooltip content={CATEGORY_DESCRIPTIONS[category] || ''}>
                        <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                      </Tooltip>
                    </div>
                  </td>
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => {
                    const isCurrentWeek = week === getCurrentWeek();
                    
                    // Encontrar todas as entradas desta categoria e semana
                    const weekEntries = entries.filter(entry => {
                      const month = MONTHS.find(month => month.short === selectedMonth);
                    
                      return entry.week === week && 
                        entry.category === category && 
                        entry.month === month?.short &&
                        entry.year === currentYear
                      }
                    );
                    
                    return (
                      <td 
                        key={`${category}-${week}`}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${isCurrentWeek ? 'bg-purple-50' : ''} ${selectedEntry && 'hover:bg-blue-50 cursor-pointer'}`}
                        onClick={() => selectedEntry && handleMoveToWeek(week)}
                      >
                        {weekEntries.length > 0 ? (
                          <div>
                            {weekEntries.length === 1 ? (
                              // Single entry - show as before
                              <div key={weekEntries[0].id} className="relative">
                                <div
                                  onClick={() => handleSelectEntry(weekEntries[0].id)}
                                  className={`mb-1 p-1 rounded cursor-pointer 
                                    ${selectedEntry === weekEntries[0].id ? 'bg-blue-100 shadow-lg' : 'hover:bg-gray-100'} 
                                    ${(category === 'Fixed' || category === 'Variable' || category === 'Extra' || category === 'Additional') ? 'text-yellow-600' : 
                                      weekEntries[0].amount > 0 ? 'text-green-600' : 'text-red-600'}`}
                                >
                                  {formatCurrency(weekEntries[0].amount)}
                                </div>

                                {/* Options for edit and delete */}
                                {selectedEntry === weekEntries[0].id && showOptions && (
                                  <div className="absolute right-0 top-0 bg-white shadow-lg rounded-md p-1 z-10 flex space-x-1">
                                    <button 
                                      onClick={handleEditEntry}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                      title="Edit"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteEntry(selectedEntry)}
                                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              // Multiple entries - show total with info button
                              <div className="relative">
                                <div 
                                  className={`mb-1 p-1 rounded cursor-pointer hover:bg-gray-100 flex items-center justify-between
                                    ${(category === 'Fixed' || category === 'Variable' || category === 'Extra' || category === 'Additional') ? 'text-yellow-600' : 
                                      weekEntries.reduce((total, entry) => total + entry.amount, 0) > 0 ? 'text-green-600' : 'text-red-600'}`}
                                  onClick={() => {
                                    setDetailsData({
                                      category,
                                      week,
                                      entries: weekEntries
                                    });
                                    setIsDetailsModalOpen(true);
                                  }}
                                >
                                  <div className="flex items-center">
                                    <span>{formatCurrency(weekEntries.reduce((total, entry) => total + entry.amount, 0))}</span>
                                    <span className="ml-2 text-gray-500 text-xs">({weekEntries.length})</span>
                                  </div>
                                  <Info size={16} className="text-blue-500 ml-1" />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">{formatCurrency(0)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Balance
                </td>
                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => {
                  const balance = getWeekBalance(week);
                  const isCurrentWeek = week === getCurrentWeek();
                  return (
                    <td key={`balance-${week}`} className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isCurrentWeek ? 'bg-purple-100' : ''}`}>
                      <span className={`${balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {formatCurrency(balance)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        {/* Removed the bottom panel as requested */}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && entryToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Entry</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const description = (form.elements.namedItem('description') as HTMLInputElement).value;
              const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
              const category = (form.elements.namedItem('category') as HTMLSelectElement).value;
              const uuid_weekly_budget = (form.elements.namedItem('uuid_weekly_budget') as HTMLInputElement).value;
              
              handleSaveEdit({
                description,
                amount,
                category,
                uuid_weekly_budget
              });
            }}>
              <div className="mb-4">
                <input
                  type="hidden"
                  name="uuid_weekly_budget"
                  value={entryToEdit.id}
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input 
                  type="text" 
                  name="description"
                  defaultValue={entryToEdit.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input 
                  type="number" 
                  name="amount"
                  step="0.01"
                  defaultValue={entryToEdit.amount}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  name="category"
                  defaultValue={entryToEdit.category}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Income">Income</option>
                  <option value="Fixed">Fixed Expense</option>
                  <option value="Variable">Variable Expense</option>
                  <option value="Extra">Extra</option>
                  <option value="Additional">Additional</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEntryToEdit(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this entry?</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Details Modal for Multiple Entries */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{detailsData.category} - {detailsData.week}</h2>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              {detailsData.entries.map(entry => (
                <div key={entry.id} className="mb-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{entry.description}</span>
                    <span className={`font-semibold ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setEntryToEdit(entry);
                        setIsEditModalOpen(true);
                        setIsDetailsModalOpen(false);
                      }}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded flex items-center"
                    >
                      <Edit size={14} className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setEntryToMove(entry.id);
                        setIsMoveModalOpen(true);
                        setIsDetailsModalOpen(false);
                      }}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded flex items-center"
                    >
                      <ArrowRight size={14} className="mr-1" /> Move
                    </button>
                    <button
                      onClick={() => {
                        setIsDeleteModalOpen(true);
                        setIsDetailsModalOpen(false);
                      }}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded flex items-center"
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className={`font-bold text-lg ${detailsData.entries.reduce((total, entry) => total + entry.amount, 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(detailsData.entries.reduce((total, entry) => total + entry.amount, 0))}
                </span>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Move Entry Modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Move to Week</h2>
            <p className="mb-6 text-gray-600">Select the week you want to move this entry to:</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => (
                <button
                  key={week}
                  onClick={() => {
                    if (entryToMove) {
                      moveEntryToWeek(entryToMove, week);
                      setEntryToMove(null);
                      setIsMoveModalOpen(false);
                    }
                  }}
                  className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md flex items-center justify-center"
                >
                  <ArrowRight size={16} className="mr-2" />
                  {week}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setIsMoveModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedMonth={selectedMonth}
        selectedYear={currentYear}
      />
    </div>
  );
}