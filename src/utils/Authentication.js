import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

let users = JSON.parse(localStorage.getItem('users')) || [];

const hashPassword = (password) => {
  return password + '_hashed';
};

export const signup = async (userData) => {
  const { LName, FName, MName, dob, gender, email, phoneNumber, username, password } = userData;
  const auth = getAuth();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

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
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('adminDetails', JSON.stringify(newUser));
    localStorage.setItem('currentUser', JSON.stringify(newUser)); // Also store the current user

    return newUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAdminDetails = () => {
  return JSON.parse(localStorage.getItem('adminDetails')) || {};
};

export const login = async (email, password) => {
  const auth = getAuth();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const storedUser = users.find(u => u.uid === user.uid);

    if (storedUser) {
      localStorage.setItem('currentUser', JSON.stringify(storedUser));
      localStorage.setItem('adminDetails', JSON.stringify(storedUser));
    }

    return storedUser;
  } catch (error) {
    throw new Error('Invalid email or password');
  }
};

export const logout = () => {
  const auth = getAuth();
  auth.signOut();
  localStorage.removeItem('currentUser');
  localStorage.removeItem('adminDetails');
};

export const isAuthenticated = () => {
  const auth = getAuth();
  return auth.currentUser !== null;
};

export const updateAdminDetails = (updatedDetails) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updatedDetails };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    localStorage.setItem('adminDetails', JSON.stringify(updatedUser));

    users = users.map(user => user.uid === updatedUser.uid ? updatedUser : user);
    localStorage.setItem('users', JSON.stringify(users));
  }
};

const storedUsers = localStorage.getItem('users');
if (storedUsers) {
  users = JSON.parse(storedUsers);
}
