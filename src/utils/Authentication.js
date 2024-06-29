// src/utils/Authentication.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Initialize users from local storage (replace with actual initialization logic)
let users = JSON.parse(localStorage.getItem('users')) || [];

// Function to securely hash passwords (you can use a library like bcrypt)
const hashPassword = (password) => {
  // Simulated hashing
  return password + '_hashed'; // Replace with actual hashing logic
};

// Function to sign up a new user
export const signup = async (userData) => {
  const { LName, FName, MName, dob, gender, email, phoneNumber, username, password } = userData;

  const auth = getAuth();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store additional user data in local storage or your database
    const newUser = {
      uid: user.uid,
      LName,
      FName,
      MName,
      dob,
      gender,
      email,
      phoneNumber,
      username,
      password: hashPassword(password)
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users)); // Store in local storage or database
    localStorage.setItem('adminDetails', JSON.stringify(newUser)); // Store admin details

    return newUser; // Return the new user object
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to simulate getting admin details (replace with actual admin details retrieval)
export const getAdminDetails = () => {
  return JSON.parse(localStorage.getItem('adminDetails')) || {};
};

// Function to simulate login (replace with actual authentication)
export const login = async (email, password) => {
  const auth = getAuth();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const storedUser = users.find(u => u.uid === user.uid);
    
    localStorage.setItem('currentUser', JSON.stringify(storedUser));
    localStorage.setItem('adminDetails', JSON.stringify(storedUser));

    return storedUser;
  } catch (error) {
    throw new Error('Invalid username or password');
  }
};

// Function to simulate logout (replace with actual logout logic)
export const logout = () => {
  const auth = getAuth();
  auth.signOut();
  localStorage.removeItem('currentUser');
};

// Function to check if user is authenticated (replace with actual authentication logic)
export const isAuthenticated = () => {
  const auth = getAuth();
  return auth.currentUser !== null;
};

// Initialize users from local storage (replace with actual initialization logic)
const storedUsers = localStorage.getItem('users');
if (storedUsers) {
  users = JSON.parse(storedUsers);
}
