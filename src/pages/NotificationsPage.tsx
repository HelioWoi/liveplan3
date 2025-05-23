import { useState } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { Trash2, CheckCircle, Bell } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import BottomNavigation from '../components/layout/BottomNavigation';
import NotificationItem from '../components/notifications/NotificationItem';
import NotificationDemo from '../components/notifications/NotificationDemo';

export default function NotificationsPage() {
  const { notifications, markAllAsRead, clearNotifications } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'budget' | 'goal' | 'transaction' | 'insight'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader 
        title="Notificações" 
        showBackButton={true}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Componente de demonstração para testes */}
        <NotificationDemo />
        {/* Filtros */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex overflow-x-auto pb-2 gap-2">
            <button 
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'unread' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              onClick={() => setFilter('unread')}
            >
              Não lidas
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'budget' ? 'bg-error-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              onClick={() => setFilter('budget')}
            >
              Orçamento
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'goal' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              onClick={() => setFilter('goal')}
            >
              Metas
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'transaction' ? 'bg-warning-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              onClick={() => setFilter('transaction')}
            >
              Transações
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${filter === 'insight' ? 'bg-success-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
              onClick={() => setFilter('insight')}
            >
              Insights
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => markAllAsRead()}
              title="Marcar todas como lidas"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Marcar como lidas</span>
            </button>
            <button 
              className="btn btn-outline btn-sm text-error-600 border-error-600 hover:bg-error-50"
              onClick={() => {
                if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
                  clearNotifications();
                }
              }}
              title="Limpar notificações"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          </div>
        </div>

        {/* Lista de notificações */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">Nenhuma notificação</h3>
              <p className="text-sm text-gray-500">
                {filter !== 'all' 
                  ? 'Tente outro filtro para ver mais notificações' 
                  : 'Você receberá notificações sobre seu orçamento, metas e transações aqui'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
