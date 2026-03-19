import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import LogoutButton from './LogoutButton';
import PatientTable from './PatientTable';
import PatientForm from './PatientForm';
import CreateCase from './CreateCase';

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

export default function WelcomeAssistant()
{
    const [value, setValue] = React.useState(0);
    
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    
    const userJson = localStorage.getItem("user");
    let assistantName = null
    if (userJson) {
        const user = JSON.parse(userJson); // convert back to object
        assistantName = user.firstName + ' ' + user.lastName;
    }  

    return(
        <>
          <div>
            <h1 align = 'center' style={{color: "#07a5e3ff"}}>CapWorld PlusCare</h1>
            <h3>Welcome Assistant {assistantName}</h3>
            <LogoutButton />
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
              <Tab label="Patient Form" {...a11yProps(0)} />
              <Tab label="Patient Table" {...a11yProps(1)} />
              <Tab label="Create Case" {...a11yProps(2)} />
            </Tabs>
            <TabPanel value={value} index={0}>
                <PatientForm/>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <PatientTable/>
            </TabPanel>
            <TabPanel value={value} index={2}>
              <CreateCase/>
            </TabPanel>
          </Box>
        </>
    );
}
