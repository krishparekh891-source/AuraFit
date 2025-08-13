// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-o1CFQIe9v7kTfMaxPpg676kB84atIUA",
  authDomain: "auragenie.firebaseapp.com",
  projectId: "auragenie",
  storageBucket: "auragenie.firebasestorage.app",
  messagingSenderId: "914812268430",
  appId: "1:914812268430:web:8cbd5cf8f6895ca311bedf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
