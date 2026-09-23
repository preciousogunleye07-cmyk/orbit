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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}
