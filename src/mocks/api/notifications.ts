// Mock API for notifications
import { Notification } from '../../stores/notificationStore';

// Sample notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Budget Alert',
    message: 'You have already used 85% of your variable expenses budget this month.',
    type: 'budget',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Goal Achieved',
    message: 'Congratulations! You have reached 50% of your "Trip to Japan" goal.',
    type: 'goal',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: '3',
    title: 'Recurring Transaction',
    message: 'Reminder: Your streaming subscription will be charged tomorrow ($29.90).',
    type: 'transaction',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: '4',
    title: 'Financial Insight',
    message: 'You spent 30% less at restaurants this month. Keep it up!',
    type: 'insight',
    isRead: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

// Function to simulate an API call
export async function fetchNotifications(): Promise<Notification[]> {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockNotifications;
}

// Function to simulate marking a notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  // In a real API, this would send a request to update the status
  console.log(`Marking notification ${id} as read`);
}

// Function to simulate marking all notifications as read
export async function markAllNotificationsAsRead(): Promise<void> {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  // Em uma API real, isso enviaria uma requisição para atualizar o status
}
