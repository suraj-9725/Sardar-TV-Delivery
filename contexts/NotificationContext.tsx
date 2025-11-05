import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';

interface NotificationState {
  isOpen: boolean;
  title: string;
  message: string;
}

interface NotificationContextType {
  showNotification: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = useCallback((title: string, message: string) => {
    setNotification({ isOpen: true, title, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000); // Auto-hide after 5 seconds
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && notification.isOpen && (
        <div 
            className="fixed top-20 right-5 z-[100] w-full max-w-sm p-4 bg-white rounded-lg shadow-lg border border-gray-200"
            role="alert"
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-bold text-gray-900">{notification.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button onClick={hideNotification} className="inline-flex text-gray-400 rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
