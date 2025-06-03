import React from 'react';

const NotificationsPage: React.FC = () => {
  // Mock notifications data
  const notifications = [
    { id: 1, message: 'Aurora replied to your question', time: '2 hours ago' },
    { id: 2, message: 'Your question received 5 new likes', time: '1 day ago' },
    { id: 3, message: 'New answer to a question you follow', time: '3 days ago' }
  ];
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      <div className="space-y-4">
        {notifications.map(notification => (
          <div key={notification.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="font-medium">{notification.message}</p>
            <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;