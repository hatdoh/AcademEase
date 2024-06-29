// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIu4AVozrEkyKEA_DYHxOZs0__OW2mObc",
  authDomain: "academease-c5a42.firebaseapp.com",
  projectId: "academease-c5a42",
  storageBucket: "academease-c5a42.appspot.com",
  messagingSenderId: "576932492833",
  appId: "1:576932492833:web:adfa7bcbf7c29de56d9560"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);