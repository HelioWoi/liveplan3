import { useNotificationStore } from '../../stores/notificationStore';

// Tipos de notificações que o serviço pode gerar
export type NotificationType = 'budget' | 'goal' | 'transaction' | 'insight';

// Interface para os dados específicos de cada tipo de notificação
interface BudgetNotificationData {
  category: string;
  percentage: number;
  threshold: number;
}

interface GoalNotificationData {
  goalId: string;
  goalTitle: string;
  percentage: number;
  milestone: number;
}

interface TransactionNotificationData {
  transactionId?: string;
  amount: number;
  date: string;
  category?: string;
}

interface InsightNotificationData {
  type: 'saving' | 'spending' | 'investment';
  percentage: number;
  category?: string;
  period: 'week' | 'month' | 'year';
}

// Tipo união para todos os dados de notificação
export type NotificationData = 
  | BudgetNotificationData 
  | GoalNotificationData 
  | TransactionNotificationData 
  | InsightNotificationData;

class NotificationService {
  // Verifica limites de orçamento e gera notificações quando necessário
  checkBudgetLimits(category: string, percentage: number): void {
    // Usar o store diretamente pode causar problemas fora de componentes React
    // Esta é uma versão simplificada para demonstração
    console.log(`[Notification] Alerta de Orçamento: ${percentage}% para ${category}`);
    
    // Em uma implementação real, usaríamos um método mais seguro para acessar o store
    try {
      const { addNotification } = useNotificationStore.getState();
      
      // Verificar se o orçamento está próximo ou excedeu o limite
      if (percentage >= 80 && percentage < 100) {
        addNotification({
          title: 'Alerta de Orçamento',
          message: `Você já utilizou ${percentage.toFixed(0)}% do seu orçamento para ${category}. Considere reduzir seus gastos nesta categoria.`,
          type: 'budget',
          data: {
            category,
            percentage,
            threshold: 80
          }
        });
      } else if (percentage >= 100) {
        addNotification({
          title: 'Limite de Orçamento Excedido',
          message: `Atenção! Você excedeu o orçamento para ${category}. Considere revisar seus gastos para manter o controle financeiro.`,
          type: 'budget',
          data: {
            category,
            percentage,
            threshold: 100
          }
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar notificação:', error);
    }
  }

  // Notifica sobre progresso em metas
  notifyGoalProgress(goalId: string, goalTitle: string, percentage: number): void {
    console.log(`[Notification] Progresso de Meta: ${percentage}% para "${goalTitle}"`);    
    
    try {
      const { addNotification } = useNotificationStore.getState();
      
      // Notificar quando atingir marcos importantes
      const milestones = [25, 50, 75, 100];
      const milestone = milestones.find(m => percentage >= m && percentage < m + 25);
      
      if (milestone) {
        let message = '';
        
        if (milestone === 100) {
          message = `Parabéns! Você atingiu 100% da sua meta "${goalTitle}". Você alcançou seu objetivo!`;
        } else {
          message = `Você atingiu ${milestone}% da sua meta "${goalTitle}". Continue assim!`;
        }
        
        addNotification({
          title: 'Progresso de Meta',
          message,
          type: 'goal',
          data: {
            goalId,
            goalTitle,
            percentage,
            milestone
          }
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar notificação de meta:', error);
    }
  }

  // Notifica sobre transações importantes
  notifyTransaction(amount: number, description: string, date: string, category?: string): void {
    console.log(`[Notification] Transação Importante: R$${amount.toFixed(2)} para "${description}"`);    
    
    try {
      const { addNotification } = useNotificationStore.getState();
      
      // Notificar sobre transações grandes (acima de R$500)
      if (amount > 500) {
        addNotification({
          title: 'Transação Importante',
          message: `Uma transação de R$${amount.toFixed(2)} para "${description}" foi registrada.`,
          type: 'transaction',
          data: {
            amount,
            date,
            category
          }
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar notificação de transação:', error);
    }
  }

  // Gera insights baseados nos dados financeiros
  generateInsight(type: 'saving' | 'spending' | 'investment', percentage: number, category?: string): void {
    console.log(`[Notification] Insight: ${type} ${percentage}% ${category || ''}`);    
    
    try {
      const { addNotification } = useNotificationStore.getState();
      
      let title = '';
      let message = '';
      
      if (type === 'saving' && percentage > 20) {
        title = 'Economia Detectada';
        message = category 
          ? `Você economizou ${percentage.toFixed(0)}% em "${category}" este mês. Continue assim!` 
          : `Você economizou ${percentage.toFixed(0)}% no total este mês. Excelente trabalho!`;
      } else if (type === 'spending' && percentage > 20) {
        title = 'Aumento de Gastos';
        message = category 
          ? `Seus gastos em "${category}" aumentaram ${percentage.toFixed(0)}% este mês. Fique atento!` 
          : `Seus gastos totais aumentaram ${percentage.toFixed(0)}% este mês. Considere revisar seu orçamento.`;
      } else if (type === 'investment' && percentage > 0) {
        title = 'Oportunidade de Investimento';
        message = `Você tem potencial para aumentar seus investimentos em ${percentage.toFixed(0)}%. Considere alocar mais recursos para seu futuro.`;
      }
      
      if (title && message) {
        addNotification({
          title,
          message,
          type: 'insight',
          data: {
            type,
            percentage,
            category,
            period: 'month'
          }
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar notificação de insight:', error);
    }
  }
}

// Exporta uma instância única do serviço
export const notificationService = new NotificationService();
