// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhYKp5nlXlpCZw0WXGL1ChKH93AqJCnuA",
  authDomain: "mern-b6d97.firebaseapp.com",
  projectId: "mern-b6d97",
  storageBucket: "mern-b6d97.firebasestorage.app",
  messagingSenderId: "221086008294",
  appId: "1:221086008294:web:7ba0fc0dd9d76ca2eb0c27",
  measurementId: "G-8EEWNKFVRC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Export the authentication tools we need for the button
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();