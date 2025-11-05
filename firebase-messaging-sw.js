// This file must be imported in your entry point (e.g., index.tsx) to be registered.
// However, for Firebase Messaging, it's often placed in the public/root directory and automatically picked up.
// Make sure this file is served from the root of your domain.

// Scripts for Firebase products will be imported in the HTML.
// For the service worker, we need to import them manually.
import { initializeApp } from "https://aistudiocdn.com/firebase@^12.5.0/app.js";
import { getMessaging, onBackgroundMessage } from "https://aistudiocdn.com/firebase@^12.5.0/messaging-sw.js";

// Your web app's Firebase configuration
// It is assumed that these environment variables are configured in the deployment environment.
const firebaseConfig = {
  apiKey: "AIzaSyDvPa4wSTxHE84UTnlh8g8hx86_3sDq9zA",
  authDomain: "sardar-tv-pvt-ltd-59ec5.firebaseapp.com",
  projectId: "sardar-tv-pvt-ltd-59ec5",
  storageBucket: "sardar-tv-pvt-ltd-59ec5.firebasestorage.app",
  messagingSenderId: "322152926079",
  appId: "1:322152926079:web:537ac04270a62618aae84a",
  measurementId: "G-99QGSCPBRT"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/firebase-logo.png', // Fallback icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
