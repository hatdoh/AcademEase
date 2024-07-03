import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, query, where, getDocs } from "firebase/firestore"; // Adjusted import
import { auth, db } from "../config/firebase";
import { useHistory } from "react-router-dom";

const superAdminEmail = 'academease@gmail.com';

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const isAdminLoggedIn = () => {
  const currentUser = auth.currentUser;
  return currentUser && currentUser.email !== superAdminEmail;
};

export const isSuperAdminLoggedIn = () => {
  const currentUser = auth.currentUser;
  return currentUser && currentUser.email === superAdminEmail;
};

export const addAccount = async (userData) => {
  const { lastName, firstName, middleName, dob, gender, phoneNumber, email, password } = userData;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const newUser = {
      uid: user.uid,
      lastName,
      firstName,
      middleName,
      dob,
      gender,
      phoneNumber,
      email,
      role: email === superAdminEmail ? 'superAdmin' : 'admin'
    };

    await setDoc(doc(db, "teachers-info", user.uid), newUser);

    return newUser;
  } catch (error) {
    let errorMessage = 'Failed to add account. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email already in use.';
    }
    throw new Error(errorMessage);
  }
};

export const getAdminDetails = async (uid) => {
  try {
    const docRef = doc(db, "teachers-info", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { uid, ...docSnap.data() }; // Include uid in returned data
    } else {
      throw new Error('Admin details not found');
    }
  } catch (error) {
    throw new Error('Failed to fetch admin details');
  }
};

export const getSuperAdmin = async () => {
  try {
    const q = query(db.collection("teachers-info"), where("role", "==", "superAdmin"));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    } else {
      throw new Error('Super admin not found');
    }
  } catch (error) {
    throw new Error('Failed to fetch super admin');
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getAdminDetails(user.uid);

    return userDoc;
  } catch (error) {
    throw new Error('Invalid email or password');
  }
};

export const logout = () => {
  signOut(auth).then(() => {
    window.location.href = "/login"; // Redirect to login page on logout
  });
};

export const isAuthenticated = () => {
  const currentUser = auth.currentUser;
  return currentUser !== null;
};

export const updateAdminDetails = async (uid, updatedDetails) => {
  try {
    const docRef = doc(db, "teachers-info", uid);
    await setDoc(docRef, updatedDetails, { merge: true });
  } catch (error) {
    throw new Error('Failed to update admin details');
  }
};
