// This service worker handles background push notifications.
// It uses the compat libraries for broader browser support without a bundler.
// Switched to the official Firebase CDN for reliability.
importScripts("https://www.gstatic.com/firebasejs/12.5.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.5.0/firebase-messaging-compat.js");

// NOTE: This config is duplicated from the main app.
// It's necessary because service workers run in a separate context.
const firebaseConfig = {
  apiKey: "AIzaSyDvPa4wSTxHE84UTnlh8g8hx86_3sDq9zA",
  authDomain: "sardar-tv-pvt-ltd-59ec5.firebaseapp.com",
  projectId: "sardar-tv-pvt-ltd-59ec5",
  storageBucket: "sardar-tv-pvt-ltd-59ec5.firebasestorage.app",
  messagingSenderId: "322152926079",
  appId: "1:322152926079:web:537ac04270a62618aae84a",
  measurementId: "G-99QGSCPBRT"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  // The backend (e.g., a Cloud Function) should send a payload with a 'notification' object.
  if (payload.notification) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: "https://www.sardartvpvtltd.com/wp-content/uploads/2025/02/SARDAR-TV-LOGO-1980x929.png",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
