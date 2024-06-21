import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../utils/Authentication';

function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup({
        fullName,
        dob,
        gender,
        email,
        phoneNumber,
        username,
        password
      });
      navigate('/login');
    } catch (error) {
      setError('Failed to sign up. Please try again.');
    }
  };

  return (
    <div className='flex flex-col px-5 h-120 w-120 mr-4 mb-20 mt-20 ml-6 bg-white rounded-md shadow-md'>
      <form className='mt-5 grid grid-cols-1 gap-6 flex-col flex-wrap items-center' onSubmit={handleSignup}>
        <h2 className='text-2xl font-bold mb-4 text-center'>Sign Up</h2>
        {error && <p className='text-red-500'>{error}</p>}
        <label className='flex flex-col w-2/3'>
          <span className='mb-2 font-medium'>Full Name</span>
          <input 
            type='text' 
            className='pl-10 w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col w-2/3'>
          <span className='mb-2 font-medium'>Date of Birth</span>
          <input 
            type='date' 
            className='pl-10 w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col w-2/3'>
          <span className='mb-2 font-medium'>Gender</span>
          <select
            className='pl-10 w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value=''>Select Gender</option>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
            <option value='other'>Other</option>
          </select>
        </label>
        <label className='flex flex-col w-2/3'>
          <span className='mb-2 font-medium'>Email</span>
          <input 
            type='email' 
            className='pl-10 w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col w-2/3'>
          <span className='mb-2 font-medium'>Phone Number</span>
          <input 
            type='tel' 
            className='pl-10 w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col w-2/3'>
          <span className='mb-2 font-medium'>Username</span>
          <input 
            type='text' 
            className='pl-10 w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col w-2/3'>
          <span className='mb-2 font-medium'>Password</span>
          <input 
            type='password' 
            className='pl-10 w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button 
          type='submit' 
          className='mt-5 mb-4 w-1/3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300'
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignupForm;
