
import { initializeApp } from "firebase/app";
import { getAuth ,
  // signOut,
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { getMessaging, 
  } from "firebase/messaging";

  
const firebaseConfig = {
  apiKey: "AIzaSyCacK4GQ0TyQgCm2zWepnhSCQ0JyiJqeo4",
  authDomain: "freshtrack-a5ce4.firebaseapp.com",
  projectId: "freshtrack-a5ce4",
  storageBucket: "freshtrack-a5ce4.firebasestorage.app",
  messagingSenderId: "468653965948",
  appId: "1:468653965948:web:5256445622b1be820e7ff9",
  measurementId: "G-NP3Y91BQ68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// Google Authentication Provider
export const googleProvider = new GoogleAuthProvider();

  export const registerWithEmailAndPassword = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };
  export const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };
  
  export { db, auth, collection, addDoc, getDocs, query, where , messaging };