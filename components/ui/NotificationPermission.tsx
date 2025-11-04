import React, { useState } from 'react';

interface NotificationPermissionProps {
  onPermissionGranted: () => void;
}

export default function NotificationPermission({ onPermissionGranted }: NotificationPermissionProps) {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = async () => {
    const newPermission = await Notification.requestPermission();
    setPermission(newPermission);
    if (newPermission === 'granted') {
      onPermissionGranted();
    }
  };

  if (permission === 'granted') {
    return null;
  }
  
  if (permission === 'denied') {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-red-100 p-4 text-center text-sm text-red-800 shadow-lg">
            <p>You have blocked notifications. Please enable them in your browser settings to receive delivery updates.</p>
        </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-brand-primary-light p-4 text-center shadow-lg">
      <p className="text-brand-text mb-2">Enable notifications to get real-time updates on new deliveries.</p>
      <button onClick={requestPermission} className="bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
        Enable Notifications
      </button>
    </div>
  );
}
