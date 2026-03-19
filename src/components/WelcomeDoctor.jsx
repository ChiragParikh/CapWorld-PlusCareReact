import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import RegisterCase from './RegisterCase';
import ManageAssistant from './ManageAssistant';
import ManageCase from './ManageCase';
import LogoutButton from './LogoutButton';
import PatientTable from './PatientTable';
import PatientForm from './PatientForm';
import { useState, useEffect } from 'react';
import PendingCase from './PendingCase';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

function WelcomeDoctor()
{
  const [value, setValue] = React.useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Update date-time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  const userJson = localStorage.getItem("user");
  let doctorName = null
  if (userJson) {
    const user = JSON.parse(userJson); // convert back to object
    doctorName = user.firstName + ' ' + user.lastName;
  }  

  return (
    <>
      <div>
        <h1 align = 'center' style={{color: "#07a5e3ff"}}>CapWorld PlusCare</h1>
        <h3>Welcome Dr {doctorName}</h3>
        {/* Row with Logout and Date-Time */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <LogoutButton />
          <div>{currentDateTime.toLocaleString()}</div>
        </div>
      </div>
      <Box
        sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', minHeight: '100vh' }}
      >
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
        >
          <Tab label="Register Case" {...a11yProps(0)} />
          <Tab label="Pending Case" {...a11yProps(1)} />
          <Tab label="Patient Form" {...a11yProps(2)} />
          <Tab label="Manage Assistant" {...a11yProps(3)} />
          <Tab label="Patient Table" {...a11yProps(4)} />
          <Tab label="Manage Case" {...a11yProps(5)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <RegisterCase/>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PendingCase/>
        </TabPanel>
        <TabPanel value={value} index={2}>
          <PatientForm/>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <ManageAssistant/>
        </TabPanel>
        <TabPanel value={value} index={4}>
          <PatientTable/>
        </TabPanel>
        <TabPanel value={value} index={5}>
          <ManageCase/>
        </TabPanel>
      </Box>
    </>
  );
}
export default WelcomeDoctor;
