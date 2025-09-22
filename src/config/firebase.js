// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABd5eH2rlEav6dFDsazfJW6nUBPHHrQYM",
  authDomain: "take-your-seat-af5a7.firebaseapp.com",
  databaseURL: "https://take-your-seat-af5a7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "take-your-seat-af5a7",
  storageBucket: "take-your-seat-af5a7.firebasestorage.app",
  messagingSenderId: "557510709545",
  appId: "1:557510709545:web:f24040af7f1c733f77a738",
  measurementId: "G-X71RQQ6DWM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Realtime Database
export const db = getDatabase(app);

export default app;
