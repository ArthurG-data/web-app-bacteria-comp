
import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminProfile from './pages/AdminProfile'
import PrivateRoute from './components/PrivateRoute';
import ConfirmMail from './pages/Confirm';
import Header from './components/Header';
import Login2 from './components/GoogleLogin';

function About() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src="https://www.stochastom.cab432.com/about"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="About"
      />
    </div>
  );
}

function App() {
  return (
      <div className='App'>
    
        <Header/>
        <main>
          <Routes>
            {/*Public routes*/}
            
            <Route path="login" element={<Login/>}/>
            <Route path="about" element={<About/>} />
            <Route path="register" element={<Register />}/>
            <Route path="confirm" element={<ConfirmMail />} />
            <Route path="login2" element={<Login2/>} />
            <Route path="*" element={<NotFound />} /> 

            {/*Protected routes*/}
      <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="profile" element={<Profile />}/>
            <Route path="adminprofile" element={<AdminProfile />}/>
            </Route>
          </Routes>
        </main>
      </div>
  );
}

export default App;
