import { useState } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import ContextMenu from './ContextMenu';
import NotificationModal from '../notifications/NotificationModal';
import { useNotificationStore } from '../../stores/notificationStore';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  showMoreOptions?: boolean;
}

export function PageHeader({ 
  title, 
  showBackButton = true,
  showMoreOptions = false
}: PageHeaderProps) {
  const navigate = useNavigate();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const { unreadCount } = useNotificationStore();

  return (
    <div className="bg-[#1A1A40] text-white">
      <div className="relative">
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#1A1A40] rounded-b-[40px]"></div>
        <div className="relative px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            {showBackButton ? (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            ) : (
              /* Spacer for alignment */
              <div className="w-10"></div>
            )}
            
            <h1 className="text-2xl font-bold">{title}</h1>
            
            <div className="flex items-center">
              <button 
                onClick={() => setIsNotificationModalOpen(true)}
                className="relative block p-2 rounded-full hover:bg-white/20 focus:outline-none"
                aria-label="Notificações"
              >
                <Bell className="h-6 w-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showMoreOptions && <ContextMenu />}
              <NotificationModal 
                isOpen={isNotificationModalOpen} 
                onClose={() => setIsNotificationModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white px-4 py-3">
        <Breadcrumbs />
      </div>
    </div>
  );
}

export default PageHeader