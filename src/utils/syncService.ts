import { useTransactionStore } from '../stores/transactionStore';
import { supabase } from '../lib/supabase/supabaseClient';

/**
 * Serviço responsável por sincronizar transações pendentes com o banco de dados
 * quando o usuário estiver autenticado.
 */
export const syncService = {
  /**
   * Verifica se há transações pendentes e tenta sincronizá-las com o banco de dados
   */
  async syncPendingTransactions(): Promise<void> {
    try {
      // Verifica se o usuário está autenticado
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        console.log('Usuário não autenticado. Sincronização adiada.');
        return;
      }

      // Recupera transações pendentes do localStorage
      const storedTransactions = localStorage.getItem('pending_transactions');
      if (!storedTransactions) {
        return; // Não há transações pendentes
      }

      const pendingTransactions = JSON.parse(storedTransactions);
      if (!Array.isArray(pendingTransactions) || pendingTransactions.length === 0) {
        return; // Array vazio ou inválido
      }

      console.log(`Tentando sincronizar ${pendingTransactions.length} transações pendentes...`);

      // Obtém a função addTransaction do store
      const { addTransaction } = useTransactionStore.getState();

      // Processa cada transação pendente
      const successfulSyncs: string[] = [];
      const failedSyncs: Array<{id: string, error: any}> = [];

      for (const transaction of pendingTransactions) {
        try {
          // Remove campos que não pertencem ao modelo de transação
          const { pendingSync, ...cleanTransaction } = transaction;
          
          // Garante que o user_id seja o do usuário autenticado
          cleanTransaction.user_id = user.id;
          
          // Tenta adicionar ao banco de dados
          await addTransaction(cleanTransaction);
          successfulSyncs.push(transaction.id);
        } catch (error) {
          console.error(`Erro ao sincronizar transação ${transaction.id}:`, error);
          failedSyncs.push({ id: transaction.id, error });
        }
      }

      // Remove as transações sincronizadas com sucesso da lista de pendentes
      if (successfulSyncs.length > 0) {
        const remainingTransactions = pendingTransactions.filter(
          (t: any) => !successfulSyncs.includes(t.id)
        );
        localStorage.setItem('pending_transactions', JSON.stringify(remainingTransactions));
        console.log(`${successfulSyncs.length} transações sincronizadas com sucesso!`);
      }

      if (failedSyncs.length > 0) {
        console.log(`${failedSyncs.length} transações falharam na sincronização.`);
      }

      // Notifica a aplicação sobre a sincronização
      window.dispatchEvent(new CustomEvent('transactions-synced', {
        detail: { 
          successCount: successfulSyncs.length,
          failCount: failedSyncs.length
        }
      }));
    } catch (error) {
      console.error('Erro durante a sincronização de transações pendentes:', error);
    }
  },

  /**
   * Configura um intervalo para tentar sincronizar periodicamente
   */
  setupPeriodicSync(intervalMinutes = 5): void {
    // Tenta sincronizar imediatamente
    this.syncPendingTransactions();
    
    // Configura sincronização periódica
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(() => this.syncPendingTransactions(), intervalMs);
    
    // Também tenta sincronizar quando o usuário fizer login
    window.addEventListener('auth-state-changed', () => {
      this.syncPendingTransactions();
    });
  }
};
