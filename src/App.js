import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Sections from './pages/Sections';
import CreateQuestions from './pages/CreateQuestions';
import Dashboard from './pages/Dashboard';
import ItemAnalysis from './pages/ItemAnalysis';
import Admin from './pages/Admin';
import AttendanceSummary from './pages/AttendanceSummary';
import SchoolFormTwo from './pages/SF2';
import LoginForm from './pages/LoginForm';
import AdminDetails from './pages/AdminDetails'; // Import the new page
import PrivateRoute from './components/PrivateRoute';
import SignupForm from './pages/SignupForm';
import './index.css'; // Import Tailwind CSS

function App() {
  const location = useLocation();
  const isLoginRoute = location.pathname === '/login';
  const isSignUpRoute = location.pathname === '/signup';

  return (
    <div className="flex min-h-screen">
      {!isLoginRoute && !isSignUpRoute && <Sidebar />}
      <div className={`flex-1 ${isLoginRoute || isSignUpRoute ? 'flex justify-center items-center' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/sections" element={<PrivateRoute element={<Sections />} />} />
          <Route path="/attendance-summary" element={<PrivateRoute element={<AttendanceSummary />} />} />
          <Route path="/create-questions" element={<PrivateRoute element={<CreateQuestions />} />} />
          <Route path="/item-analysis" element={<PrivateRoute element={<ItemAnalysis />} />} />
          <Route path="/sf2" element={<PrivateRoute element={<SchoolFormTwo />} />} />
          <Route path="/account" element={<PrivateRoute element={<Admin />} />} />
          <Route path="/admin-details" element={<PrivateRoute element={<AdminDetails />} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
