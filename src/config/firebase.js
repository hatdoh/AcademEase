import { initializeApp } from "firebase/app";
import { getAuth, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIu4AVozrEkyKEA_DYHxOZs0__OW2mObc",
  authDomain: "academease-c5a42.firebaseapp.com",
  databaseURL: "https://academease-c5a42-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "academease-c5a42",
  storageBucket: "academease-c5a42.appspot.com",
  messagingSenderId: "576932492833",
  appId: "1:576932492833:web:adfa7bcbf7c29de56d9560"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

export { auth, db };
export default app;

