import { useState, useEffect } from 'react';

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
  
  // Mock banks for development
  const mockBanks: Bank[] = [
    {
      id: 'AU00000',
      name: 'Commonwealth Bank',
      logo: 'https://cdn.basiq.io/bank-logos/AU00000.svg',
      country: 'AU'
    },
    {
      id: 'AU00001',
      name: 'ANZ Bank',
      logo: 'https://cdn.basiq.io/bank-logos/AU00001.svg',
      country: 'AU'
    },
    {
      id: 'AU00002',
      name: 'Westpac',
      logo: 'https://cdn.basiq.io/bank-logos/AU00002.svg',
      country: 'AU'
    },
    {
      id: 'AU00003',
      name: 'NAB',
      logo: 'https://cdn.basiq.io/bank-logos/AU00003.svg',
      country: 'AU'
    },
    {
      id: 'AU00004',
      name: 'St. George Bank',
      logo: 'https://cdn.basiq.io/bank-logos/AU00004.svg',
      country: 'AU'
    },
    {
      id: 'AU00005',
      name: 'Bank of Queensland',
      logo: 'https://cdn.basiq.io/bank-logos/AU00005.svg',
      country: 'AU'
    },
    {
      id: 'AU00006',
      name: 'Bendigo Bank',
      logo: 'https://cdn.basiq.io/bank-logos/AU00006.svg',
      country: 'AU'
    },
    {
      id: 'AU00007',
      name: 'ING Direct',
      logo: 'https://cdn.basiq.io/bank-logos/AU00007.svg',
      country: 'AU'
    }
  ];

  // Carregar a lista de bancos
  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        // TODO: Substituir por chamada real à API quando o backend estiver pronto
        // const bankList = await basiqService.getBanks();
        // setBanks(bankList);
        
        // Por enquanto, usamos dados simulados
        setTimeout(() => {
          setBanks(mockBanks);
          setLoading(false);
        }, 500); // Simular tempo de carregamento
      } catch (err: any) {
        setError(err.message || 'Falha ao carregar bancos');
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
            className="border border-gray-200 rounded-lg p-4 flex flex-col items-center hover:border-[#1A1A40] hover:shadow-md cursor-pointer transition-all"
          >
            <div className="w-16 h-16 flex items-center justify-center mb-3">
              <img 
                src={bank.logo} 
                alt={`${bank.name} logo`} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  // Fallback for when the image fails to load
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Bank';
                }}
              />
            </div>
            <span className="text-center font-medium text-gray-800">{bank.name}</span>
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
