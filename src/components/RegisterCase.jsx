import * as React from 'react';
import api from '../api';
import { useState } from 'react';
import { 
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Autocomplete
} from '@mui/material';


function RegisterCase()
{

    const [inputs, setInputs] = useState({});
    const [firstNameInput, setFirstNameInput] = useState("");
    const [lastNameInput, setLastNameInput] = useState("");
    const [addressInput, setAddressInput] = useState("");
    const [firstNameOptions, setFirstNameOptions] = useState([]);
    const [lastNameOptions, setLastNameOptions] = useState([]);
    const [addressOptions, setAddressOptions] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    
    const handleChange = (event) => 
    {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    const handleSearchByFirstName = async (value) => {
      setFirstNameInput(value);
      setInputs((values) => ({ ...values, firstName: value }));

      if (!value) {
        // if cleared, reset everything
        setInputs({});
        setLastNameInput("");
        setAddressInput("");
        return;
      }

      if (value.length >= 1) {
        try {
          const response = await api.get("/searchpatientsbyfirstname",{
            params: {firstName: value}
          });
          setFirstNameOptions(response.data);
        } catch (err) {
          console.error("Search error:", err);
        }
      } else {
        setFirstNameOptions([]);
      }
    };

    const handleSearchByLastName = async (value) => {
      setLastNameInput(value);
      setInputs((values) => ({ ...values, lastName: value }));

      if (!value) {
        setInputs({});
        setFirstNameInput("");
        setAddressInput("");
        return;
      }

      if (value.length >= 1) {
        try {
          const response = await api.get("/searchpatientsbylastname",{
            params: {lastName: value}
          });
          setLastNameOptions(response.data);
        } catch (err) {
          console.error("Search error:", err);
        }
      } else {
        setLastNameOptions([]);
      }
    };

    const handleSearchByAddress = async (value) => {
      setAddressInput(value);
      setInputs((values) => ({ ...values, address: value }));

      if (!value) {
        setInputs({});
        setFirstNameInput("");
        setLastNameInput("");
        return;
      }

      if (value.length >= 1) {
        try {
          const response = await api.get("/searchpatientsbyaddress",{
            params: {address: value}
          });
          setAddressOptions(response.data);
        } catch (err) {
          console.error("Search error:", err);
        }
      } else {
        setAddressOptions([]);
      }
    };

    const handleSelectPatient = (patient) => {
      if (patient) {
        // Autofill all form fields
        setInputs(patient);
        setFirstNameInput(patient.firstName || "");
        setLastNameInput(patient.lastName || "");
        setAddressInput(patient.address || "");
      }else {
        setInputs({});
      }
    };

    const handleSubmit = (event) =>
    {
        event.preventDefault();

        setSubmitted(true);   // mark submit attempt

        if (!isCaseValid()) {
          return; // don't send to API if invalid
        }

        const payload = {
            ...inputs,
            patient: {
              id: inputs.id   // 👈 THIS is the key fix
            }
        };
      
        delete payload.id; // optional cleanup
        delete payload.firstName;
        delete payload.lastName;
        delete payload.address;
        delete payload.email;
        delete payload.contact;
      
        api.post('/addcase', payload)
            .then(response => {
                // Handle successful response
                alert("Case Submitted Successfully!");
                setInputs({});
                setFirstNameInput("");
                setLastNameInput("");
                setAddressInput("");
                setSubmitted(false);
            })
            .catch(error => {
                // Handle errors
                console.error('Error sending data:', error);
            });

    }

    const isCaseValid = () => {

      const age = inputs.age;

      // Required text fields
      if (!inputs.firstName?.trim()) return false;
      if (!inputs.lastName?.trim()) return false;
        
      // Age (required)
      if (age === "" || age === undefined) return false;
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) return false;

      // Gender (required)
      if (!inputs.gender) return false;

      // Symptoms (required)
      if(!inputs.symptoms?.trim()) return false;

      // Fees (required)
      if (inputs.fees === "" || inputs.fees === undefined || inputs.fees === null) {
          return false;
      }

      const feeNum = Number(inputs.fees);
      if (isNaN(feeNum) || feeNum <= 0) {
          return false;
      }
        
      return true;
    };

    return (
        <>
            <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ p: 2, width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* First 3 Horizontal Sections */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                
                {/* Section 1 */}
                <Box sx={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Autocomplete
                    freeSolo
                    options={firstNameOptions}
                    getOptionLabel={(option) => option.firstName}
                    inputValue={firstNameInput}
                    onInputChange={(event, newValue) => handleSearchByFirstName(newValue)}
                    onChange={(event, newValue) => handleSelectPatient(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="First Name"
                        name="firstName"
                        value={inputs.firstName || ""}
                        onChange={handleChange}
                        error={submitted && !inputs.firstName?.trim()}  // shows red border if empty
                        helperText={submitted && !inputs.firstName?.trim() ? "First Name is required" : ""}
                        required
                        fullWidth
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="subtitle1">
                            {option.id} | {option.firstName} {option.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.email} | {option.contact}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                  <Autocomplete
                    freeSolo
                    options={lastNameOptions}
                    inputValue={lastNameInput}
                    getOptionLabel={(option) => option.lastName}
                    onInputChange={(event, newValue) => handleSearchByLastName(newValue)}
                    onChange={(event, newValue) => handleSelectPatient(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Last Name"
                        name="lastName"
                        value={inputs.lastName || ""}
                        onChange={handleChange}
                        error={submitted && !inputs.lastName?.trim()}  // shows red border if empty
                        helperText={submitted && !inputs.lastName?.trim() ? "Last Name is required" : ""}
                        required
                        fullWidth
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="subtitle1">
                            {option.id} | {option.firstName} {option.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.email} | {option.contact}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                  <Autocomplete
                    freeSolo
                    options={addressOptions}
                    inputValue={addressInput}
                    getOptionLabel={(option) => option.address}
                    onInputChange={(event, newValue) => handleSearchByAddress(newValue)}
                    onChange={(event, newValue) => handleSelectPatient(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Address"
                        name="address"
                        value={inputs.address || ""}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        fullWidth
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="subtitle1">
                            {option.id} | {option.firstName} {option.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.email} | {option.contact}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                  <TextField 
                    label="Email" 
                    name="email" 
                    type="email" 
                    value={inputs.email || ""}
                    onChange={handleChange}
                    fullWidth 
                  />
                  <TextField 
                    label="Contact" 
                    name="contact" 
                    value={inputs.contact || ""}
                    onChange={handleChange}
                    fullWidth 
                  />
                </Box>
                
                {/* Section 2 */}
                <Box sx={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 1.3 }}>
                  <TextField
                    label="Patient Id"
                    name = "patientId"
                    type="number"
                    value = {inputs.id || ""}
                    readOnly
                    onChange={handleChange}
                    fullWidth
                  />
                  <TextField 
                    label="Age" 
                    name="age" 
                    type="number" 
                    value={inputs.age || ""}
                    onChange={handleChange}
                    fullWidth 
                  />
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select 
                      label="Gender" 
                      name="gender"
                      value={inputs.gender || ""}
                      onChange={handleChange}
                    >
                      <MenuItem value="M">M</MenuItem>
                      <MenuItem value="F">F</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField 
                    label="Weight (kg)" 
                    name="weight" 
                    type="number" 
                    value={inputs.weight || ""}
                    onChange={handleChange}
                    fullWidth 
                  />
                  <TextField 
                    label="Height (cm)" 
                    name="height" 
                    type="number" 
                    value = {inputs.height || ""}
                    onChange={handleChange}
                    fullWidth 
                  />
                  <FormControl fullWidth>
                    <InputLabel>Blood Group</InputLabel>
                    <Select 
                      label="Blood Group" 
                      name="bloodGroup"
                      value={inputs.bloodGroup || ""}
                      onChange={handleChange}
                    >
                      <MenuItem value="A+">A+</MenuItem>
                      <MenuItem value="A-">A-</MenuItem>
                      <MenuItem value="B+">B+</MenuItem>
                      <MenuItem value="B-">B-</MenuItem>
                      <MenuItem value="O+">O+</MenuItem>
                      <MenuItem value="O-">O-</MenuItem>
                      <MenuItem value="AB+">AB+</MenuItem>
                      <MenuItem value="AB-">AB-</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                {/* Section 3 */}
                <Box sx={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField 
                    label="Disease" 
                    name="disease" 
                    multiline rows={3} 
                    value={inputs.disease || ""}
                    onChange={handleChange}
                    fullWidth 
                  />
                  <TextField 
                    label="Current Medication" 
                    name="currentMedication" 
                    multiline rows={4} 
                    value={inputs.currentMedication || ""}
                    onChange={handleChange}
                    fullWidth 
                  />
                  <TextField 
                    label="Reactive To" 
                    name="reactiveTo" 
                    multiline rows={3} 
                    value = {inputs.reactiveTo || ""}
                    onChange={handleChange}
                    fullWidth 
                  />
                </Box>
                
              </Box>
                
              {/* Symptoms, Diagnosis, Treatment, Advice (horizontally divided equally) */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField 
                  label="Symptoms" 
                  name="symptoms" 
                  value = {inputs.symptoms || ""}
                  onChange={handleChange}
                  multiline rows={4} 
                  sx={{ flex: 1 }} 
                  error={submitted && !inputs.symptoms?.trim()}  // shows red border if empty
                  helperText={submitted && !inputs.symptoms?.trim() ? "Symptoms is required" : ""}
                  required
                  fullWidth 
                />
                <TextField 
                  label="Diagnosis" 
                  name="diagnosis" 
                  value={inputs.diagnosis || ""}
                  onChange={handleChange}
                  multiline rows={4} 
                  sx={{ flex: 1 }} 
                  fullWidth 
                />
                <TextField 
                  label="Treatment" 
                  name="treatment" 
                  value={inputs.treatment || ""}
                  onChange={handleChange}
                  multiline 
                  rows={4} 
                  sx={{ flex: 1 }} 
                  fullWidth 
                />
                <TextField 
                  label="Advice" 
                  name="advice" 
                  value={inputs.advice || ""}
                  onChange={handleChange}
                  multiline 
                  rows={4} 
                  sx={{ flex: 1 }} 
                  fullWidth 
                />
              </Box>
                
              {/* Fees + Submit Button */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-start' }}>
                <TextField 
                  label="Fees" 
                  name="fees" 
                  type="number" 
                  value = {inputs.fees || ""}
                  onChange={handleChange}
                  sx={{ width: 200 }}
                  error={submitted && (inputs.fees ==="" || inputs.fees === undefined)}  // shows red border if empty
                  helperText={submitted && (inputs.fees ==="" || inputs.fees === undefined) ? "Fees is required" : ""}
                  required 
                />
                <Button 
                  type="submit"
                  variant="contained" 
                  color="primary"
                >
                  Submit
                </Button>
              </Box>
            </Box>
        </>
    );
}
export default RegisterCase;
