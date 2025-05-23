import { useState } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { notificationService } from './NotificationService';

export default function NotificationDemo() {
  const { addNotification } = useNotificationStore();
  const [selectedType, setSelectedType] = useState<'budget' | 'goal' | 'transaction' | 'insight'>('budget');

  const handleGenerateNotification = () => {
    switch (selectedType) {
      case 'budget':
        addNotification({
          title: 'Alerta de Orçamento',
          message: 'Você já utilizou 85% do seu orçamento para despesas variáveis este mês. Considere reduzir seus gastos nesta categoria.',
          type: 'budget',
          data: {
            category: 'Despesas Variáveis',
            percentage: 85,
            threshold: 80
          }
        });
        break;
      case 'goal':
        addNotification({
          title: 'Progresso de Meta',
          message: 'Parabéns! Você atingiu 50% da sua meta "Viagem para o Japão". Continue assim!',
          type: 'goal',
          data: {
            goalId: 'goal-1',
            goalTitle: 'Viagem para o Japão',
            percentage: 50,
            milestone: 50
          }
        });
        break;
      case 'transaction':
        addNotification({
          title: 'Transação Importante',
          message: 'Uma transação de R$650,00 para "Aluguel" foi registrada.',
          type: 'transaction',
          data: {
            amount: 650,
            date: new Date().toISOString(),
            category: 'Moradia'
          }
        });
        break;
      case 'insight':
        addNotification({
          title: 'Economia Detectada',
          message: 'Você economizou 30% em "Alimentação" este mês. Continue assim!',
          type: 'insight',
          data: {
            type: 'saving',
            percentage: 30,
            category: 'Alimentação',
            period: 'month'
          }
        });
        break;
    }
  };

  const handleGenerateServiceNotification = () => {
    switch (selectedType) {
      case 'budget':
        notificationService.checkBudgetLimits('Despesas Variáveis', 85);
        break;
      case 'goal':
        notificationService.notifyGoalProgress('goal-1', 'Viagem para o Japão', 50);
        break;
      case 'transaction':
        notificationService.notifyTransaction(650, 'Aluguel', new Date().toISOString(), 'Moradia');
        break;
      case 'insight':
        notificationService.generateInsight('saving', 30, 'Alimentação');
        break;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6 mb-6">
      <h2 className="text-lg font-bold mb-4">Demonstração de Notificações</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Notificação
        </label>
        <select 
          className="input w-full"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
        >
          <option value="budget">Alerta de Orçamento</option>
          <option value="goal">Progresso de Meta</option>
          <option value="transaction">Transação</option>
          <option value="insight">Insight</option>
        </select>
      </div>
      
      <div className="flex gap-2">
        <button 
          className="btn btn-primary"
          onClick={handleGenerateNotification}
        >
          Gerar Notificação Direta
        </button>
        <button 
          className="btn btn-outline"
          onClick={handleGenerateServiceNotification}
        >
          Usar Serviço de Notificação
        </button>
      </div>
    </div>
  );
}
