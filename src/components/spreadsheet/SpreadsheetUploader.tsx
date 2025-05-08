import { useRef, useState } from 'react';
import { Download, Upload, X, Check, AlertCircle } from 'lucide-react';
import { setAllRefreshFlags } from '../../utils/dataRefreshService';
import { useTransactionStore } from '../../stores/transactionStore';
import { generateTemplateFile } from '../../utils/spreadsheetParser';
import { Transaction } from '../../types/transaction';
import SmartSpreadsheetConverter from './SmartSpreadsheetConverter';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useAuthStore } from '../../stores/authStore';

interface SpreadsheetUploaderProps {
  onClose: () => void;
}

export default function SpreadsheetUploader({ onClose }: SpreadsheetUploaderProps) {
  const { supabase } = useSupabase();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clearTransactions, bulkAddTransactions } = useTransactionStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const downloadTemplate = () => {
    const csv = generateTemplateFile();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'liveplan3_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const handleMappedData = async (mappedData: Partial<Transaction>[]) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Clear existing transactions first
      await clearTransactions();

      // Add new transactions from spreadsheet
      await bulkAddTransactions(mappedData.map(transaction => ({
        date: transaction.date || new Date().toISOString(),
        amount: transaction.amount || 0,
        category: transaction.category || 'Variable',
        type: transaction.type || 'expense',
        origin: transaction.origin || '',
        description: transaction.description || '',
        user_id: user?.id || 'current-user'
      })));

      setSuccess(true);
      setIsProcessing(false);
      // Atualiza perfil, mas apenas fecha o modal após 2 segundos
      if (user) {
        try {
          const { error } = await supabase
            .from('user_profiles')
            .update({ onboarding_completed: true })
            .eq('user_id', user.id);
          if (error) throw error;
        } catch (profileError) {
          console.error('Failed to update profile:', profileError);
        }
      }
      // Fecha o modal e redireciona para a home page após 2 segundos
      setTimeout(() => {
        onClose();
        // Set all refresh flags to ensure data is updated across the entire app
        setAllRefreshFlags();
        // Redirect to home page with cache-busting parameter
        window.location.href = '/?refresh=' + Date.now();
      }, 2000);
    } catch (err) {
      console.error('Error importing transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to import transactions');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Import Transactions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!selectedFile && !success && (
          <>
            <div className="mb-6">
              <button
                onClick={downloadTemplate}
                className="btn btn-outline w-full flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download Template
              </button>
              <p className="text-sm text-gray-500 mt-2">
                You can download our template or use your own spreadsheet format
              </p>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors ${
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {isDragging ? 'Drop your file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
                disabled={isProcessing}
              >
                Select File
              </button>
            </div>
          </>
        )}

        {selectedFile && !success && (
          <SmartSpreadsheetConverter
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            onSuccess={handleMappedData}
          />
        )}

        {success && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Import Successful!
            </h3>
            <p className="text-gray-600">
              Your transactions have been imported successfully. Redirecting...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-error-50 text-error-700 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}