import React, { useState, createContext, useContext } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import DeliveriesView from './components/DeliveriesView';
import StaffView from './components/StaffView';
import { Spinner } from './components/ui/Spinner';
import type { User } from './types';
import { useFCM } from './hooks/useFCM';
import NotificationPermission from './components/ui/NotificationPermission';

type View = 'deliveries' | 'staff';

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });
export const useAuthContext = () => useContext(AuthContext);

const AppContent = ({ user, logout }: { user: User, logout: () => void }) => {
  const [currentView, setCurrentView] = useState<View>('deliveries');
  const { setPermissionGranted } = useFCM();

  return (
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
      <NotificationPermission onPermissionGranted={() => setPermissionGranted(true)} />
    </div>
  );
};


export default function App() {
  const { user, loading, logout } = useAuth();

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
      <AppContent user={user} logout={logout} />
    </AuthContext.Provider>
  );
}
