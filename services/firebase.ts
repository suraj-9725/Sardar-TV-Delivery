
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

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
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { auth, db, messaging };