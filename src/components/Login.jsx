import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from './AuthContext';

function Login()
{
  
  const [inputs, setInputs] = useState({});
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleChange = (event) => 
  {
      const name = event.target.name;
      const value = event.target.value;
      setInputs(values => ({...values, [name]: value}))
  }
  
  const handleKeyDown = (event) =>
  {
    if(event.key==='Enter')
    {
      handleLogin(event);
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/verifylogin', inputs);
      
      const { token, userType, user } = response.data;
    
      if (token && userType) {
        login(token);
        // Store token in localStorage or sessionStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userType', userType); // optional
        localStorage.setItem('user',JSON.stringify(user));
        // Navigate to respective dashboard
        switch (userType) {
          case 'admin':
            navigate('/welcomeadmin');
            break;
          case 'doctor':
            navigate('/welcomedoctor');
            break;
          case 'assistant':
            navigate('/welcomeassistant');
            break;
          case 'patient':
            navigate('/welcomepatient');
            break;
          default:
            console.error('Unknown user type');
        }
      } else {
        console.error('Token or userType missing in response');
      }
    
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('token');   // clear stale token
      localStorage.removeItem('userType');
      alert("Invalid email or password");
    }
  };
  
  return (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center', // horizontal center
              alignItems: 'flex-start', // start from top instead of center
              minHeight: '100vh',
              paddingTop: '80px' // adjust this to move form down from top
            }}
          >
            <Box
              align='center'
              component="form"
              sx={{ 
                display: 'inline-block',      // shrink to fit
                textAlign: 'center',          // center title and controls
                border: '1px solid #ddd',     // border around everything
                borderRadius: '8px',          // rounded corners
                padding: '20px',              // space inside box
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // light shadow
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(216, 242, 249, 0.8)', // transparent background
                '& > :not(style)': { m: 1, width: '35ch' } 
              }}
              noValidate
              autoComplete="off"
              onKeyDown={handleKeyDown}
            >
                <h1 style={{ marginBottom: '20px' }}>Login to PlusCare</h1><br/>
                <FormControl required variant="filled" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="demo-simple-select-filled-label">Login As</InputLabel>
                  <Select
                    labelId="demo-simple-select-filled-label"
                    id="demo-simple-select-filled"
                    name="userType"
                    value={inputs.userType || ''}
                    onChange={handleChange}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={'admin'}>Admin</MenuItem>
                    <MenuItem value={'doctor'}>Doctor</MenuItem>
                    <MenuItem value={'assistant'}>Assistant</MenuItem>
                    <MenuItem value={'patient'}>Patient</MenuItem>
                  </Select>
                </FormControl>
                <br/>
                <TextField required 
                    id="filled-basic" 
                    label="Email" 
                    variant="filled"
                    name = "email"
                    value = {inputs.email || ''}
                    onChange = {handleChange} 
                />
                <br/>
                <TextField required
                    id="filled-password-input"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    variant="filled"
                    name = "password"
                    value = {inputs.password || ''}
                    onChange = {handleChange}
                />
                <br/>
                <Button onClick={handleLogin} variant="contained">Login</Button>
            </Box>
          </Box>
      </>
  );
}

export default Login;
