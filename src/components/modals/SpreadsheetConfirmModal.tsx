import { Dialog } from '@headlessui/react';
import { FileSpreadsheet, Download } from 'lucide-react';
import { useState } from 'react';
import SpreadsheetUploader from '../spreadsheet/SpreadsheetUploader';

interface SpreadsheetConfirmModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SpreadsheetConfirmModal({ open, onClose }: SpreadsheetConfirmModalProps) {
  const [showUploader, setShowUploader] = useState(false);
  
  const handleConfirm = () => {
    setShowUploader(true);
  };
  
  const handleSkip = () => {
    // Marcar que o usuário optou por não fazer upload
    localStorage.setItem('spreadsheet_imported', 'skipped');
    onClose();
  };
  
  const handleUploaderClose = () => {
    // Marcar que o usuário completou o upload
    localStorage.setItem('spreadsheet_imported', 'completed');
    setShowUploader(false);
    onClose();
  };
  
  if (!open) return null;
  
  if (showUploader) {
    return (
      <Dialog open={open} onClose={() => {}} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-6 relative z-10">
            <SpreadsheetUploader onClose={handleUploaderClose} />
          </div>
        </div>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6 relative z-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
              <FileSpreadsheet className="h-8 w-8 text-purple-600" />
            </div>
            
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              Import Your Financial Data
            </Dialog.Title>
            
            <p className="mt-2 text-gray-600">
              Would you like to import your financial data from a spreadsheet? This will help you get started with your financial planning.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleConfirm}
              className="w-full bg-[#1A1A40] text-white rounded-lg py-3 font-medium hover:bg-[#2A2A50] transition-colors flex items-center justify-center"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Yes, Import Spreadsheet
            </button>
            
            <button
              onClick={handleSkip}
              className="w-full border border-gray-300 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>
            
            <div className="pt-2 text-center">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  // Lógica para baixar o template
                  const link = document.createElement('a');
                  link.href = '/template.xlsx'; // Ajuste o caminho conforme necessário
                  link.download = 'financial_template.xlsx';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="text-purple-600 hover:text-purple-800 inline-flex items-center text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Download Template
              </a>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
