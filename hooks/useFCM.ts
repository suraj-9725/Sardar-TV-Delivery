import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { messaging, db } from '../services/firebase';
import { useAuthContext } from '../App';

// IMPORTANT: Replace this with your VAPID key from the Firebase console.
// Go to Project Settings > Cloud Messaging > Web configuration and click "Generate key pair".
const VAPID_KEY = "BEa8MkVmsoInkXVAxkXZWOpCyu0qjbAkQiz4MeUScKLTfnzWwz60H1q_M-ZLPfkjKYvyX5gbqTMUViIDUwGFibI";

export const useFCM = () => {
  const { user } = useAuthContext();
  const [permissionGranted, setPermissionGranted] = useState(Notification.permission === 'granted');

  const setupFCM = async () => {
    if (!user || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging is not supported or user not logged in.');
      return;
    }

    try {
      console.log('Attempting to get FCM token...');
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        console.log('FCM Token received:', currentToken);
        const tokenRef = doc(db, 'fcmTokens', currentToken);
        console.log('Attempting to save token to Firestore for user:', user.email);
        await setDoc(tokenRef, {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
        }, { merge: true });
        console.log('FCM token saved successfully to Firestore.');
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } catch (err) {
      console.error('An error occurred while retrieving or saving the token.', err);
      console.error('This could be due to an invalid VAPID key or, more likely, restrictive Firestore security rules.');
    }
  };
  
  useEffect(() => {
    if (user && permissionGranted) {
      setupFCM();
    }
  }, [permissionGranted, user]);
  
  useEffect(() => {
    if (!messaging) return;
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground.', payload);
      new Notification(payload.notification?.title || 'Notification', {
        body: payload.notification?.body,
        icon: 'https://www.sardartvpvtltd.com/wp-content/uploads/2025/02/SARDAR-TV-LOGO-1980x929.png'
      });
    });
    return () => unsubscribe();
  }, []);

  return { setPermissionGranted };
};
