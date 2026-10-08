import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { X, Activity, Bell } from 'lucide-react';

const NotificationDrawer = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, deleteNotification, clearNotifications } = useData();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="glass-card w-full max-w-md h-full max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col"
        >
          <div className="p-6 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">

              <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-0 flex-1 overflow-y-auto">
            <div className="flex flex-col h-full">
              {!notifications || notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center mt-16">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Bell className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">No notifications right now</h3>
                  <p className="text-xs text-slate-500">You'll see system notifications here.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-end px-4 py-2 bg-slate-50 border-b border-border">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotifications();
                      }}
                      className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div>
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-4 border-b border-border cursor-pointer transition-colors flex items-start justify-between gap-3 ${!notif.read ? 'bg-blue-50/30 hover:bg-blue-50/60' : 'hover:bg-slate-50/50'}`}
                        onClick={() => {
                          if (!notif.read) markNotificationAsRead(notif.id);
                        }}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                          <div>
                            <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{notif.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString('en-LK', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Colombo' })}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationDrawer;
