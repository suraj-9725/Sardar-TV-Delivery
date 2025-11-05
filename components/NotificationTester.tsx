
import React, { useState, useEffect } from 'react';
import { getCurrentToken } from '../utils/notifications';
import { BeakerIcon, ClipboardIcon, CheckCircleIcon } from './ui/Icons';
import { Spinner } from './ui/Spinner';

export default function NotificationTester() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchToken = async () => {
    setLoading(true);
    setError('');
    setToken(null);
    try {
      const currentToken = await getCurrentToken();
      if (currentToken) {
        setToken(currentToken);
      } else {
        setError('No token found. Please grant notification permissions first.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the token.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 border border-brand-border rounded-lg p-4 mb-6">
      <div className="flex items-start gap-4">
        <BeakerIcon className="h-8 w-8 text-brand-primary flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-brand-text">Notification Frontend Test Panel</h3>
          <p className="text-sm text-brand-text-light">
            Use this tool to verify that your browser is set up to receive notifications. If this test works, your frontend is correctly configured.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {!token && (
            <button
                onClick={fetchToken}
                disabled={loading}
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-400"
            >
            {loading ? <Spinner /> : '1. Get My FCM Token'}
            </button>
        )}
        
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        
        {token && (
            <div>
                <p className="text-sm font-bold text-brand-text">Your FCM Token:</p>
                <div className="mt-1 flex items-center gap-2 bg-white p-2 border rounded-md shadow-sm">
                    <input
                        type="text"
                        readOnly
                        value={token}
                        className="flex-grow p-1 border-none focus:ring-0 text-xs text-brand-text-light bg-transparent"
                    />
                    <button onClick={copyToClipboard} className="flex-shrink-0 p-2 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors">
                        {copied ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <ClipboardIcon className="h-5 w-5 text-brand-text-light" />}
                    </button>
                </div>

                <div className="mt-4 text-sm text-brand-text-light space-y-2">
                    <p className="font-bold text-brand-text">2. How to Send a Test Message:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline">Firebase Console</a>.</li>
                        <li>Navigate to <span className="font-semibold">Engage &gt; Messaging</span>.</li>
                        <li>Click <span className="font-semibold">"Create your first campaign"</span> or <span className="font-semibold">"New campaign"</span>, and choose "Notifications".</li>
                        <li>Enter a title and text for your test notification.</li>
                        <li>On the right side, click the <span className="font-semibold">"Send test message"</span> button.</li>
                        <li>Paste the token from above into the dialog and click <span className="font-semibold">"Test"</span>.</li>
                        <li>You should receive the notification in your browser within a few moments.</li>
                    </ol>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
