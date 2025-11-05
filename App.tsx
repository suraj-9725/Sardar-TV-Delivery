import React, { useState, createContext, useContext, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import DeliveriesView from './components/DeliveriesView';
import StaffView from './components/StaffView';
import { Spinner } from './components/ui/Spinner';
import type { User } from './types';
import { requestNotificationPermission } from './utils/notifications';
import NotificationPromptBanner from './components/ui/NotificationPromptBanner';

type View = 'deliveries' | 'staff';

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });
export const useAuthContext = () => useContext(AuthContext);

export default function App() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('deliveries');
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    // Check if we should show the notification prompt when the user logs in.
    if (user) {
      const dismissed = localStorage.getItem('notificationPromptDismissed') === 'true';
      if (!dismissed && 'Notification' in window && Notification.permission === 'default') {
        // Use a timeout to avoid being too intrusive right at login.
        const timer = setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 3000); // Show after 3 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleEnableNotifications = async () => {
    if (!user) return;
    // Hide the prompt immediately, the browser prompt will take over.
    setShowNotificationPrompt(false);
    const status = await requestNotificationPermission(user.uid);
    // If user denies, we'll mark it as dismissed so we don't ask again.
    if (status !== 'granted') {
      localStorage.setItem('notificationPromptDismissed', 'true');
    }
  };

  const handleDismissNotificationPrompt = () => {
    setShowNotificationPrompt(false);
    // Remember this choice so we don't ask again on subsequent logins.
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-bg">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AuthContext.Provider value={{ user }}>
      <div className="min-h-screen bg-brand-bg">
        {showNotificationPrompt && (
          <NotificationPromptBanner
            onEnable={handleEnableNotifications}
            onDismiss={handleDismissNotificationPrompt}
          />
        )}
        <Header 
          user={user} 
          logout={logout}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
        <main className="pt-32 md:pt-24 px-4 sm:px-6 lg:px-8">
          {currentView === 'deliveries' && <DeliveriesView />}
          {currentView === 'staff' && <StaffView />}
        </main>
      </div>
    </AuthContext.Provider>
  );
}
