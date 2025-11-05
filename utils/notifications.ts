import { getToken } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, messaging as messagingPromise } from '../services/firebase';
import { FirebaseError } from 'firebase/app';

// IMPORTANT: Replace this with your actual VAPID key from the Firebase Console.
// Go to Project Settings > Cloud Messaging > Web configuration > Web Push certificates
const VAPID_KEY = 'BKEAer2C7f5kURbmpjXi8IuYIKEqhyRysMb6nlV0tpDXglWqrAooz4_bLWRcNlQ0RYsdfddLnERz_EdTsHtdO7U';

/**
 * Requests permission to show notifications and saves the FCM token if granted.
 * @param uid The user's unique ID.
 * @returns The final notification permission status.
 */
export const requestNotificationPermission = async (uid: string): Promise<NotificationPermission> => {
  const messaging = await messagingPromise;
  if (!messaging || !('serviceWorker' in navigator)) {
    console.log("Firebase Messaging or Service Workers are not supported in this browser.");
    return 'denied';
  }

  try {
    // Manually register the service worker from the root scope
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('✅ [Notification Setup] Step 1: Service Worker registered successfully with scope:', registration.scope);

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ [Notification Setup] Step 2: Notification permission granted by user.');
      
      console.log('🔄 [Notification Setup] Step 3: Attempting to retrieve FCM token...');
      const currentToken = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        console.log('✅ [Notification Setup] Step 4: FCM Token retrieved successfully:', currentToken);
        
        console.log('🔄 [Notification Setup] Step 5: Attempting to save token to Firestore...');
        await setDoc(doc(db, 'fcmTokens', currentToken), {
          uid: uid,
          createdAt: serverTimestamp(),
        });
        console.log('✅ [Notification Setup] Step 6: Token saved to Firestore successfully!');

      } else {
        console.error('❌ [Notification Setup] Step 4 Failed: No registration token available. This can happen if the user has denied permissions in the past or if there is a configuration issue with your VAPID key or Firebase project.');
      }
    } else {
      console.warn('🟡 [Notification Setup] Step 2 Failed: Unable to get permission to notify. User status:', permission);
    }
    return permission;
  } catch (error) {
    console.error('❌ [Notification Setup] An unexpected error occurred. Full error object:', error);
    
    if (error instanceof FirebaseError && error.code === 'permission-denied') {
        console.error(
            '--> 🚨 Firestore Permission Error: The security rules for your database are blocking the app from saving the notification token. Please ensure your Firestore rules allow authenticated users to write to the `fcmTokens` collection.'
        );
    } else if (error instanceof Error && error.message.includes('404')) {
        console.error(
            '--> 🚨 Service Worker registration failed: file not found (404).'
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
    return 'denied';
  }
};
