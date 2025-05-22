import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import SpreadsheetUploadModal from '../components/modals/SpreadsheetUploadModal';
import { checkRefreshFlag, clearRefreshFlag, REFRESH_FLAGS } from '../utils/dataRefreshService';
import { Bell, HomeIcon, Clock, BarChart2, FileText } from 'lucide-react';
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

export default function Home() {
  const { user } = useAuthStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [dataRefreshed, setDataRefreshed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Day');
  const [selectedMonth, setSelectedMonth] = useState<'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December'>('April');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);

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
      setShowSpreadsheetModal(true);
    }
  }, [user]);
  
  // Carrega os dados na montagem inicial do componente
  useEffect(() => {
    console.log('Home component mounted - Loading initial data');
    fetchTransactions();
    
    // Listener para atualizações do Weekly Budget
    const handleWeeklyBudgetUpdate = () => {
      console.log('Home detected weekly-budget-updated event');
      fetchTransactions();
      setDataRefreshed(true);
    };
    
    // Adicionar listener para o evento weekly-budget-updated
    window.addEventListener('weekly-budget-updated', handleWeeklyBudgetUpdate);
    
    // Remover listener quando o componente for desmontado
    return () => {
      window.removeEventListener('weekly-budget-updated', handleWeeklyBudgetUpdate);
    };
  }, [fetchTransactions]);

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
    setShowSpreadsheetModal(false);
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
  }, [transactions, localTransactions]);

  // Obter transações limpas e normalizadas
  const cleanTransactions = getCleanTransactions(allTransactions);
  
  // Adicionar console.log para depuração
  console.log('Transações limpas e normalizadas:', cleanTransactions);

  // Cálculo do Total Income - APENAS entradas de receita (Income)
  const totalIncome = cleanTransactions
    .filter(t => t.type === 'income' && t.category === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Cálculo do Total Expenses - APENAS despesas (todas as categorias exceto Income)
  const totalExpenses = cleanTransactions
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
      <SpreadsheetUploadModal open={showSpreadsheetModal} onClose={handleCloseSpreadsheetModal} />
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
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              <Link 
                to="/income" 
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <HomeIcon className="h-6 w-6" />
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
                to="/investments" 
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <span className="text-sm">Investments</span>
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
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            selectedMonth={selectedMonth}
            onPeriodChange={setSelectedPeriod}
            onMonthChange={setSelectedMonth}
          />
          {/* Total Income/Expenses Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm text-gray-500 mb-1">Total Income</h3>
              <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
              <p className="text-xs text-gray-500">All income in the period</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm text-gray-500 mb-1">Total Expenses</h3>
              <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
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