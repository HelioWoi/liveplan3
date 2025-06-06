import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import SpreadsheetUploadModal from '../components/modals/SpreadsheetUploadModal';
import NotificationModal from '../components/notifications/NotificationModal';
import { checkRefreshFlag, clearRefreshFlag, REFRESH_FLAGS } from '../utils/dataRefreshService';
import { Bell, Clock, Target, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../components/layout/BottomNavigation';
import WeeklyBudget from '../components/home/WeeklyBudget';
import Formula3 from '../components/home/Formula3';
import TopGoals from '../components/TopGoals';
import UpcomingBills from '../components/home/UpcomingBills';
import TransactionModal from '../components/modals/TransactionModal';
import { useTransactionStore } from '../stores/transactionStore';
import { formatCurrency } from '../utils/formatters';
import PeriodSelector from '../components/common/PeriodSelector';
import AnimatedCard from '../components/common/AnimatedCard';
import { motion } from 'framer-motion';


function Skeleton({ height = 24, width = '50%', className = '' }) {
  return (
    <div
      className={`bg-gray-200 animate-pulse rounded ${className}`}
      style={{ height, width }}
    />
  );
}

export default function Home() {
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  const [dataRefreshed, setDataRefreshed] = useState(false);
  // Define types for period selection
  type Period = 'Day' | 'Week' | 'Month' | 'Year';
  type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
  type WeekNumber = '1' | '2' | '3' | '4' | '5';
  
  // Get current date information
  const getCurrentMonth = (): Month => {
    const months: Month[] = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[new Date().getMonth()];
  };
  
  const getCurrentYear = (): string => {
    return new Date().getFullYear().toString();
  };
  
  const getCurrentWeek = (): WeekNumber => {
    const date = new Date();
    const dayOfMonth = date.getDate();
    // Calculate which week of the month we're in (1-5)
    const weekNumber = Math.ceil(dayOfMonth / 7);
    return weekNumber > 5 ? '5' : weekNumber.toString() as WeekNumber;
  };
  
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Week');
  const [selectedMonth, setSelectedMonth] = useState<Month>(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [selectedWeek, setSelectedWeek] = useState<WeekNumber>(getCurrentWeek());
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já fez upload da planilha
    const imported = localStorage.getItem('spreadsheet_imported');
    
    // Verificar se é um usuário novo (criado há menos de 1 hora)
    const isNewUser = user && new Date().getTime() - new Date(user.created_at).getTime() < 60 * 60 * 1000;
    
    // Verificar se está vindo de um login (usando o parâmetro na URL)
    const isFromLogin = window.location.search.includes('fromLogin=true');
    
    // Mostrar o modal apenas se for um novo usuário E não tiver feito upload ainda E estiver vindo do login
    if (!imported && isNewUser && isFromLogin) {
      console.log('Showing spreadsheet modal for new user first login');
      setIsSpreadsheetModalOpen(true);
    }
  }, [user]);
  
  // Listener para atualizações do Weekly Budget
  const handleWeeklyBudgetUpdate = () => {
    console.log('Home detected weekly-budget-updated event');
    fetchTransactions();
    setDataRefreshed(true);
  };

  // Carrega os dados na montagem inicial do componente
  useEffect(() => {
    console.log('Home component mounted - Loading initial data');
    fetchTransactions();
    
    // Adicionar listener para o evento weekly-budget-updated
    window.addEventListener('weekly-budget-updated', handleWeeklyBudgetUpdate);
    
    // Remover listener quando o componente for desmontado
    return () => {
      window.removeEventListener('weekly-budget-updated', handleWeeklyBudgetUpdate);
    };
  }, []);

  // Check for data refresh flags and reload data as needed
  useEffect(() => {
    const needsRefresh = checkRefreshFlag(REFRESH_FLAGS.ALL) || 
                         checkRefreshFlag(REFRESH_FLAGS.TRANSACTIONS) || 
                         checkRefreshFlag(REFRESH_FLAGS.WEEKLY_BUDGET);
    
    if (needsRefresh && !dataRefreshed) {
      console.log('Refreshing Home page data...');
      // Fetch fresh data
      fetchTransactions();
      
      // Clear the flags after refresh
      clearRefreshFlag(REFRESH_FLAGS.TRANSACTIONS);
      clearRefreshFlag(REFRESH_FLAGS.WEEKLY_BUDGET);
      
      // Mark as refreshed to prevent multiple refreshes
      setDataRefreshed(true);
    }
  }, [fetchTransactions, dataRefreshed]);

  // Callback para fechar e marcar como importado
  const handleCloseSpreadsheetModal = () => {
    setIsSpreadsheetModalOpen(false);
    localStorage.setItem('spreadsheet_imported', 'true');
  };

  // Obter transações locais do Weekly Budget
  const [localTransactions, setLocalTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Carregar transações locais do localStorage
    const storedTransactions = localStorage.getItem('local_transactions');
    if (storedTransactions) {
      setLocalTransactions(JSON.parse(storedTransactions));
    }

    // Adicionar listener para atualizar quando novas transações forem adicionadas
    const handleLocalTransactionAdded = () => {
      const updatedTransactions = localStorage.getItem('local_transactions');
      if (updatedTransactions) {
        setLocalTransactions(JSON.parse(updatedTransactions));
      }
    };

    // Adicionar listener para atualizar quando transações forem deletadas
    const handleTransactionDeleted = () => {
      // Atualizar transações locais
      const updatedTransactions = localStorage.getItem('local_transactions');
      if (updatedTransactions) {
        setLocalTransactions(JSON.parse(updatedTransactions));
      }
      // Atualizar transações do banco de dados
      fetchTransactions();
    };

    window.addEventListener('local-transaction-added', handleLocalTransactionAdded);
    window.addEventListener('transaction-deleted', handleTransactionDeleted);
    window.addEventListener('weekly-budget-entry-deleted', handleTransactionDeleted);
    
    return () => {
      window.removeEventListener('local-transaction-added', handleLocalTransactionAdded);
      window.removeEventListener('transaction-deleted', handleTransactionDeleted);
      window.removeEventListener('weekly-budget-entry-deleted', handleTransactionDeleted);
    };
  }, []);

  // Limpar transações duplicadas e inconsistentes
  const getCleanTransactions = (allTransactions: any[]) => {
    // Primeiro, remover duplicatas por ID
    const uniqueMap = new Map();
    
    // Processar as transações em ordem reversa (mais recentes primeiro)
    // para garantir que fiquemos com as versões mais recentes
    [...allTransactions].reverse().forEach(t => {
      // Verificar se já existe uma transação com este ID ou com metadados relacionados
      const isDuplicate = uniqueMap.has(t.id) || 
        // Verificar se existe alguma transação com o mesmo sourceEntryId nos metadados
        Array.from(uniqueMap.values()).some((existingT: any) => 
          existingT.metadata && 
          t.metadata && 
          existingT.metadata.sourceEntryId === t.metadata.sourceEntryId
        );
      
      if (!isDuplicate) {
        // Normalizar a transação para garantir consistência
        const normalizedTransaction = {
          ...t,
          // Garantir que o tipo seja consistente com a categoria
          type: t.category === 'Income' ? 'income' : 'expense',
          // Garantir que o valor seja positivo
          amount: Math.abs(Number(t.amount || 0))
        };
        uniqueMap.set(t.id, normalizedTransaction);
      }
    });
    
    return Array.from(uniqueMap.values());
  };

  // Combinar transações do banco de dados e locais
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  useEffect(() => {
    const combined = [...transactions, ...localTransactions];
    setAllTransactions(combined);
    
    // Disparar evento para notificar outros componentes que dependem das transações
    window.dispatchEvent(new CustomEvent('transactions-updated'));
    
    // Forçar atualização dos cálculos no dashboard
    setRefreshKey(prev => prev + 1);
  }, [transactions, localTransactions]);
  
  // Chave para forçar re-render quando necessário
  const [refreshKey, setRefreshKey] = useState(0);

  // Obter transações limpas e normalizadas
  const cleanTransactions = getCleanTransactions(allTransactions);
  
  // Usar refreshKey para garantir que os cálculos sejam atualizados
  useEffect(() => {
    console.log('Dashboard atualizado com novas transações:', cleanTransactions.length);
  }, [refreshKey, cleanTransactions.length]);

  // Converter nome do mês para número (0-11)
  const getMonthNumber = (monthName: string): number => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  };

  // Filtrar transações com base no período selecionado
  const filteredTransactionsByPeriod = cleanTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const today = new Date();
    const selectedMonthIndex = getMonthNumber(selectedMonth);
    const selectedYearNumber = parseInt(selectedYear);
    const selectedWeekNumber = parseInt(selectedWeek);
    
    // Verificar se o ano é 2025 ou posterior
    if (transactionDate.getFullYear() < 2025) {
      return false; // Não mostrar dados anteriores a 2025
    }
    
    switch (selectedPeriod) {
      case 'Day':
        // Filtrar apenas as transações do dia atual
        return (
          transactionDate.getDate() === today.getDate() &&
          transactionDate.getMonth() === today.getMonth() &&
          transactionDate.getFullYear() === today.getFullYear()
        );
      case 'Week':
        // Filtrar pela semana selecionada no mês e ano selecionados
        const dayOfMonth = transactionDate.getDate();
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        return transactionDate.getMonth() === selectedMonthIndex && 
               transactionDate.getFullYear() === selectedYearNumber &&
               weekOfMonth === selectedWeekNumber;
      case 'Month':
        // Usar o mês e ano selecionados
        return (
          transactionDate.getMonth() === selectedMonthIndex &&
          transactionDate.getFullYear() === selectedYearNumber
        );
      case 'Year':
        // Usar o ano selecionado
        return transactionDate.getFullYear() === selectedYearNumber;
      default:
        return true;
    }
  });

  // Cálculo do Total Income - APENAS entradas de receita (Income) do período selecionado
  const totalIncome = filteredTransactionsByPeriod
    .filter(t => t.type === 'income' && t.category === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Cálculo do Total Expenses - APENAS despesas (todas as categorias exceto Income) do período selecionado
  const totalExpenses = filteredTransactionsByPeriod
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  // Calculate formula3 data
  const fixedExpenses = cleanTransactions
    .filter((t: any) => t.category === 'Fixed' && t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
    
  const variableExpenses = cleanTransactions
    .filter((t: any) => t.category === 'Variable' && t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
    
  const investments = cleanTransactions
    .filter((t: any) => t.category === 'Investment' && t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  // Usar o total de gastos como base para os targets
  const totalExpensesAndInvestments = fixedExpenses + variableExpenses + investments;
  const targetTotal = Math.max(totalExpensesAndInvestments, totalIncome);

  // Garantir que todos os valores sejam positivos para cálculos percentuais
  const safeFixedExpenses = Math.max(0, fixedExpenses);
  const safeVariableExpenses = Math.max(0, variableExpenses);
  const safeInvestments = Math.max(0, investments);
  
  const formula3Data = {
    fixed: {
      current: fixedExpenses, // Manter o valor original para exibição
      target: targetTotal * 0.5,
      percentage: targetTotal ? (safeFixedExpenses / targetTotal) * 100 : 0
    },
    variable: {
      current: variableExpenses, // Manter o valor original para exibição
      target: targetTotal * 0.3,
      percentage: targetTotal ? (safeVariableExpenses / targetTotal) * 100 : 0
    },
    investments: {
      current: investments, // Manter o valor original para exibição
      target: targetTotal * 0.2,
      percentage: targetTotal ? (safeInvestments / targetTotal) * 100 : 0
    }
  };

  return (
    <>
      {/* Spreadsheet Upload Modal */}
      <SpreadsheetUploadModal
        open={isSpreadsheetModalOpen}
        onClose={handleCloseSpreadsheetModal}
      />
      
      {/* Notification Modal */}
      <NotificationModal 
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)} 
      />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50"
      >
        <div className="w-full bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white pt-8 pb-8">
          <div className="max-w-3xl mx-auto px-4">
            <TransactionModal 
              isOpen={isTransactionModalOpen}
              onClose={() => setIsTransactionModalOpen(false)}
            />
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-400 text-sm">Welcome Back</p>
                <h1 className="text-2xl font-bold">{user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</h1>
              </div>
              <div className="flex items-center">
                <span className="font-poppins italic text-2xl tracking-tight text-white select-none mr-3">
                  LivePlan<sup className="align-super text-xs ml-0.5 italic">3</sup>
                </span>
                <button 
                  onClick={() => setIsNotificationModalOpen(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs text-white bg-red-500 rounded-full">
                    2
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              <Link 
                to="/income" 
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
                  <img src="/icon income.png" alt="Income" className="h-6 w-6 object-contain" />
                </div>
                <span className="text-sm">Income</span>
              </Link>

              <Link 
                to="/expenses" 
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <span className="text-sm">Expenses</span>
              </Link>

              <Link 
                to="/goals" 
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                <span className="text-sm">Goals</span>
              </Link>

              <Link 
                to="/statement" 
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-sm">Statement</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 space-y-6 mt-6">
          <div className="bg-white rounded-xl p-4 mb-6 shadow-card">
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              selectedWeek={selectedWeek}
              onPeriodChange={setSelectedPeriod}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              onWeekChange={setSelectedWeek}
              useShortMonthNames={true}
            />
          </div>
          {/* Total Income/Expenses Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm text-gray-500 mb-1">Total Income</h3>

              {isLoading ? (
                <Skeleton height={28} />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
              )}
              
              <p className="text-xs text-gray-500">All income in the period</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm text-gray-500 mb-1">Total Expenses</h3>

              {isLoading ? (
                <Skeleton height={28} />
              ) : (
                <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
              )}

              <p className="text-xs text-gray-500">All expenses in the period</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-sm">
              <WeeklyBudget />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm">
              <Formula3 data={formula3Data} />
            </div>

            <AnimatedCard>
              <TopGoals />
            </AnimatedCard>

            {/* RecentTransactions component removed */}

            <div className="bg-white rounded-lg shadow-sm">
              <UpcomingBills />
            </div>
          </div>

          <BottomNavigation />
        </div>
      </motion.div>
    </>
  );
}