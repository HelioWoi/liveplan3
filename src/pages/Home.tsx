import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import SpreadsheetUploadModal from '../components/modals/SpreadsheetUploadModal';
import { Bell, HomeIcon, Clock, BarChart2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../components/layout/BottomNavigation';
import PageHeader from '../components/layout/PageHeader';
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
  const { transactions } = useTransactionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Day');
  const [selectedMonth, setSelectedMonth] = useState<'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December'>('April');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);

  useEffect(() => {
    // Exemplo: checar no localStorage ou perfil se já fez upload
    const imported = localStorage.getItem('spreadsheet_imported');
    if (!imported) {
      setShowSpreadsheetModal(true);
    }
  }, []);

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

  const formula3Data = {
    fixed: {
      current: fixedExpenses,
      target: targetTotal * 0.5,
      percentage: targetTotal ? (fixedExpenses / targetTotal) * 100 : 0
    },
    variable: {
      current: variableExpenses,
      target: targetTotal * 0.3,
      percentage: targetTotal ? (variableExpenses / targetTotal) * 100 : 0
    },
    investments: {
      current: investments,
      target: targetTotal * 0.2,
      percentage: targetTotal ? (investments / targetTotal) * 100 : 0
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
        <PageHeader title="Home" showBackButton={false} />
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          <TransactionModal 
            isOpen={isTransactionModalOpen}
            onClose={() => setIsTransactionModalOpen(false)}
          />
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white">
            <div className="px-4 pt-6 pb-8">
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

        <div className="px-4 space-y-6 mt-6">
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
      </div>
    </motion.div>
    </>
  );
}