// AdminDetails.js

import React, { useState, useEffect } from 'react';
import { getAdminDetails, logout } from '../utils/Authentication';
import { useNavigate } from 'react-router-dom';

function AdminDetails() {
  const [admin, setAdmin] = useState({ username: '', name: '', email: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const details = getAdminDetails();
    setAdmin(details);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdmin(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('adminDetails', JSON.stringify(admin));
    alert('Details updated successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className='p-5'>
      <h2 className='text-2xl font-bold mb-4'>Admin Details</h2>
      <div className='flex flex-col'>
        <label className='mb-2 font-medium'>Username</label>
        <input
          type='text'
          name='username'
          value={admin.username}
          onChange={handleInputChange}
          className='mb-4 p-2 border border-gray-300 rounded-md'
          disabled
        />
        <label className='mb-2 font-medium'>Name</label>
        <input
          type='text'
          name='name'
          value={admin.name}
          onChange={handleInputChange}
          className='mb-4 p-2 border border-gray-300 rounded-md'
        />
        <label className='mb-2 font-medium'>Email</label>
        <input
          type='email'
          name='email'
          value={admin.email}
          onChange={handleInputChange}
          className='mb-4 p-2 border border-gray-300 rounded-md'
        />
        <button
          onClick={handleSave}
          className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 mr-2'
        >
          Save
        </button>
        <button
          onClick={handleLogout}
          className='px-4 py-2 mt-7 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300'
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminDetails;
