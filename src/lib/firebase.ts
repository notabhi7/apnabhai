import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Use named database if specified in config, otherwise default
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path?: string): string {
  const err = error as { code?: string; message?: string };
  console.error(`Firestore error during ${operationType} on ${path || 'unknown'}:`, err);

  if (err.code === 'permission-denied') {
    return 'Permission denied: You do not have access to this resource. Please ensure you are signed in.';
  }
  if (err.code === 'unavailable') {
    return 'Firestore service is temporarily unavailable. Retrying or working offline.';
  }
  if (err.code === 'not-found') {
    return 'The requested resource was not found.';
  }
  return err.message || 'An unexpected database error occurred.';
}
