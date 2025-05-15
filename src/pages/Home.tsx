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

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.category === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  // Calculate formula3 data
  const fixedExpenses = transactions
    .filter(t => t.category === 'Fixed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const variableExpenses = transactions
    .filter(t => t.category === 'Variable')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const investments = transactions
    .filter(t => t.category === 'Investment')
    .reduce((sum, t) => sum + t.amount, 0);

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
              <div className="flex items-center gap-4">
                <span className="font-poppins font-semibold text-2xl tracking-tight text-white select-none">
                  LivePlan<sup className="align-super text-xs ml-0.5">3</sup>
                </span>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative ml-2">
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