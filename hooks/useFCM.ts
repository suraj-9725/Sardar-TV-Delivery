import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { messaging, db } from '../services/firebase';
import { useAuthContext } from '../App';
import { useNotification } from '../contexts/NotificationContext';

// IMPORTANT: Replace with your VAPID key from Firebase project settings
// Go to Project Settings > Cloud Messaging > Web configuration > Web Push certificates
const VAPID_KEY = 'BKEAer2C7f5kURbmpjXi8IuYIKEqhyRysMb6nlV0tpDXglWqrAooz4_bLWRcNlQ0RYsdfddLnERz_EdTsHtdO7U';

export const useFCM = () => {
    const { user } = useAuthContext();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            if (user) {
                setupFCM(user.uid);
            }
        }
    }, [user]);

    useEffect(() => {
        if (!messaging) return;
        // Handle foreground messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received.', payload);
            if (payload.notification) {
                showNotification(payload.notification.title ?? 'New Notification', payload.notification.body ?? '');
            }
        });

        return () => unsubscribe();
    }, [showNotification]);


    const setupFCM = async (uid: string) => {
        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                console.log('Notification permission granted.');
                
                const currentToken = await getToken(messaging, {
                    vapidKey: VAPID_KEY,
                });

                if (currentToken) {
                    console.log('FCM Token:', currentToken);
                    await saveTokenToFirestore(uid, currentToken);
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            } else {
                console.log('Unable to get permission to notify.');
            }
        } catch (error) {
            console.error('An error occurred while retrieving token. ', error);
        }
    };

    const saveTokenToFirestore = async (uid: string, token: string) => {
        try {
            const userTokensRef = collection(db, 'users', uid, 'tokens');
            const tokenDocRef = doc(userTokensRef, token); // Use token as doc ID to prevent duplicates
            
            const userDocRef = doc(db, 'users', uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, { email: user?.email });
            }

            await setDoc(tokenDocRef, { token });
            console.log('Token saved to Firestore.');
        } catch (error) {
            console.error('Error saving token to Firestore: ', error);
        }
    };
};
