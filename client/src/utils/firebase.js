// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: "taskmanager-1bb5a.firebaseapp.com",
  projectId: "taskmanager-1bb5a",
  storageBucket: "taskmanager-1bb5a.appspot.com",
  messagingSenderId: "105347282660",
  appId: "1:105347282660:web:a575838beb88eef3b11ef1",
  measurementId: "G-6XMDXC8JJP",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
