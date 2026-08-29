import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence verbose internal backoff and warning logs
try {
  setLogLevel('error');
} catch {
  // Ignore
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

export default app;
