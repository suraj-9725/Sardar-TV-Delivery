import React from 'react';
import { BellIcon } from './Icons';

interface NotificationPromptBannerProps {
  onEnable: () => void;
  onDismiss: () => void;
}

export default function NotificationPromptBanner({ onEnable, onDismiss }: NotificationPromptBannerProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-white rounded-lg shadow-lg p-4 z-50 animate-fade-in-down">
      <div className="flex items-start sm:items-center gap-4">
        <div className="flex-shrink-0 h-10 w-10 bg-brand-primary-light rounded-full flex items-center justify-center">
          <BellIcon className="h-6 w-6 text-brand-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-brand-text">Enable Notifications</p>
          <p className="text-sm text-brand-text-light">Get real-time alerts when new deliveries are added, even when the app is closed.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center mt-2 sm:mt-0">
          <button
            onClick={onEnable}
            className="w-full sm:w-auto px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Enable
          </button>
           <button
            onClick={onDismiss}
            className="w-full sm:w-auto px-4 py-2 bg-transparent text-brand-text-light text-sm font-semibold rounded-md hover:bg-slate-100 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-down {
            0% {
                opacity: 0;
                transform: translate(-50%, -20px);
            }
            100% {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
        .animate-fade-in-down {
            animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
