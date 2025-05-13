import { useState, useEffect } from 'react';
import basiqService from '../../services/basiqService';

// Interface for available banks
interface Bank {
  id: string;
  name: string;
  logo: string;
  country: string;
}

// Component props
interface BankSelectorProps {
  onBankSelected: (bankId: string) => void;
  className?: string;
}

export default function BankSelector({ onBankSelected, className = '' }: BankSelectorProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lista de bancos padrão vazia
  const defaultBanks: Bank[] = [];

  // Carregar a lista de bancos
  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        console.log('Buscando lista de bancos...');
        // Usar o serviço Basiq para buscar bancos reais
        const bankList = await basiqService.getBanks();
        
        if (bankList && bankList.length > 0) {
          console.log(`${bankList.length} bancos encontrados`);
          // Mapear para o formato esperado pelo componente
          const formattedBanks: Bank[] = bankList.map(bank => ({
            id: bank.id,
            name: bank.name,
            logo: bank.logo || `https://cdn.basiq.io/bank-logos/${bank.id}.svg`,
            country: bank.country
          }));
          setBanks(formattedBanks);
        } else {
          console.log('Nenhum banco encontrado, usando lista vazia');
          setBanks(defaultBanks);
        }
      } catch (err: any) {
        console.error('Erro ao buscar bancos:', err);
        setError(err.message || 'Falha ao carregar bancos');
        // Fallback para lista vazia em caso de erro
        console.log('Usando lista vazia como fallback');
        setBanks(defaultBanks);
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, []);

  // Filtrar bancos com base no termo de pesquisa
  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle bank click
  const handleBankClick = (bankId: string) => {
    onBankSelected(bankId);
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1A1A40]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 text-red-700 rounded-lg ${className}`}>
        <p className="font-medium">Error loading banks</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <label htmlFor="bank-search" className="block text-sm font-medium text-gray-700 mb-1">
          Search for your bank
        </label>
        <input
          type="text"
          id="bank-search"
          placeholder="Enter your bank name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A1A40] focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredBanks.map(bank => (
          <div 
            key={bank.id}
            onClick={() => handleBankClick(bank.id)}
            className="border border-gray-200 rounded-xl p-5 flex flex-col items-center hover:border-[#1A1A40] hover:shadow-lg hover:bg-blue-50 cursor-pointer transition-all duration-200 transform hover:-translate-y-1"
          >
            <div className="w-20 h-20 flex items-center justify-center mb-4 bg-gray-50 rounded-full p-3 border border-gray-100">
              <img 
                src={bank.logo} 
                alt={`${bank.name} logo`} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  // Fallback for when the image fails to load
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bank.name)}&background=f0f9ff&color=3b82f6&bold=true&size=64`;
                }}
              />
            </div>
            <span className="text-center font-semibold text-gray-800 mt-1">{bank.name}</span>
            <span className="text-xs text-gray-500 mt-1">{bank.country === 'AU' ? 'Australia' : bank.country}</span>
          </div>
        ))}

        {filteredBanks.length === 0 && (
          <div className="col-span-full p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">No banks found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
