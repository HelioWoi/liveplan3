import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, TrendingUp, Target, CreditCard } from 'lucide-react';
import { Notification, useNotificationStore } from '../../stores/notificationStore';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead } = useNotificationStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsExpanded(!isExpanded);
    
    // Fechar o dropdown se necessário
    if (onClose) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'budget':
        return <AlertCircle className="h-5 w-5 text-error-500" />;
      case 'goal':
        return <Target className="h-5 w-5 text-primary-500" />;
      case 'transaction':
        return <CreditCard className="h-5 w-5 text-warning-500" />;
      case 'insight':
        return <TrendingUp className="h-5 w-5 text-success-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return format(date, 'dd MMM', { locale: ptBR });
    }
  };

  return (
    <div 
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {getRelativeTime(notification.createdAt)}
            </span>
          </div>
          
          <p className={`text-sm mt-1 ${isExpanded ? '' : 'line-clamp-2'} ${!notification.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
            {notification.message}
          </p>
          
          {notification.data && isExpanded && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
              {/* Renderizar dados adicionais conforme o tipo de notificação */}
              {JSON.stringify(notification.data)}
            </div>
          )}
          
          {notification.message.length > 100 && (
            <button 
              className="text-xs text-primary-600 mt-1 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
