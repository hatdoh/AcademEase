import React from 'react';
import './index.css'; // Import Tailwind CSS
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
// import Dashboard from './pages/Dashboard';
import Sections from './pages/Sections';
import CreateQuestions from './pages/CreateQuestions';
import Dashboard from './pages/Dashboard';
import ItemAnalysis from './pages/ItemAnalysis';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/sections' element={<Sections />} />
          <Route path='/create-questions' element={<CreateQuestions />} />
          <Route path='/item-analysis' element={<ItemAnalysis />} />
          <Route path='/account' element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;