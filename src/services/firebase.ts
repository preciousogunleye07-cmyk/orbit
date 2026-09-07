import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const dbId = (firebaseConfig as any).firestoreDatabaseId;

    // Suppress non-critical transport warnings (e.g. offline fallback warnings during initial handshake)
    try {
      setLogLevel('error');
    } catch {
      // Ignore if not supported in environment
    }

    // Use experimentalForceLongPolling to avoid WebChannel stream buffering stalls in iframe sandboxes
    const firestoreSettings = {
      experimentalForceLongPolling: true,
    };

    try {
      db = dbId
        ? initializeFirestore(app, firestoreSettings, dbId)
        : initializeFirestore(app, firestoreSettings);
    } catch {
      db = dbId ? getFirestore(app, dbId) : getFirestore(app);
    }

    auth = getAuth(app);
  }
} catch (err) {
  console.warn('Firebase initialization notice:', err);
}

export { app, db, auth };

export const isFirebaseConfigured = (): boolean => {
  return Boolean(db !== null && app !== null);
};
