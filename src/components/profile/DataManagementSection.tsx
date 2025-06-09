import React, { useState } from 'react';
import { Archive, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import DataResetModal from '../modals/DataResetModal';

const DataManagementSection: React.FC = () => {
  const [showPartialResetModal, setShowPartialResetModal] = useState(false);
  const [showFullResetModal, setShowFullResetModal] = useState(false);
  const [showFiscalYearModal, setShowFiscalYearModal] = useState(false);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(new Date().getFullYear());
  
  // Anos fiscais disponíveis (normalmente viriam de um serviço)
  const fiscalYears = [
    { year: 2025, transactions: 342, complete: true },
    { year: 2024, transactions: 156, complete: false },
    { year: 2023, transactions: 0, complete: false }
  ];
  
  // Abrir modal para arquivar ano fiscal
  const handleArchiveFiscalYear = (year: number) => {
    setSelectedFiscalYear(year);
    setShowFiscalYearModal(true);
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <RefreshCw className="h-5 w-5 mr-2 text-primary-600" />
        Data Management
      </h2>
      
      {/* Fiscal Years */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Fiscal Years</h3>
          <Link 
            to="/fiscal-years" 
            className="text-sm flex items-center text-primary-600 hover:text-primary-800"
          >
            View All Archives <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Manage your data by fiscal year. Archive previous years to keep your dashboard organised.
        </p>
        
        <div className="space-y-3">
          {fiscalYears.map((fiscalYear) => (
            <div 
              key={fiscalYear.year} 
              className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{fiscalYear.year}</span>
                  {fiscalYear.complete && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      Complete
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {fiscalYear.transactions} transactions
                </p>
              </div>
              
              <button
                onClick={() => handleArchiveFiscalYear(fiscalYear.year)}
                className="text-sm flex items-center px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={fiscalYear.transactions === 0}
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Linha divisória */}
      <div className="border-t border-gray-200 my-6"></div>
      
      {/* Danger Zone */}
      <div>
        <div className="flex items-center mb-3">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          <h3 className="text-lg font-medium text-red-500">Danger Zone</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          These actions are irreversible. Use with caution.
        </p>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-1">Partial Reset</h4>
            <p className="text-sm text-gray-500 mb-3">
              Clears transactions and budgets while keeping goals and settings
            </p>
            <button 
              onClick={() => setShowPartialResetModal(true)}
              className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
            >
              Partial Reset
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-1">Full Reset</h4>
            <p className="text-sm text-gray-500 mb-3">
              Clears all financial data while keeping only your account
            </p>
            <button 
              onClick={() => setShowFullResetModal(true)}
              className="text-sm px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            >
              Full Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Modais */}
      <DataResetModal 
        open={showPartialResetModal}
        onClose={() => setShowPartialResetModal(false)}
        resetType="partial"
      />
      
      <DataResetModal 
        open={showFullResetModal}
        onClose={() => setShowFullResetModal(false)}
        resetType="full"
      />
      
      <DataResetModal 
        open={showFiscalYearModal}
        onClose={() => setShowFiscalYearModal(false)}
        resetType="fiscal-year"
        fiscalYear={selectedFiscalYear}
      />
    </div>
  );
};

export default DataManagementSection;
