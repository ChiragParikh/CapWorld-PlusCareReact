import { useState } from "react";
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import api from "../api";


function AddDoctor()
{
    const [inputs, setInputs] = useState({});

    const handleChange = (event) => 
    {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    const handleSubmit = (event) => 
    {
        event.preventDefault();
        const isFormValid = Object.values(inputs).every(val => val.trim() !== '');
        if (!isFormValid) 
        {
            alert("Please fill all fields.");
            return;
        }
        api.post('/adddoctor', inputs)
            .then(response => {
                // Handle successful response
                alert("New Doctor Added Successfully!");
                setInputs({});
            })
            .catch(error => {
                // Handle errors
                console.error('Error sending data:', error);
            });
    }
    return(
        <>
            <Box
                align='center'
                component="form"
                sx={{ '& > :not(style)': { m: 1, width: '35ch' } }}
                noValidate
                autoComplete="off"
            >
                <h1>Register a Doctor</h1><br/>
                <TextField 
                    name="firstName" 
                    value={inputs.firstName || ""}
                    onChange={handleChange}  
                    id="filled-basic" 
                    label="First Name" 
                    variant="filled" 
                /><br/>
                <TextField 
                    name="lastName" 
                    value={inputs.lastName || ""}  
                    onChange={handleChange}  
                    id="filled-basic" 
                    label="Last Name" 
                    variant="filled" 
                /><br/>
                <TextField 
                    name="clinicName" 
                    value={inputs.clinicName || ""}  
                    onChange={handleChange}  
                    id="filled-basic" 
                    label="Clinic Name" 
                    variant="filled" 
                /><br/>
                <TextField 
                    name="contact" 
                    type="tel"
                    value={inputs.contact || ""}  
                    onChange={handleChange}  
                    id="filled-basic" 
                    label="Contact No" 
                    variant="filled" 
                /><br/>
                <TextField 
                    name="email" 
                    type="email"
                    value={inputs.email || ""}  
                    onChange={handleChange}  
                    id="filled-basic" 
                    label="Email" 
                    variant="filled" 
                />
                <br/>
                <TextField
                    name = "password"
                    value={inputs.password || ""}
                    id="filled-password-input"
                    onChange={handleChange}  
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    variant="filled"
                />
                <br/>
                <Button onClick={handleSubmit} variant="contained">Add Doctor</Button>
            </Box>
        </>
    );
}

export default AddDoctor
