import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useSupabase, SupabaseProvider } from './lib/supabase/SupabaseProvider';
import { Toaster } from 'react-hot-toast';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import BottomNavigation from './components/layout/BottomNavigation';
import QuickActions from './components/layout/QuickActions';
import SwipeableView from './components/layout/SwipeableView';
import { FeedbackProvider } from './components/feedback/FeedbackProvider';
import { syncService } from './utils/syncService';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/signup';
import Onboarding from './pages/onboarding/OnboardingPage';
import PrivateRoute from './components/auth/PrivateRoute';

import NotFound from './pages/NotFound';
import StatementPage from './pages/StatementPage';
import CategoryReport from './pages/CategoryReport';
import TestPage from './pages/TestPage';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import VariablesPage from './pages/VariablesPage';
import InvestmentPortfolioPage from './pages/InvestmentPortfolioPage';
import { PassiveIncome } from './pages/PassiveIncome';
import InvoicesPage from './pages/InvoicesPage';
import TaxPage from './pages/TaxPage';
import HelpPage from './pages/HelpPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import RequestPasswordReset from './pages/auth/RequestPasswordReset';
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import BillsPage from './pages/BillsPage';

function AppContent() {
  const location = useLocation();
  const { session } = useSupabase();
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/terms-of-service', '/privacy-policy'];
  const showBottomNav = !publicRoutes.includes(location.pathname) && session?.user;

  // Função de atualização de dados removida pois não é mais necessária

  // Inicializa o serviço de sincronização quando o componente montar
  useEffect(() => {
    // Configura o serviço para tentar sincronizar transações pendentes a cada 5 minutos
    syncService.setupPeriodicSync(5);
  }, []);

  return (
    <SwipeableView>
      <div className="min-h-screen bg-gray-50">
        {showBottomNav && <QuickActions />}
        <Routes>
          {/* Página de teste para diagnóstico */}
          <Route path="/test" element={<TestPage />} />
          
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<RequestPasswordReset />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Rotas protegidas */}
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <TransactionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/" element={<Login />} />
          <Route path="/test" element={<TestPage />} />
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            }
          />
          <Route
            path="/statement"
            element={
              <PrivateRoute>
                <StatementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/category/:categoryId"
            element={
              <PrivateRoute>
                <CategoryReport />
              </PrivateRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <PrivateRoute>
                <ExpensesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/income"
            element={
              <PrivateRoute>
                <IncomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/variables"
            element={
              <PrivateRoute>
                <VariablesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/investment-portfolio"
            element={
              <PrivateRoute>
                <InvestmentPortfolioPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/simulator"
            element={
              <PrivateRoute>
                <PassiveIncome />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <InvoicesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tax"
            element={
              <PrivateRoute>
                <TaxPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/help"
            element={
              <PrivateRoute>
                <HelpPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <PrivateRoute>
                <InvestmentsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <Goals />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <PrivateRoute>
                <BillsPage />
              </PrivateRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {showBottomNav && <BottomNavigation />}
        <Toaster />
      </div>
    </SwipeableView>
  );
}

export default function App() {
  // Use the PWA update hook to detect and notify about new versions
  usePWAUpdate();
  
  return (
    <SupabaseProvider>
      <FeedbackProvider>
        <AppContent />
      </FeedbackProvider>
    </SupabaseProvider>
  );
}