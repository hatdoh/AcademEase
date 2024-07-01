import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../utils/Authentication';

function SignupForm() {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await signup({
        lastName,
        firstName,
        middleName,
        dob,
        gender,
        phoneNumber,
        email,
        password
      });
      navigate('/login');
    } catch (error) {
      setError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
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
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>First Name</span>
          <input 
            type='text' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='First Name'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Middle Name</span>
          <input 
            type='text' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='Middle Name'
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            required
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Date of Birth</span>
          <input 
            type='date' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
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
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Confirm Password</span>
          <input 
            type='password' 
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
            placeholder='Confirm Password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <div className='col-span-3 flex justify-center'>
          <button 
            type='submit' 
            className={`mt-5 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 ${loading ? 'cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;
