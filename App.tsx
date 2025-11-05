import React, { useState, createContext, useContext } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import DeliveriesView from './components/DeliveriesView';
import StaffView from './components/StaffView';
import { Spinner } from './components/ui/Spinner';
import type { User } from './types';
import { NotificationProvider } from './contexts/NotificationContext';
import { useFCM } from './hooks/useFCM';

type View = 'deliveries' | 'staff';

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });
export const useAuthContext = () => useContext(AuthContext);

// Component that handles the authenticated part of the app
const AuthenticatedApp = ({ user, logout }: { user: User; logout: () => void; }) => {
  const [currentView, setCurrentView] = useState<View>('deliveries');
  
  // useFCM is called here, within the context of an authenticated user
  useFCM();

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
    </div>
  );
}

export default function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-bg">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user }}>
      <NotificationProvider>
        {user ? <AuthenticatedApp user={user} logout={logout} /> : <LoginPage />}
      </NotificationProvider>
    </AuthContext.Provider>
  );
}
