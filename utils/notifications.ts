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
  if (!messaging) {
    console.log("Firebase Messaging is not supported in this browser.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });

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
    console.error('An error occurred while getting the notification token. ', error);
  }
};
