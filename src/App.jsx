import * as React from 'react';
import './App.css';
import Login from './components/Login';
import {Routes,Route} from "react-router-dom";
import AddDoctor from './components/AddDoctor';
import WelcomeAdmin from './components/WelcomeAdmin';
import ManageDoctor from './components/ManageDoctor';
import WelcomeDoctor from './components/WelcomeDoctor';
import PrivateRoute from './components/PrivateRoute';
import ManageAssistant from './components/ManageAssistant';
import WelcomeAssistant from './components/WelcomeAssistant';
import PatientTable from './components/PatientTable';

function App() {
  return (
    <div className='app-container'>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registerdoctor" element={
          <PrivateRoute>
            <AddDoctor />
          </PrivateRoute>
        } />
        <Route path = "/welcomeadmin" element = {
          <PrivateRoute>
            <WelcomeAdmin />
          </PrivateRoute>
        } />
        <Route path = "/managedoctor" element = {
          <PrivateRoute>
            <ManageDoctor />
          </PrivateRoute>
        } />
        <Route path = "/welcomedoctor" element = {
          <PrivateRoute>
            <WelcomeDoctor />
          </PrivateRoute>
        } />
        <Route path = "/manageassistant" element = {
          <PrivateRoute>
            <ManageAssistant />
          </PrivateRoute>
        } />
        <Route path='/patienttable' element = {
          <PrivateRoute>
            <PatientTable />
          </PrivateRoute>
        } />
        <Route path='/welcomeassistant' element = {
          <PrivateRoute>
            <WelcomeAssistant />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
