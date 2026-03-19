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
  Autocomplete,
} from '@mui/material';

function PatientForm()
{

    const [inputs, setInputs] = useState({});
    const [firstNameInput, setFirstNameInput] = useState("");
    const [lastNameInput, setLastNameInput] = useState("");
    const [addressInput, setAddressInput] = useState("");
    const [firstNameOptions, setFirstNameOptions] = useState([]);
    const [lastNameOptions, setLastNameOptions] = useState([]);
    const [addressOptions, setAddressOptions] = useState([]);
    const [isExistingPatient, setIsExistingPatient] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (event) => 
    {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
        // If existing patient, mark as edited
        if (isExistingPatient) {
          setIsEdited(true);
        }
    }

    const handleSearchByFirstName = async (value) => {
      setFirstNameInput(value);
      setInputs((values) => ({ ...values, firstName: value }));

      if (!value) {
        // if cleared, reset everything
        setInputs({});
        setLastNameInput("");
        setAddressInput("");
        setIsExistingPatient(false);
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
        setIsExistingPatient(false);
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
        setIsExistingPatient(false);
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
        setIsExistingPatient(true);   // existing patient
        setIsEdited(false);           // not edited yet
      }else {
        setInputs({});
        setIsExistingPatient(false);  // new patient
        setIsEdited(false);
      }
    };

    const handleRegister = (event) => 
    {
        event.preventDefault();
        
        setSubmitted(true);   // mark submit attempt

        if (!isFormValid()) {
          return; // don't send to API if invalid
        }

        api.post('/addpatient', inputs)
            .then(response => {
                // Handle successful response
                alert("New Patient Added Successfully!");
                setInputs({});
                setFirstNameInput("");
                setLastNameInput("");
                setAddressInput("");
                setIsExistingPatient(false);
                setIsEdited(false);
            })
            .catch(error => {
                // Handle errors
                console.error('Error sending data:', error);
            });
    }

    const handleUpdate = async (event) => {
      event.preventDefault();
      try {
        await api.put(`/updatepatient`, inputs);
        alert("Patient Updated Successfully!");
        setInputs({});
        setFirstNameInput("");
        setLastNameInput("");
        setAddressInput("");
        setIsExistingPatient(false);
        setIsEdited(false);
      } catch (error) {
        console.error('Error updating data:', error);
      }
    };

    const handleDelete = async () => {
      if (!inputs.id) {
        alert("No patient selected to delete!");
        return;
      }
    
      const confirmDelete = window.confirm("Are you sure you want to delete this patient?");
      if (!confirmDelete) return;
    
      try {
        await api.delete(`/deletepatient/${inputs.id}`);
        alert("Patient deleted successfully!");
        setInputs({});
        setIsExistingPatient(false);
        setIsEdited(false);
      } catch (error) {
        console.error("Error deleting patient:", error);
        alert("Failed to delete patient.");
      }
    };

    const isFormValid = () => {

      const age = inputs.age;
      const weight = inputs.weight;
      const height = inputs.height;

      // Required text fields
      if (!inputs.firstName?.trim()) return false;
      if (!inputs.lastName?.trim()) return false;
        
      // Age (required)
      if (age === "" || age === undefined) return false;
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) return false;

      // Gender (required)
      if (!inputs.gender) return false;
    
      // Weight (optional)
      if (weight !== "" && weight !== undefined) {
        const weightNum = Number(weight);
        if (isNaN(weightNum) || weightNum < 1 || weightNum > 500) return false;
      }
    
      // Height (optional)
      if (height !== "" && height !== undefined) {
        const heightNum = Number(height);
        if (isNaN(heightNum) || heightNum < 30 || heightNum > 250) return false;
      }
    
      return true;
    };

    return(

      <Box 
        component="form" 
        noValidate 
        autoComplete="off" 
        sx={{ 
          p: 2,
          width: "100%",         // take full width inside container
          maxWidth: "1200px",    // stop stretching too much
          display: "flex",
          flexDirection: "column",          
          gap: 4
        }}>
          {/* Row 1 */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
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
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
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
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
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
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                label="Email"
                name="email"
                value={inputs.email || ""}
                onChange={handleChange}
                fullWidth
              />
            </Box>
              
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                label="Contact No"
                name="contact"
                value={inputs.contact || ""}
                onChange={handleChange}
                fullWidth
              />
            </Box>
          </Box>
              
          {/* Row 2 */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                required
                label="Age"
                name="age"
                type="number"
                value={inputs.age || ""}
                onChange={handleChange}
                error={
                  submitted &&
                  (!inputs.age || inputs.age < 0 || inputs.age > 120)
                }
                helperText={
                  submitted && !inputs.age
                    ? "Age is required"
                    : inputs.age !== undefined && (inputs.age < 0 || inputs.age > 120)
                      ? "Age must be between 0 and 120"
                      : ""
                }
                slotProps={{ input: { min: 0, max: 120 } }}
                fullWidth
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
              <FormControl fullWidth required>
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
                {submitted && !inputs.gender && (
                  <Typography variant="caption" color="error">
                    Gender is required
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                label="Weight (kg)"
                name="weight"
                type="number"
                value={inputs.weight || ""}
                onChange={handleChange}
                error={inputs.weight !== undefined && (inputs.weight < 1 || inputs.weight > 500)}
                helperText={
                  inputs.weight !== undefined && (inputs.weight < 1 || inputs.weight > 500)
                    ? "Weight must be between 1kg and 500kg"
                    : ""
                }
                slotProps={{ input: { min: 1, max: 500 } }}
                fullWidth
              />
            </Box>
              
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                label="Height (cm)"
                name="height"
                type="number"
                value={inputs.height || ""}
                onChange={handleChange}
                error={inputs.height !== undefined && (inputs.height < 30 || inputs.height > 250)}
                helperText={
                  inputs.height !== undefined && (inputs.height < 30 || inputs.height > 250)
                    ? "Height must be between 30cm and 250cm"
                    : ""
                }
                slotProps={{ input: { min: 30, max: 250 } }}
                fullWidth
              />
            </Box>
              
            <Box sx={{ flex: 1, minWidth: 200 }}>
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
          </Box>
              
          {/* Row 3 */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                label="Disease"
                name="disease"
                value={inputs.disease || ""}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
              
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                label="Current Medication"
                name="currentMedication"
                value={inputs.currentMedication || ""}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
              
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                label="Reactive To"
                name="reactiveTo"
                value={inputs.reactiveTo || ""}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </Box>
              
          {/* Button Secion */}
          <Box sx={{ mt: 2 }}>
            {isExistingPatient ? (
              <>
                <Button 
                  onClick={handleUpdate} 
                  variant="contained" 
                  color="secondary"
                  disabled={!isEdited || !isFormValid()}  // must be edited + valid
                >
                  Update
                </Button>
                <Button 
                  onClick={handleDelete} 
                  variant="contained" 
                  color="error"
                  sx={{ ml: 2 }}   // margin-left
                >
                  Delete
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleRegister} 
                variant="contained" 
                color="primary"
                disabled={submitted && !isFormValid()}   // 🔒 disable until valid
              >
                Register
              </Button>
            )}
          </Box>
      </Box>
    );
}
export default PatientForm;
