// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, authenticated }) => {
  return authenticated ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
