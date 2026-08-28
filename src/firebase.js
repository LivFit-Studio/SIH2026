import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCE0vMaIy2BbxZC17rCKMJZZWMCDj5bnRw",
  authDomain: "student-council-b5701.firebaseapp.com",
  projectId: "student-council-b5701",
  storageBucket: "student-council-b5701.firebasestorage.app",
  messagingSenderId: "836587419098",
  appId: "1:836587419098:web:5532d87380728886c07ce3",
  measurementId: "G-6F7Z8CFR9Z"
};

const app = initializeApp(firebaseConfig);

let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (err) {
    console.warn("Firebase Analytics disabled or not supported:", err.message);
  }
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
