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

  // Check if username already exists
  if (users.some(user => user.username === username)) {
    throw new Error('Username already exists');
  }

  // Hash password before saving (replace with actual hashing)
  const hashedPassword = hashPassword(password);

  // Save user details
  const newUser = {
    LName,
    FName,
    MName,
    dob,
    gender,
    email,
    phoneNumber,
    username,
    password: hashedPassword
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users)); // Store in local storage or database
  localStorage.setItem('adminDetails', JSON.stringify(newUser)); // Store admin details

  return newUser; // Return the new user object
};

// Function to simulate getting admin details (replace with actual admin details retrieval)
export const getAdminDetails = () => {
  return JSON.parse(localStorage.getItem('adminDetails')) || {};
};

// Function to simulate login (replace with actual authentication)
export const login = (username, password) => {
  const user = users.find(user => user.username === username && user.password === hashPassword(password));
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('adminDetails', JSON.stringify(user)); // Store admin details

    return user; //binago kkooo
  }
  return false;
};

// Function to simulate logout (replace with actual logout logic)
export const logout = () => {
  localStorage.removeItem('currentUser');
};

// Function to check if user is authenticated (replace with actual authentication logic)
export const isAuthenticated = () => {
  return localStorage.getItem('currentUser') !== null;
};

// Initialize users from local storage (replace with actual initialization logic)
const storedUsers = localStorage.getItem('users');
if (storedUsers) {
  users = JSON.parse(storedUsers);
}
