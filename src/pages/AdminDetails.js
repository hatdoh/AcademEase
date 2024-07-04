import React, { useState, useEffect } from 'react';
import { getAdminDetails, updateAdminDetails, logout, getCurrentUser, updatePassword } from '../utils/Authentication';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth } from '../config/firebase';

function AdminDetails() {
  const [admin, setAdmin] = useState({
    uid: '',
    email: '',
    lastName: '',
    firstName: '',
    middleName: '',
    dob: '',
    gender: '',
    phoneNumber: ''
  });
  const [formerPassword, setFormerPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          const adminDetails = await getAdminDetails(currentUser.uid);
          setAdmin({
            uid: currentUser.uid,
            email: adminDetails.email,
            lastName: adminDetails.lastName || '',
            firstName: adminDetails.firstName || '',
            middleName: adminDetails.middleName || '',
            dob: adminDetails.dob || '',
            gender: adminDetails.gender || '',
            phoneNumber: adminDetails.phoneNumber || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch admin details:', error.message);
      }
    };

    fetchAdminData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdmin(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSave = async () => {
    if (!/^09\d{9}$/.test(admin.phoneNumber)) {
      Swal.fire({
        title: 'Error',
        text: "Phone number must be exactly 11 digits and start with '09'.",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: "New password and confirm password do not match.",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (newPassword && !validatePassword(newPassword)) {
      Swal.fire({
        title: 'Error',
        text: "Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one symbol.",
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    try {
      await updateAdminDetails(admin.uid, {
        firstName: admin.firstName,
        lastName: admin.lastName,
        middleName: admin.middleName,
        dob: admin.dob,
        gender: admin.gender,
        phoneNumber: admin.phoneNumber
      });

      if (formerPassword && newPassword) {
        await updatePassword(auth.currentUser, formerPassword, newPassword);

        Swal.fire({
          title: 'Saved',
          text: "Details and password updated successfully!",
          icon: 'success',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          navigate('/login');
        });
      } else {
        // For non-password updates, just show a success message without redirection
        Swal.fire({
          title: 'Saved',
          text: "Details updated successfully!",
          icon: 'success',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          // Optionally, refresh the admin details or update the state
          // setAdmin({ ... }); // Update state if needed
        });
      }
    } catch (error) {
      console.error('Failed to update admin details:', error.message);
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
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
        <div className='flex mb-4'>
          <div className='flex-1 mr-2'>
            <label className='mb-2 font-medium'>Last Name</label>
            <input
              type='text'
              name='lastName'
              value={admin.lastName}
              onChange={handleInputChange}
              className='p-2 border border-gray-300 rounded-md w-full'
            />
          </div>
          <div className='flex-1 mx-2'>
            <label className='mb-2 font-medium'>First Name</label>
            <input
              type='text'
              name='firstName'
              value={admin.firstName}
              onChange={handleInputChange}
              className='p-2 border border-gray-300 rounded-md w-full'
            />
          </div>
          <div className='flex-1 ml-2'>
            <label className='mb-2 font-medium'>Middle Name</label>
            <input
              type='text'
              name='middleName'
              value={admin.middleName}
              onChange={handleInputChange}
              className='p-2 border border-gray-300 rounded-md w-full'
            />
          </div>
        </div>
        <label className='mb-2 font-medium'>Email</label>
        <input
          type='email'
          name='email'
          value={admin.email}
          onChange={handleInputChange}
          className='mb-4 p-2 border border-gray-300 rounded-md'
          disabled
        />
        <div className='flex mb-4'>
          <div className='mr-2'>
            <label className='mb-2 mr-2 font-medium'>Date of Birth</label>
            <input
              type='date'
              name='dob'
              value={admin.dob}
              onChange={handleInputChange}
              className='mb-4 p-2 border border-gray-300 rounded-md w-full'
            />
          </div>
          <div className='mx-2'>
            <label className='mb-2 mr-2 font-medium'>Gender</label>
            <select
              name='gender'
              value={admin.gender}
              onChange={handleInputChange}
              className='mb-4 p-2 border border-gray-300 rounded-md w-full'
            >
              <option value=''>Select Gender</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
              <option value='other'>Other</option>
            </select>
          </div>
          <div className='ml-2'>
            <label className='mb-2 mr-2 font-medium'>Phone Number</label>
            <input
              type='tel'
              name='phoneNumber'
              value={admin.phoneNumber}
              onChange={handleInputChange}
              className='mb-4 p-2 border border-gray-300 rounded-md w-full'
              maxLength='11'
            />
          </div>
        </div>

        <div className='flex mb-4'>
          <div className='mr-2'>
            <label className='mb-2 font-medium'>Former Password</label>
            <input
              type='password'
              name='formerPassword'
              value={formerPassword}
              onChange={(e) => setFormerPassword(e.target.value)}
              className='mb-4 p-2 border border-gray-300 rounded-md w-full'
            />
          </div>
          <div className='mx-2'>
            <label className='mb-2 font-medium'>New Password</label>
            <input
              type='password'
              name='newPassword'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='mb-4 p-2 border border-gray-300 rounded-md w-full'
            />
          </div>
          <div className='ml-2'>
            <label className='mb-2 font-medium'>Confirm Password</label>
            <input
              type='password'
              name='confirmPassword'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='mb-4 p-2 border border-gray-300 rounded-md w-full'
            />
          </div>
        </div>

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
