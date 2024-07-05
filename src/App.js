// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import Sidebar from './components/Sidebar';
import Sections from './pages/Sections';
import CreateQuestions from './pages/CreateQuestions';
import Dashboard from './pages/Dashboard';
import ItemAnalysis from './pages/ItemAnalysis';
import Admin from './pages/Admin';
import AttendanceSummary from './pages/AttendanceSummary';
import SchoolFormTwo from './pages/SF2';
import LoginForm from './pages/LoginForm';
import AdminDetails from './pages/AdminDetails'; 
import PrivateRoute from './components/PrivateRoute';
import SignupForm from './pages/SignupForm';
import AddAccount from './super-admin/AddAccount';
import StudentProfile from './components/StudentProfile';
import './index.css'; 

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();
  const isLoginRoute = location.pathname === '/login';
  const isSignUpRoute = location.pathname === '/signup';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {!isLoginRoute && !isSignUpRoute && <Sidebar />}
      <div className={`flex-1 ${isLoginRoute || isSignUpRoute ? 'flex justify-center items-center' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/" element={<PrivateRoute authenticated={authenticated} element={<Dashboard />} />} />
          <Route path="/sections" element={<PrivateRoute authenticated={authenticated} element={<Sections />} />} />
          <Route path="/profile/:id" element={<StudentProfile />} />
          <Route path="/attendance-summary" element={<PrivateRoute authenticated={authenticated} element={<AttendanceSummary />} />} />
          <Route path="/create-questions" element={<PrivateRoute authenticated={authenticated} element={<CreateQuestions />} />} />
          <Route path="/item-analysis" element={<PrivateRoute authenticated={authenticated} element={<ItemAnalysis />} />} />
          <Route path="/sf2" element={<PrivateRoute authenticated={authenticated} element={<SchoolFormTwo />} />} />
          <Route path="/account" element={<PrivateRoute authenticated={authenticated} element={<Admin />} />} />
          <Route path="/admin-details" element={<PrivateRoute authenticated={authenticated} element={<AdminDetails />} />} />
          <Route path="/add-account" element={<PrivateRoute authenticated={authenticated} element={<AddAccount />} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
