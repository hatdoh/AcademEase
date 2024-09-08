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
import AddSection from './components/AddSection';
import SchoolForm from './components/SchoolForm';
import ViewAttendanceSummary from './components/ViewAttendanceSummary';
import FaceRecognition from './pages/FaceRecognition';
import './index.css'; 
import ViewGrades from './components/ViewGrades';
import Teachers from './super-admin/Teachers';
import TeacherDetails from './super-admin/TeacherDetails';

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
          <Route path="/" element={<PrivateRoute authenticated={authenticated} element={<Sections />} />} />
          {/*<Route path="/sections" element={<PrivateRoute authenticated={authenticated} element={<Sections />} />} />*/}
          <Route path="/add-section" element={<PrivateRoute authenticated={authenticated} element={<AddSection />} />} />
          <Route path="/school-form" element={<PrivateRoute authenticated={authenticated} element={<SchoolForm />} />} />
          <Route path="/profile/:id" element={<StudentProfile />} />
          <Route path="/view-grades/:id" element={<ViewGrades />} />
          <Route path="/view-attendance-summary/:id" element={<ViewAttendanceSummary />} />
          <Route path="/attendance-summary" element={<PrivateRoute authenticated={authenticated} element={<AttendanceSummary />} />} />
          <Route path="/create-questions" element={<PrivateRoute authenticated={authenticated} element={<CreateQuestions />} />} />
          <Route path="/item-analysis" element={<PrivateRoute authenticated={authenticated} element={<ItemAnalysis />} />} />
          <Route path="/sf2" element={<PrivateRoute authenticated={authenticated} element={<SchoolFormTwo />} />} />
          <Route path="/account" element={<PrivateRoute authenticated={authenticated} element={<Admin />} />} />
          <Route path="/admin-details" element={<PrivateRoute authenticated={authenticated} element={<AdminDetails />} />} />
          <Route path="/add-account" element={<PrivateRoute authenticated={authenticated} element={<AddAccount />} />} />
          <Route path="/teachers" element={<PrivateRoute authenticated={authenticated} element={<Teachers />} />} />
          <Route path="/teacher-details/:id" element={<PrivateRoute authenticated={authenticated} element={<TeacherDetails />} />} />
          <Route path="/face-recognition" element={<PrivateRoute authenticated={authenticated} element={<FaceRecognition />} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
