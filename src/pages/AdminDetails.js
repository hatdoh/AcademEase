import React, { useState, useEffect } from 'react';
import { getAdminDetails, updateAdminDetails, logout } from '../utils/Authentication';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function AdminDetails() {
  const [admin, setAdmin] = useState({
    name: '',
    email: '',
    lastName: '',
    firstName: '',
    middleName: '',
    dob: '',
    gender: '',
    phoneNumber: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const details = getAdminDetails();
    if (details) {
      setAdmin({
        name: `${details.firstName || ''} ${details.middleName || ''} ${details.lastName || ''}`.trim(),
        email: details.email,
        lastName: details.lastName || '',
        firstName: details.firstName || '',
        middleName: details.middleName || '',
        dob: details.dob || '',
        gender: details.gender || '',
        phoneNumber: details.phoneNumber || ''
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdmin(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSave = () => {
    updateAdminDetails(admin);
    Swal.fire ({
      title:'Saved',
      text: "Details updated successfully!",
      icon: 'success',
      confirmButtonColor: '#3085d6'
    });
  };

 

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  return (
    <div className='p-5'>
      <h2 className='text-2xl font-bold mb-4'>Admin Details</h2>
      <div className='flex flex-col'>
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
          disabled
        />

        <label className='mb-2 font-medium'>Date of Birth</label>
        <input
          type='date'
          name='dob'
          value={admin.dob}
          onChange={handleInputChange}
          className='mb-4 p-2 border border-gray-300 rounded-md'
        />
        <label className='mb-2 font-medium'>Gender</label>
        <select
          name='gender'
          value={admin.gender}
          onChange={handleInputChange}
          className='mb-4 p-2 border border-gray-300 rounded-md'
        >
          <option value=''>Select Gender</option>
          <option value='male'>Male</option>
          <option value='female'>Female</option>
          <option value='other'>Other</option>
        </select>
        <label className='mb-2 font-medium'>Phone Number</label>
        <input
          type='tel'
          name='phoneNumber'
          value={admin.phoneNumber}
          onChange={handleInputChange}
          className='mb-4 p-2 border border-gray-300 rounded-md'
        />
        <div className='flex items-center'>
          <button
            onClick={handleSave}
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 mr-2'
          >
            Save
          </button>
          <button
            onClick={handleLogout}
            className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300'
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDetails;
