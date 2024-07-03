import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../utils/Authentication';
import MorenoLogo from '../res/img/moreno-logo.jpg';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

   return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-md shadow-md w-80">
        <img src={MorenoLogo} alt="Moreno Logo" className="h-20 w-20 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-center">Hello Admin</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form className="grid grid-cols-1 gap-4" onSubmit={handleLogin}>
          <label className="flex flex-col">
            <span className="mb-2 font-medium">Email</span>
            <input
              type="email"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col">
            <span className="mb-2 font-medium">Password</span>
            <input
              type="password"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;