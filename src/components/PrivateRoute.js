import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/Authentication';

const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
