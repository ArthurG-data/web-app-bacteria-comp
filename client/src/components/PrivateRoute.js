import React, {useContext} from 'react';
import { Outlet, Navigate  } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const PrivateRoute =() =>{
  // Check if the user is authenticated (example using local storage)
  const {token} = useAuth();
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
