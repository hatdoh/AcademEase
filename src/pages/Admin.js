import React from 'react';

function Admin() {
  return (
    <div className='flex flex-col px-10 h-96 w-full mr-4 mb-20 mt-20 ml-6 bg-white rounded-md shadow-md'>
      <h2 className='text-2xl font-bold mb-4'>Update Account</h2>
      <form className='ml-40 mt-5 grid grid-cols-2 gap-2 flex flex-col flex-wrap gap-2 item-center'>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Profile</span>
          <input 
            type='file' 
            className='pl-10 w-2/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Name</span>
          <input 
            type='text' 
            className='pl-10 w-2/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Username</span>
          <input 
            type='text' 
            className='pl-10 w-2/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
          />
        </label>
        <label className='flex flex-col'>
          <span className='mb-2 font-medium'>Password</span>
          <input 
            type='password' 
            className='pl-10 w-2/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300'
          />
        </label>
        <button 
          type='submit' 
          className='mt-20 ml-full w-1/2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300'
        >
          Update
        </button>
      </form>
    </div>
  );
}

export default Admin;
