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
    
    if (error instanceof Error && error.message.includes('404')) {
        console.error(
            '--> Service Worker registration failed: file not found (404).'
        );
        /*
         * ####################################################################################
         * # IMPORTANT NOTE FOR THE DEVELOPER
         * ####################################################################################
         *
         * This 404 error means your web server is not serving the 'firebase-messaging-sw.js' 
         * file from the root directory of your website.
         *
         * THIS IS A DEPLOYMENT CONFIGURATION ISSUE, NOT A CODE BUG.
         *
         * To fix this, you must ensure that 'firebase-messaging-sw.js' is placed in a
         * 'public' directory that your deployment service (like Vercel, Netlify, etc.) 
         * serves at the root level.
         *
         * --- ACTION REQUIRED ---
         *
         * 1. Create a folder named 'public' at the root of your project.
         * 2. Move 'firebase-messaging-sw.js' into that new 'public' folder.
         * 3. Most deployment platforms will automatically detect the 'public' folder 
         *    and serve its contents. After deploying this change, the file will be
         *    correctly located.
         *
         * The file MUST be accessible at `https://your-domain.com/firebase-messaging-sw.js`.
         *
         * ####################################################################################
         */
    }
  }
};
