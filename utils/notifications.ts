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
    console.log("⏳ [Notification Setup] Registering service worker...");
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('✅ [Notification Setup] Service Worker registered successfully with scope:', registration.scope);

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ [Notification Setup] Notification permission granted.');
      console.log('⏳ [Notification Setup] Requesting FCM token...');
      
      const currentToken = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        console.log('✅ [Notification Setup] FCM Token received:', currentToken);
        console.log('⏳ [Notification Setup] Attempting to save token to Firestore...');
        try {
          // Save the token to Firestore to be used for sending notifications
          await setDoc(doc(db, 'fcmTokens', currentToken), {
            uid: uid,
            createdAt: serverTimestamp(),
          });
          console.log('✅ [Notification Setup] Token saved to Firestore successfully!');
        } catch (error) {
          console.error('❌ [Notification Setup] Failed to save token to Firestore.', error);
          // Check for specific Firestore permission errors
          if (typeof error === 'object' && error !== null && 'code' in error && (error as {code: string}).code === 'permission-denied') {
            console.error(
                '🚨 CRITICAL: Firestore Security Rules are blocking the token from being saved.',
                'Please ensure your rules allow authenticated users to write to the `fcmTokens` collection.',
                'Example Rule: `match /fcmTokens/{token} { allow write: if request.auth != null; }`'
            );
          }
        }
      } else {
        console.warn('⚠️ [Notification Setup] No registration token available. This can happen if the user denies permission or closes the prompt.');
      }
    } else {
      console.log('ℹ️ [Notification Setup] User denied notification permission.');
    }
  } catch (error) {
    console.error('❌ [Notification Setup] An unexpected error occurred.', error);
    
    if (error instanceof Error && error.message.includes('404')) {
        console.error(
            '🚨 Service Worker registration failed: file not found (404).'
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


/**
 * Retrieves the current FCM token if one exists and permission is granted.
 * @returns The FCM token string or null.
 */
export const getCurrentToken = async (): Promise<string | null> => {
    const messaging = await messagingPromise;
    if (!messaging) {
        console.log("Firebase Messaging is not supported in this browser.");
        return null;
    }

    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js').catch(err => {
        console.error("Could not get service worker registration.", err);
        return null;
    });

    if (!registration) {
        console.log("No service worker registration found. Cannot get token.");
        return null;
    }
    
    try {
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
        });
        return token || null;
    } catch(err) {
        console.error("An error occurred while retrieving token.", err);
        return null;
    }
};
