import { useEffect, useState } from 'react';
import { Bell, X, AlertCircle, Target, Calendar, Lightbulb, Filter, Settings } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { Link } from 'react-router-dom';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { notifications, unreadCount, fetchNotifications, markAllAsRead, markAsRead } = useNotificationStore();
  
  // State for filtering and grouping
  const [activeTab, setActiveTab] = useState<'all' | 'budget' | 'goal' | 'transaction' | 'insight'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);
  
  // Filter notifications based on active tab and date filter
  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    if (activeTab !== 'all' && notification.type !== activeTab) {
      return false;
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const notificationDate = new Date(notification.createdAt);
      const currentDate = new Date();
      
      if (dateFilter === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(currentDate.getDate() - 7);
        return notificationDate >= sevenDaysAgo;
      }
      
      if (dateFilter === 'month') {
        return notificationDate.getMonth() === currentDate.getMonth() && 
               notificationDate.getFullYear() === currentDate.getFullYear();
      }
    }
    
    return true;
  });
  
  // Group notifications by type
  const groupedNotifications = {
    budget: filteredNotifications.filter(n => n.type === 'budget'),
    goal: filteredNotifications.filter(n => n.type === 'goal'),
    transaction: filteredNotifications.filter(n => n.type === 'transaction'),
    insight: filteredNotifications.filter(n => n.type === 'insight')
  };
  
  // Icons are now used directly in the notification groups
  
  // Format date to relative time (today, yesterday, or date)
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button 
                className="text-sm text-primary-600 hover:text-primary-700"
                onClick={() => markAllAsRead()}
              >
                Mark all as read
              </button>
            )}
            <button 
              className="p-1 rounded-full hover:bg-gray-100 hover:text-primary-600"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filter notifications"
            >
              <Filter className="h-5 w-5 text-gray-500" />
            </button>
            <button 
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={onClose}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Filter options */}
        {showFilters && (
          <div className="p-3 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Filter by type:</p>
                <div className="flex gap-2">
                  <button 
                    className={`px-3 py-1 text-xs rounded-full ${activeTab === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setActiveTab('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs rounded-full ${activeTab === 'budget' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setActiveTab('budget')}
                  >
                    Budget
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs rounded-full ${activeTab === 'goal' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setActiveTab('goal')}
                  >
                    Goals
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs rounded-full ${activeTab === 'transaction' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setActiveTab('transaction')}
                  >
                    Transactions
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Filter by date:</p>
                <div className="flex gap-2">
                  <button 
                    className={`px-3 py-1 text-xs rounded-full ${dateFilter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setDateFilter('all')}
                  >
                    All time
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs rounded-full ${dateFilter === '7days' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setDateFilter('7days')}
                  >
                    Last 7 days
                  </button>
                  <button 
                    className={`px-3 py-1 text-xs rounded-full ${dateFilter === 'month' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setDateFilter('month')}
                  >
                    This month
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No notifications found</p>
              {activeTab !== 'all' && (
                <button 
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700"
                  onClick={() => setActiveTab('all')}
                >
                  View all notifications
                </button>
              )}
            </div>
          ) : (
            <div>
              {/* Budget Notifications */}
              {groupedNotifications.budget.length > 0 && (
                <div className="pt-2">
                  <div className="px-4 py-2 bg-gray-50">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <h4 className="text-xs font-semibold text-gray-700">Budget Alerts</h4>
                    </div>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {groupedNotifications.budget.map((notification) => (
                      <li 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'border-l-4 border-red-400' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1" onClick={() => markAsRead(notification.id)}>
                            <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <span className="text-xs text-gray-500 block mt-2">
                              {formatRelativeDate(notification.createdAt)}
                            </span>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <Link 
                              to="/expenses" 
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 text-center"
                              onClick={() => markAsRead(notification.id)}
                            >
                              View Budget
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Goal Notifications */}
              {groupedNotifications.goal.length > 0 && (
                <div className="pt-2">
                  <div className="px-4 py-2 bg-gray-50">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-green-500 mr-2" />
                      <h4 className="text-xs font-semibold text-gray-700">Goal Progress</h4>
                    </div>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {groupedNotifications.goal.map((notification) => (
                      <li 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'border-l-4 border-green-400' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1" onClick={() => markAsRead(notification.id)}>
                            <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <span className="text-xs text-gray-500 block mt-2">
                              {formatRelativeDate(notification.createdAt)}
                            </span>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <Link 
                              to="/goals" 
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 text-center"
                              onClick={() => markAsRead(notification.id)}
                            >
                              View Goals
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Transaction Notifications */}
              {groupedNotifications.transaction.length > 0 && (
                <div className="pt-2">
                  <div className="px-4 py-2 bg-gray-50">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                      <h4 className="text-xs font-semibold text-gray-700">Transactions</h4>
                    </div>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {groupedNotifications.transaction.map((notification) => (
                      <li 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'border-l-4 border-blue-400' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1" onClick={() => markAsRead(notification.id)}>
                            <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <span className="text-xs text-gray-500 block mt-2">
                              {formatRelativeDate(notification.createdAt)}
                            </span>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <Link 
                              to="/bills" 
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 text-center"
                              onClick={() => markAsRead(notification.id)}
                            >
                              View Transaction
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Insight Notifications */}
              {groupedNotifications.insight.length > 0 && (
                <div className="pt-2">
                  <div className="px-4 py-2 bg-gray-50">
                    <div className="flex items-center">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                      <h4 className="text-xs font-semibold text-gray-700">Financial Insights</h4>
                    </div>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {groupedNotifications.insight.map((notification) => (
                      <li 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'border-l-4 border-yellow-400' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1" onClick={() => markAsRead(notification.id)}>
                            <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            <span className="text-xs text-gray-500 block mt-2">
                              {formatRelativeDate(notification.createdAt)}
                            </span>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            <Link 
                              to="/" 
                              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 text-center"
                              onClick={() => markAsRead(notification.id)}
                            >
                              View Dashboard
                            </Link>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Preferences Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <button 
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary-600"
            onClick={() => setShowPreferences(!showPreferences)}
          >
            <Settings className="h-4 w-4" />
            Notification Preferences
          </button>
          
          {showPreferences && (
            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notification Settings</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Budget Alerts</label>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Goal Progress Updates</label>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Transaction Reminders</label>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Financial Insights</label>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Weekly Summary</label>
                  <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600 rounded" />
                </div>
                
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Delivery Schedule</p>
                  <select className="w-full text-sm border border-gray-300 rounded p-1">
                    <option>Real-time notifications</option>
                    <option>Daily digest (morning)</option>
                    <option>Daily digest (evening)</option>
                    <option>Weekly summary only</option>
                  </select>
                </div>
                
                <div className="mt-3 flex justify-end">
                  <button className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
