// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBIHBda0v1uHor7HLhV4JeClj51c1jIsU",
  authDomain: "ac-movie-club.firebaseapp.com",
  projectId: "ac-movie-club",
  storageBucket: "ac-movie-club.appspot.com", // Fixed the storageBucket URL
  messagingSenderId: "712370038259",
  appId: "1:712370038259:web:7bb4d0662aa226b56cde86",
  measurementId: "G-95SX8B7T8M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Firestore Database
export const analytics = getAnalytics(app); // Firebase Analytics (if needed)
