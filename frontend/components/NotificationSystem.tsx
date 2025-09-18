import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Poll for notifications
    const interval = setInterval(checkForNotifications, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  async function checkForNotifications() {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      // Silent fail
    }
  }

  function dismissNotification(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Mark as read on server
    fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id })
    });
  }

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 bg-white ${
            notification.type === 'success' ? 'border-green-500' :
            notification.type === 'error' ? 'border-red-500' : 'border-blue-500'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
              {notification.type === 'error' && <XCircleIcon className="w-5 h-5 text-red-500" />}
              {notification.type === 'info' && <InformationCircleIcon className="w-5 h-5 text-blue-500" />}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{notification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              {notification.actionUrl && (
                <a 
                  href={notification.actionUrl}
                  className="inline-block mt-2 text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  {notification.actionLabel || 'View'}
                </a>
              )}
            </div>
            <button 
              onClick={() => dismissNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
