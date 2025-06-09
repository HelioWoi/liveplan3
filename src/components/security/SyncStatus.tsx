import { useEffect, useState } from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { syncService } from '../../services/syncService';

/**
 * Component that displays the current synchronization status
 */
export default function SyncStatus() {
  const [status, setStatus] = useState({ pending: 0, syncing: 0, completed: 0, failed: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Initialize sync service
    syncService.initialize();

    // Update status every 2 seconds
    const interval = setInterval(() => {
      const currentStatus = syncService.getSyncStatus();
      setStatus(currentStatus);
      
      // Show the component if there are pending or syncing items
      setVisible(currentStatus.pending > 0 || currentStatus.syncing > 0 || currentStatus.failed > 0);
      
      // Auto-hide after 5 seconds if everything is synced
      if (currentStatus.pending === 0 && currentStatus.syncing === 0 && currentStatus.failed === 0) {
        setTimeout(() => setVisible(false), 5000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-50 max-w-xs">
      <div className="flex items-center">
        {status.syncing > 0 ? (
          <RefreshCw className="h-5 w-5 text-blue-500 animate-spin mr-2" />
        ) : status.failed > 0 ? (
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        ) : (
          <Check className="h-5 w-5 text-green-500 mr-2" />
        )}
        
        <div>
          {status.syncing > 0 ? (
            <p className="text-sm font-medium">Sincronizando dados...</p>
          ) : status.failed > 0 ? (
            <p className="text-sm font-medium text-red-600">Falha na sincronização</p>
          ) : status.pending > 0 ? (
            <p className="text-sm font-medium">Aguardando sincronização</p>
          ) : (
            <p className="text-sm font-medium text-green-600">Dados sincronizados</p>
          )}
          
          <p className="text-xs text-gray-500">
            {status.pending > 0 && `${status.pending} pendente${status.pending > 1 ? 's' : ''}`}
            {status.pending > 0 && status.failed > 0 && ', '}
            {status.failed > 0 && `${status.failed} falha${status.failed > 1 ? 's' : ''}`}
          </p>
        </div>
        
        {status.failed > 0 && (
          <button 
            className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            onClick={() => syncService.processSyncQueue()}
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
