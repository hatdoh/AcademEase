import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../utils/Authentication';

function SignupForm() {
  const [LName, setLName] = useState('');
  const [FName, setFName] = useState('');
  const [MName, setMName] = useState('');
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
        LName,
        FName,
        MName,
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
    <div className='flex flex-col px-5 py-10 h-auto w-full max-w-3xl mx-auto bg-white rounded-md shadow-md'>
      <form className='grid grid-cols-1 md:grid-cols-3 gap-6' onSubmit={handleSignup}>
        <h2 className='col-span-3 text-2xl font-bold mb-4 text-center'>Sign Up</h2>
        {error && <p className='col-span-3 text-red-500 text-center'>{error}</p>}
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Last Name</span>
          <input 
            type='text' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='Last Name'
            value={LName}
            onChange={(e) => setLName(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>First Name</span>
          <input 
            type='text' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='First Name'
            value={FName}
            onChange={(e) => setFName(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Middle Name</span>
          <input 
            type='text' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='Middle Name'
            value={MName}
            onChange={(e) => setMName(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Date of Birth</span>
          <input 
            type='date' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='Date of Birth'
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Gender</span>
          <select
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
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
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Email</span>
          <input 
            type='email' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Phone Number</span>
          <input 
            type='tel' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='Phone Number'
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Username</span>
          <input 
            type='text' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Password</span>
          <input 
            type='password' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <div className='col-span-3 flex justify-center'>
          <button 
            type='submit' 
            className='mt-5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300'
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;
