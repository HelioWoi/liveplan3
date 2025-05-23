import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../stores/notificationStore';

export default function NotificationCenter() {
  const { 
    unreadCount, 
    fetchNotifications 
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="notification-center relative z-50">
      <Link 
        to="/notifications"
        className="relative block p-2 rounded-full hover:bg-white/20 focus:outline-none"
        aria-label="Notificações"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
