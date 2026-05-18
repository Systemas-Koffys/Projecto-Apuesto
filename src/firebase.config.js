import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOQ4LJi-UkxKse6FlgU_jIeJo8x9zQf_0",
  authDomain: "projecto-apuesto.firebaseapp.com",
  projectId: "projecto-apuesto",
  storageBucket: "projecto-apuesto.firebasestorage.app",
  messagingSenderId: "1015454387778",
  appId: "1:1015454387778:web:54bf6e1cb5a40e9574a7db",
  measurementId: "G-274TDTGRWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
