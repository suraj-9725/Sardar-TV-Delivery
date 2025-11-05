import React, { useState, createContext, useContext, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import DeliveriesView from './components/DeliveriesView';
import StaffView from './components/StaffView';
import { Spinner } from './components/ui/Spinner';
import type { User } from './types';
import { requestNotificationPermission } from './utils/notifications';

type View = 'deliveries' | 'staff';

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });
export const useAuthContext = () => useContext(AuthContext);

export default function App() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('deliveries');

  useEffect(() => {
    if (user) {
      // Once the user is logged in, request permission for notifications.
      // This is non-blocking.
      requestNotificationPermission(user.uid);
    }
  }, [user]);

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
