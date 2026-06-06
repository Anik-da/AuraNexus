import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBvAUMp0J4n9HO4TxfU4iV3T3vewEu0w0Q",
  authDomain: "aura-nexus-esp.firebaseapp.com",
  projectId: "aura-nexus-esp",
  storageBucket: "aura-nexus-esp.firebasestorage.app",
  messagingSenderId: "489529820718",
  appId: "1:489529820718:web:d2b9b04a5f06c364bac1bf",
  measurementId: "G-2SH2R8B38G"
};

// Initialize Firebase only once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics conditionally
export const getFirebaseAnalytics = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
};
