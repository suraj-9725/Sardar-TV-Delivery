import { getToken } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, messaging as messagingPromise } from '../services/firebase';

// IMPORTANT: Replace this with your actual VAPID key from the Firebase Console.
// Go to Project Settings > Cloud Messaging > Web configuration > Web Push certificates
const VAPID_KEY = 'BKEAer2C7f5kURbmpjXi8IuYIKEqhyRysMb6nlV0tpDXglWqrAooz4_bLWRcNlQ0RYsdfddLnERz_EdTsHtdO7U';

/**
 * Requests permission to show notifications and saves the FCM token if granted.
 * @param uid The user's unique ID.
 */
export const requestNotificationPermission = async (uid: string) => {
  const messaging = await messagingPromise;
  if (!messaging || !('serviceWorker' in navigator)) {
    console.log("Firebase Messaging or Service Workers are not supported in this browser.");
    return;
  }

  try {
    // Manually register the service worker from the root scope
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered successfully with scope:', registration.scope);

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Pass the explicit registration to getToken
      const currentToken = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // Save the token to Firestore to be used for sending notifications
        await setDoc(doc(db, 'fcmTokens', currentToken), {
          uid: uid,
          createdAt: serverTimestamp(),
        });
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('An error occurred during notification setup.', error);
    // Provide a more specific error message if the service worker file is not found.
    if (error instanceof Error && error.message.includes('404')) {
        console.error(
            '--> Service Worker registration failed: file not found (404).\n' +
            '--> This is a file serving issue, not a code issue.\n' +
            '--> SOLUTION: Ensure `firebase-messaging-sw.js` is in the root of your public/deployment directory, next to `index.html`.'
        );
    }
  }
};
