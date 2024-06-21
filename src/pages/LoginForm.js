import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../utils/Authentication';
import MorenoLogo from '../res/img/moreno-logo.jpg';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
      <div className='flex items-center justify-center h-screen'>
        <div className='bg-white p-8 rounded-md shadow-md w-80'>
          <img src={MorenoLogo} alt="Moreno Logo" className='h-20 w-20 mx-auto mb-4' />
          <h2 className='text-2xl font-bold mb-4 text-center'>Hello Admin</h2>
          {error && <p className='text-red-500 mb-4'>{error}</p>}
          <form className='grid grid-cols-1 gap-4' onSubmit={handleLogin}>
            <label className='flex flex-col'>
              <span className='mb-2 font-medium'>Username</span>
              <input
                type='text'
                className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300'
            >
              Login
            </button>
            <p className='text-sm mt-2'>
              Don't have an account? <Link to='/signup' className='text-blue-500 hover:underline'>Sign up here</Link>
            </p>
          </form>
        </div>
      </div>
  );
}

export default LoginForm;
