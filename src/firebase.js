// This is a simplified setup for a no-build-tool environment.
// We are not using ES6 modules for our own files, so we'll attach
// the firebase services to the window object.

// We need to ensure this script is loaded before any script that needs firebase.

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Expose the services and key functions to the global scope
window.firebaseServices = {
    auth,
    db,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    collection,
    getDocs
};
