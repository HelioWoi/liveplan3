import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Onboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleImportData = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    try {
      // TODO: Implementar lógica de importação da planilha
      // Por enquanto apenas simula o processo
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Bem-vindo ao LivePlan³
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vamos começar importando seus dados financeiros
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="space-y-2 text-center">
                <div className="text-sm text-gray-600">
                  Arraste uma planilha ou
                </div>
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none"
                >
                  <span>selecione um arquivo</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {file && (
                <div className="mt-4 text-sm text-gray-500">
                  Arquivo selecionado: {file.name}
                </div>
              )}
            </div>

            <button
              onClick={handleImportData}
              disabled={!file || loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Importando...' : 'Importar dados'}
            </button>

            <div className="text-center">
              <button
                onClick={handleSkip}
                className="text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                Pular por enquanto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
