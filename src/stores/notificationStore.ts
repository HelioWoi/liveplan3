import { create } from 'zustand';
import { fetchNotifications as fetchNotificationsApi, markNotificationAsRead, markAllNotificationsAsRead } from '../mocks/api/notifications';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'budget' | 'goal' | 'transaction' | 'insight';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
}

// Os dados de notificações agora vêm do endpoint mock em ../mocks/api/notifications

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  
  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Buscando do endpoint mock
      const data = await fetchNotificationsApi();
      
      set({ 
        notifications: data, 
        unreadCount: data.filter(n => !n.isRead).length,
        isLoading: false 
      });
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      set({ error: 'Falha ao carregar notificações', isLoading: false });
    }
  },
  
  markAsRead: async (id: string) => {
    try {
      // Chamando o endpoint mock
      await markNotificationAsRead(id);
      
      // Atualizando localmente
      const { notifications } = get();
      const updatedNotifications = notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      
      set({ 
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      set({ error: 'Falha ao atualizar notificação' });
    }
  },
  
  markAllAsRead: async () => {
    try {
      // Chamando o endpoint mock
      await markAllNotificationsAsRead();
      
      // Atualizando localmente
      const { notifications } = get();
      const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
      
      set({ notifications: updatedNotifications, unreadCount: 0 });
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      set({ error: 'Falha ao atualizar notificações' });
    }
  },
  
  clearNotifications: async () => {
    try {
      // Em uma implementação real, excluiríamos do Supabase
      // await supabase
      //   .from('notifications')
      //   .delete()
      //   .eq('user_id', userId);
      
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
      set({ error: 'Falha ao limpar notificações' });
    }
  },
  
  addNotification: async (notification) => {
    try {
      // Em uma implementação real, adicionaríamos no Supabase
      // const { data, error } = await supabase
      //   .from('notifications')
      //   .insert([{
      //     user_id: userId,
      //     title: notification.title,
      //     message: notification.message,
      //     type: notification.type,
      //     data: notification.data,
      //     is_read: false,
      //   }])
      //   .select();
      
      // if (error) throw error;
      
      // Adicionando localmente para demonstração
      const newNotification: Notification = {
        id: Math.random().toString(36).substring(2, 9),
        ...notification,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      
      const { notifications } = get();
      
      set({ 
        notifications: [newNotification, ...notifications],
        unreadCount: get().unreadCount + 1
      });
    } catch (error) {
      console.error('Erro ao adicionar notificação:', error);
      set({ error: 'Falha ao adicionar notificação' });
    }
  }
}));
