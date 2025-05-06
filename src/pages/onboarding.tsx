import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useOnboardingStore } from '../stores/onboardingStore';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { completeOnboarding } = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImportData = async () => {
    setLoading(true);
    setError('');

    try {
      // Aqui você pode implementar a lógica de importação de dados
      await completeOnboarding(user?.id);
      navigate('/');
    } catch (err) {
      setError('Erro ao importar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSetup = async () => {
    setLoading(true);
    setError('');

    try {
      await completeOnboarding(user?.id);
      navigate('/');
    } catch (err) {
      setError('Erro ao configurar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Bem-vindo ao LivePlan³!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Como você gostaria de começar?
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleImportData}
            disabled={loading}
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? 'Importando...' : 'Importar dados financeiros'}
          </button>

          <div className="text-center">
            <span className="text-gray-500">ou</span>
          </div>

          <button
            onClick={handleManualSetup}
            disabled={loading}
            className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? 'Configurando...' : 'Configurar manualmente'}
          </button>
        </div>

        <div className="text-sm text-center text-gray-500">
          <p>
            Você pode importar seus dados financeiros de outros aplicativos ou
            começar do zero configurando manualmente.
          </p>
        </div>
      </div>
    </div>
  );
}
