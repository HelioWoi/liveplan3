import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSupabase, SupabaseProvider } from './lib/supabase/SupabaseProvider';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import BottomNavigation from './components/layout/BottomNavigation';
import QuickActions from './components/layout/QuickActions';
import AddEntryModal from './components/home/AddEntryModal';
import SwipeableView from './components/layout/SwipeableView';
import { FeedbackProvider } from './components/feedback/FeedbackProvider';
import { syncService } from './utils/syncService';
import { clearOldBasiqApiKey } from './utils/basiqUtils';
// Importações de segurança - versão simplificada
import SimpleSyncStatus from './components/security/SimpleSyncStatus';
import SimplePrivacyDashboard from './components/security/SimplePrivacyDashboard';
import { useSimpleSecurityState } from './hooks/useSimpleSecurityState';
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
import NotificationsPage from './pages/NotificationsPage';
import RequestPasswordReset from './pages/auth/RequestPasswordReset';
import ResetPassword from './pages/auth/ResetPassword';
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import BillsPage from './pages/BillsPage';
import BasiqTestPage from './pages/BasiqTestPage';
import BankOnboardingPage from './pages/BankOnboardingPage';
import OnboardingChoicePage from './pages/OnboardingChoicePage';
import BasiqApiConfig from './pages/BasiqApiConfig';
import BasiqDirectTest from './pages/BasiqDirectTest';
import TestBasiq from './pages/TestBasiq';
import SplashPage from './pages/SplashPage';

function AppContent() {
  const location = useLocation();
  const { session } = useSupabase();
  const publicRoutes = ['/', '/splash', '/login', '/signup', '/forgot-password', '/reset-password', '/terms-of-service', '/privacy-policy'];
  const onboardingRoutes = ['/onboarding-choice', '/bank-onboarding', '/onboarding'];
  const noQuickActionsRoutes = ['/income']; // Routes where the + button should be hidden
  const showBottomNav = !publicRoutes.includes(location.pathname) && !onboardingRoutes.includes(location.pathname) && session?.user;
  const showQuickActions = showBottomNav && !noQuickActionsRoutes.includes(location.pathname);

  // Estado para controlar o modal Add New Entry
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);
  
  // Estado para controlar os componentes de segurança - versão simplificada
  const {
    showPrivacyDashboard,
    setShowPrivacyDashboard,
    securityLevel,
    setSecurityLevel,
    dataProtectionEnabled,
    setDataProtectionEnabled
  } = useSimpleSecurityState();
  
  // Função para abrir o modal Add New Entry
  const handleOpenAddEntryModal = () => {
    setIsAddEntryModalOpen(true);
  };
  
  // Função para fechar o modal Add New Entry
  const handleCloseAddEntryModal = () => {
    setIsAddEntryModalOpen(false);
  };

  // Inicializa o serviço de sincronização e limpa a chave antiga da API Basiq quando o componente montar
  useEffect(() => {
    // Limpar a chave antiga da API Basiq do localStorage
    clearOldBasiqApiKey();
    console.log('Chave antiga da API Basiq removida');
    
    // Configura o serviço para tentar sincronizar transações pendentes a cada 5 minutos
    syncService.setupPeriodicSync(5);
  }, []);

  return (
    <SwipeableView>
      <div className="min-h-screen bg-gray-50">
        {/* Modal Add New Entry global */}
        <AddEntryModal 
          isOpen={isAddEntryModalOpen} 
          onClose={handleCloseAddEntryModal} 
          selectedMonth={new Date().toLocaleString('default', { month: 'long' })} 
          selectedYear={new Date().getFullYear()}
        />
        
        {/* Privacy Dashboard - versão simplificada */}
        <SimplePrivacyDashboard 
          isOpen={showPrivacyDashboard} 
          onClose={() => setShowPrivacyDashboard(false)}
          securityLevel={securityLevel}
          setSecurityLevel={setSecurityLevel}
          dataProtectionEnabled={dataProtectionEnabled}
          setDataProtectionEnabled={setDataProtectionEnabled}
        />
        
        {/* Sync Status Indicator - versão simplificada */}
        {session?.user && <SimpleSyncStatus />}
        
        {showQuickActions && <QuickActions onOpenAddEntryModal={handleOpenAddEntryModal} />}
        <Routes>
          {/* Página de teste para diagnóstico */}
          <Route path="/test" element={<TestPage />} />
          
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password#:token" element={<ResetPassword />} />
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
          <Route path="/" element={<SplashPage />} />
          <Route path="/splash" element={<SplashPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route
            path="/basiq-test"
            element={
              <PrivateRoute>
                <BasiqTestPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/basiq-direct-test"
            element={
              <PrivateRoute>
                <BasiqDirectTest />
              </PrivateRoute>
            }
          />
          <Route
            path="/test-basiq"
            element={
              <TestBasiq />
            }
          />
          <Route
            path="/basiq-config"
            element={
              <PrivateRoute>
                <BasiqApiConfig />
              </PrivateRoute>
            }
          />
          <Route
            path="/onboarding-choice"
            element={
              <PrivateRoute>
                <OnboardingChoicePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/bank-onboarding"
            element={
              <PrivateRoute>
                <BankOnboardingPage />
              </PrivateRoute>
            }
          />
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
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage />
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
        <ToastContainer />
        
        {/* Security indicator - versão simplificada */}
        {session?.user && securityLevel === 'high' && dataProtectionEnabled && (
          <div className="fixed bottom-16 left-4 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center z-40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Seguro
          </div>
        )}
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