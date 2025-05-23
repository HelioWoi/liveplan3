// Mock API para notificações
import { Notification } from '../../stores/notificationStore';

// Dados de exemplo para notificações
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Alerta de Orçamento',
    message: 'Você já utilizou 85% do seu orçamento para despesas variáveis este mês.',
    type: 'budget',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Meta Atingida',
    message: 'Parabéns! Você atingiu 50% da sua meta "Viagem para o Japão".',
    type: 'goal',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
  },
  {
    id: '3',
    title: 'Transação Recorrente',
    message: 'Lembrete: Sua assinatura de streaming será cobrada amanhã (R$29,90).',
    type: 'transaction',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
  },
  {
    id: '4',
    title: 'Insight Financeiro',
    message: 'Você gastou 30% menos em restaurantes este mês. Continue assim!',
    type: 'insight',
    isRead: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
  },
];

// Função para simular uma chamada de API
export async function fetchNotifications(): Promise<Notification[]> {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockNotifications;
}

// Função para simular marcar uma notificação como lida
export async function markNotificationAsRead(id: string): Promise<void> {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  // Em uma API real, isso enviaria uma requisição para atualizar o status
  console.log(`Marcando notificação ${id} como lida`);
}

// Função para simular marcar todas as notificações como lidas
export async function markAllNotificationsAsRead(): Promise<void> {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  // Em uma API real, isso enviaria uma requisição para atualizar o status
}
