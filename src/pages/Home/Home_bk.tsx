import { useState, useEffect, useMemo } from "react";
import { Bell, Clock, Target, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import type { Month, Period, WeekNumber } from "../@types/period-selection";

import { useAuthStore } from "../../stores/authStore";
import SpreadsheetUploadModal from "../../components/modals/SpreadsheetUploadModal";
import NotificationModal from "../../components/notifications/NotificationModal";
import BottomNavigation from "../../components/layout/BottomNavigation";
import WeeklyBudget from "../../components/home/WeeklyBudget";
import Formula3 from "../../components/home/Formula3";
import TopGoals from "../../components/TopGoals";
import UpcomingBills from "../../components/home/UpcomingBills";
import TransactionModal from "../../components/modals/TransactionModal";
import { formatCurrency } from "../../utils/formatters";
import PeriodSelector from "../../components/common/PeriodSelector";
import AnimatedCard from "../../components/common/AnimatedCard";
import { Skeleton } from "../../components";
import { supabase } from "../../lib/supabase/supabaseClient";

import { MONTHS_FULL } from "../../constants";

const getCurrentMonth = () => MONTHS_FULL[new Date().getMonth()];
const getCurrentYear = (): string => new Date().getFullYear().toString();
const getCurrentWeek = (): WeekNumber => {
  const date = new Date();
  const dayOfMonth = date.getDate();
  const weekNumber = Math.ceil(dayOfMonth / 7);
  return weekNumber > 5 ? "5" : (weekNumber.toString() as WeekNumber);
};

function Home() {
  const { user } = useAuthStore();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // State para as transações filtradas do banco
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State agrupado para o período selecionado
  const [selectedPeriodState, setSelectedPeriodState] = useState<{
    period: Period;
    month: Month;
    year: string;
    week: WeekNumber;
  }>({
    period: "Week",
    month: getCurrentMonth(),
    year: getCurrentYear(),
    week: getCurrentWeek(),
  });

  function updateSelectedPeriod(partial: Partial<typeof selectedPeriodState>) {
    setSelectedPeriodState((prev) => ({ ...prev, ...partial }));
  }

  useEffect(() => {
    window.addEventListener("transactions-updated", fetchTransactionsByPeriod);

    return () => {
      window.removeEventListener(
        "transactions-updated",
        fetchTransactionsByPeriod
      );
    };
  }, []);

  // Buscar transações do banco conforme o período selecionado
  async function fetchTransactionsByPeriod() {
    if (!user?.id) return;
    setIsLoading(true);

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);

    const { period, month, year, week } = selectedPeriodState;

    // Montar os filtros de data conforme o período selecionado
    let startDate: Date | undefined = undefined;
    let endDate: Date | undefined = undefined;

    if (period === "Year" && year) {
      startDate = new Date(Number(year), 0, 1);
      endDate = new Date(Number(year), 11, 31, 23, 59, 59, 999);
    } else if (period === "Month" && month && year) {
      const monthIndex = MONTHS_FULL.indexOf(month);
      startDate = new Date(Number(year), monthIndex, 1);
      endDate = new Date(Number(year), monthIndex + 1, 0, 23, 59, 59, 999);
    } else if (period === "Week" && week && month && year) {
      const monthIndex = MONTHS_FULL.indexOf(month);

      const weekNumber = Number(week);
      const startDay = (weekNumber - 1) * 7 + 1;
      startDate = new Date(Number(year), monthIndex, startDay);
      endDate = new Date(
        Number(year),
        monthIndex,
        startDay + 6,
        23,
        59,
        59,
        999
      );

      // Corrigir para não passar do fim do mês
      const lastDayOfMonth = new Date(Number(year), monthIndex + 1, 0);
      if (endDate > lastDayOfMonth) endDate = lastDayOfMonth;
    } else if (period === "Day") {
      const today = new Date();
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
      );
    }

    if (startDate !== undefined && endDate !== undefined) {
      query = query
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString());
    }

    const { data, error } = await query;
    setIsLoading(false);

    if (error) {
      setFilteredTransactions([]);
      return;
    }

    setFilteredTransactions(data || []);
  }

  // Sempre que selectedPeriodState mudar, faz nova requisição ao banco
  useEffect(() => {
    fetchTransactionsByPeriod();
    // eslint-disable-next-line
  }, [user?.id, selectedPeriodState]);

  // Limpar transações duplicadas e inconsistentes
  const getCleanTransactions = (allTransactions: any[]) => {
    const uniqueMap = new Map();
    [...allTransactions].reverse().forEach((t) => {
      const isDuplicate =
        uniqueMap.has(t.id) ||
        Array.from(uniqueMap.values()).some(
          (existingT: any) =>
            existingT.metadata &&
            t.metadata &&
            existingT.metadata.sourceEntryId === t.metadata.sourceEntryId
        );
      if (!isDuplicate) {
        const normalizedTransaction = {
          ...t,
          type: t.category === "Income" ? "income" : "expense",
          amount: Math.abs(Number(t.amount || 0)),
        };
        uniqueMap.set(t.id, normalizedTransaction);
      }
    });
    return Array.from(uniqueMap.values());
  };

  // Obter transações limpas e normalizadas
  const cleanTransactions = useMemo(
    () => getCleanTransactions(filteredTransactions),
    [filteredTransactions]
  );

  // Cálculo do Total Income - APENAS entradas de receita (Income) do período selecionado
  const totalIncome = useMemo(
    () =>
      cleanTransactions
        .filter((t) => t.type === "income" && t.category === "Income")
        .reduce((sum, t) => sum + t.amount, 0),
    [cleanTransactions]
  );

  // Cálculo do Total Expenses - APENAS despesas (todas as categorias exceto Income) do período selecionado
  const totalExpenses = useMemo(
    () =>
      cleanTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [cleanTransactions]
  );

  // Calculate formula3 data
  const fixedExpenses = cleanTransactions
    .filter((t: any) => t.category === "Fixed" && t.type === "expense")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const variableExpenses = cleanTransactions
    .filter((t: any) => t.category === "Variable" && t.type === "expense")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const investments = cleanTransactions
    .filter((t: any) => t.category === "Investment" && t.type === "expense")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalExpensesAndInvestments =
    fixedExpenses + variableExpenses + investments;
  const targetTotal = Math.max(totalExpensesAndInvestments, totalIncome);

  const safeFixedExpenses = Math.max(0, fixedExpenses);
  const safeVariableExpenses = Math.max(0, variableExpenses);
  const safeInvestments = Math.max(0, investments);

  const formula3Data = {
    fixed: {
      current: fixedExpenses,
      target: targetTotal * 0.5,
      percentage: targetTotal ? (safeFixedExpenses / targetTotal) * 100 : 0,
    },
    variable: {
      current: variableExpenses,
      target: targetTotal * 0.3,
      percentage: targetTotal ? (safeVariableExpenses / targetTotal) * 100 : 0,
    },
    investments: {
      current: investments,
      target: targetTotal * 0.2,
      percentage: targetTotal ? (safeInvestments / targetTotal) * 100 : 0,
    },
  };

  // Callback para fechar e marcar como importado
  const handleCloseSpreadsheetModal = () => {
    setIsSpreadsheetModalOpen(false);
    localStorage.setItem("spreadsheet_imported", "true");
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
                <h1 className="text-2xl font-bold">
                  {user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </h1>
              </div>
              <div className="flex items-center">
                <span className="font-poppins italic text-2xl tracking-tight text-white select-none mr-3">
                  LivePlan
                  <sup className="align-super text-xs ml-0.5 italic">3</sup>
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
                  <img
                    src="/icon income.png"
                    alt="Income"
                    className="h-6 w-6 object-contain"
                  />
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
              selectedPeriod={selectedPeriodState.period}
              selectedMonth={selectedPeriodState.month}
              selectedYear={selectedPeriodState.year}
              selectedWeek={selectedPeriodState.week}
              onPeriodChange={(period) => updateSelectedPeriod({ period })}
              onMonthChange={(month) => updateSelectedPeriod({ month })}
              onYearChange={(year) => updateSelectedPeriod({ year })}
              onWeekChange={(week) => updateSelectedPeriod({ week })}
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
                <p className="text-xl font-bold">
                  {formatCurrency(totalIncome)}
                </p>
              )}
              <p className="text-xs text-gray-500">All income in the period</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm text-gray-500 mb-1">Total Expenses</h3>
              {isLoading ? (
                <Skeleton height={28} />
              ) : (
                <p className="text-xl font-bold">
                  {formatCurrency(totalExpenses)}
                </p>
              )}
              <p className="text-xs text-gray-500">
                All expenses in the period
              </p>
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

export default Home;
