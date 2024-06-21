import React from 'react';
import MorenoLogo from '../res/img/moreno-logo.jpg';

function LoginForm() {
  return (
    <div className='flex flex-col px-5 h-120 w-120 mr-4 mb-20 mt-20 ml-6 bg-white rounded-md shadow-md'>
      <form className='mt-5 grid grid-cols-1 gap-6 flex flex-col flex-wrap items-center'>
        <img src={MorenoLogo} alt="Moreno Logo" className='h-20 w-20' />
        <h2 className='text-2xl font-bold mb-4 text-center'>Hello Admin</h2>
        <label className='flex flex-col w-2/3'>
          <span className='mb-2 font-medium'>Username</span>
          <input 
            type='text' 
            className='pl-10 w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
          />
        </label>
        <label className='flex flex-col w-2/3'>
          <span className='mb-2 font-medium'>Password</span>
          <input 
            type='password' 
            className='pl-10 w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
          />
        </label>
        <button 
          type='submit' 
          className='mt-10 w-1/3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300'
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
