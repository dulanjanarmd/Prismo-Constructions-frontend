import React from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const { notifications, markNotificationAsRead, deleteNotification, clearNotifications } = useData();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Notifications
          </h1>
          <p className="text-slate-500 mt-1">A timeline of your latest updates and alerts.</p>
        </div>
        {notifications?.length > 0 && (
          <button
            onClick={() => clearNotifications()}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>
      
      <div className="max-w-4xl glass-card overflow-hidden">
        {(!notifications || notifications.length === 0) ? (
          <div className="p-12 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium text-slate-600">No notifications yet</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-slate-50/50 transition-colors flex gap-4 cursor-pointer ${!notification.read ? 'bg-blue-50/30' : ''}`}
                onClick={() => {
                  if (!notification.read) markNotificationAsRead(notification.id);
                  if (notification.referenceId && notification.referenceId.startsWith('project-')) {
                    const parts = notification.referenceId.split('-');
                    const projectId = parts[1];
                    const tab = parts[2]; // Might be undefined
                    navigate(`/portal/projects/${projectId}`, { state: { tab } });
                  }
                }}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold text-sm ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3">
                    {!notification.read && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(notification.id);
                        }}
                        className="text-xs font-semibold text-primary hover:text-blue-700 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Mark as read
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
