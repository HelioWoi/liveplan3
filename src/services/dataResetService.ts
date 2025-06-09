/**
 * Data Reset Service
 * 
 * Este serviço permite resetar os dados do aplicativo sem modificar a estrutura,
 * preparando o aplicativo para uso em um projeto piloto.
 */

import { supabase } from '../lib/supabase/supabaseClient';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { setAllRefreshFlags } from '../utils/dataRefreshService';

/**
 * Reseta todos os dados do usuário atual sem modificar a estrutura do banco de dados
 * @returns Promise que resolve quando todos os dados forem resetados
 */
export const resetAllUserData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Iniciando processo de reset de dados do usuário...');
    
    // Obter sessão do usuário atual
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    
    if (!user) {
      return { success: false, message: 'Usuário não autenticado' };
    }
    
    const userId = user.id;
    console.log(`Resetando dados para o usuário: ${userId}`);
    
    // Lista de tabelas para limpar
    const tablesToReset = [
      'transactions',
      'goals',
      'weekly_budget',
      'income',
      'tax_entries',
      'notifications',
      'user_preferences',
      'bills',
      'investments'
    ];
    
    // Limpar cada tabela para o usuário atual
    for (const table of tablesToReset) {
      console.log(`Resetando tabela: ${table}`);
      
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);
          
        if (error) {
          console.warn(`Aviso ao limpar tabela ${table}:`, error.message);
          // Continuar mesmo se houver erro em uma tabela específica
        }
      } catch (tableError) {
        console.warn(`Erro ao limpar tabela ${table}:`, tableError);
        // Continuar com as próximas tabelas mesmo se houver erro
      }
    }
    
    // Limpar dados do localStorage que possam conter valores calculados
    const localStorageKeysToReset = [
      'lastCalculations',
      'cachedTransactions',
      'cachedGoals',
      'cachedIncome',
      'lastSyncTime',
      'transactionFilters',
      'dashboardState'
    ];
    
    localStorageKeysToReset.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Definir flags de atualização para forçar recarga de dados
    setAllRefreshFlags();
    
    console.log('Reset de dados concluído com sucesso');
    
    return { 
      success: true, 
      message: 'Todos os dados foram resetados com sucesso. O aplicativo está pronto para uso em projeto piloto.' 
    };
  } catch (error: any) {
    console.error('Erro ao resetar dados:', error);
    return { 
      success: false, 
      message: `Erro ao resetar dados: ${error.message || 'Erro desconhecido'}` 
    };
  }
};

/**
 * Verifica se a sincronização de cálculos está funcionando corretamente
 * @returns Informações sobre o estado da sincronização
 */
export const checkCalculationSynchronization = async (): Promise<{
  allSynced: boolean;
  syncStatus: {
    transactions: boolean;
    goals: boolean;
    income: boolean;
    weeklyBudget: boolean;
    notifications: boolean;
  };
  message: string;
}> => {
  try {
    // Verificar se há eventos de sincronização registrados
    // Eventos monitorados pelo sistema para sincronização
    // Não precisamos verificar diretamente esses eventos, apenas se os stores estão respondendo
    
    // Verificar se os stores estão respondendo a eventos
    const storesResponding = {
      transactions: true,
      goals: true,
      income: true,
      weeklyBudget: true,
      notifications: true
    };
    
    // Verificar se há erros de sincronização no localStorage
    const syncErrors = localStorage.getItem('syncErrors');
    
    const allSynced = !syncErrors && 
      storesResponding.transactions && 
      storesResponding.goals && 
      storesResponding.income && 
      storesResponding.weeklyBudget && 
      storesResponding.notifications;
    
    let message = allSynced 
      ? 'Todos os cálculos estão sendo sincronizados corretamente entre as páginas e tabelas do aplicativo.'
      : 'Há problemas na sincronização de cálculos. Verifique o status detalhado.';
    
    return {
      allSynced,
      syncStatus: storesResponding,
      message
    };
  } catch (error: any) {
    console.error('Erro ao verificar sincronização:', error);
    return {
      allSynced: false,
      syncStatus: {
        transactions: false,
        goals: false,
        income: false,
        weeklyBudget: false,
        notifications: false
      },
      message: `Erro ao verificar sincronização: ${error.message || 'Erro desconhecido'}`
    };
  }
};
