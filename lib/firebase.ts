import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent duplicate initialization in Next.js hot-reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Recursively strips undefined fields from an object so Firestore addDoc / updateDoc does not throw:
 * "Function addDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .map((item) => sanitizeFirestoreData(item))
      .filter((item) => item !== undefined) as unknown as T;
  }
  if (typeof data === "object") {
    // Preserve instances of Date, Timestamp, FieldValue or other non-plain-object classes
    if (data.constructor && data.constructor.name !== "Object" && data.constructor.name !== "") {
      return data;
    }
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = sanitizeFirestoreData(value);
      }
    }
    return clean as T;
  }
  return data;
}

export default app;
