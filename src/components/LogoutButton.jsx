import React from 'react';
import { useAuth } from './AuthContext'; // Update the path as per your structure
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();             // Clears token and sets auth to false
    navigate('/login');   // Redirect to login page
  };

  return (
    <Button color="secondary" variant="outlined" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
