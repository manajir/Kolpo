import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const isMockConfig = firebaseConfig.apiKey === 'mock-api-key-placeholder';

let app;
let db: any = null;
let auth: any = null;

try {
  if (isMockConfig) {
    console.warn("Using simulation mode. Please complete the cloud Firebase Setup in AI Studio to connect live databases.");
  } else {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
    auth = getAuth(app);
    console.log("Firebase initialized successfully on client side.");
  }
} catch (error) {
  console.error("Firebase startup exception caught. Running app in secure LocalStorage fallback mode:", error);
}

export { db, auth, isMockConfig };
