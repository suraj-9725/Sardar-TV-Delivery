// This file must be in the public root of your site.
import { initializeApp } from "https://aistudiocdn.com/firebase@^12.5.0/app.js";
import { getMessaging, onBackgroundMessage } from "https://aistudiocdn.com/firebase@^12.5.0/messaging/sw.js";

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
    icon: 'https://www.sardartvpvtltd.com/wp-content/uploads/2025/02/SARDAR-TV-LOGO-1980x929.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
