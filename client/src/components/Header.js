import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useAuth} from './AuthProvider'
import '../styles/Header.css';
import logo from '../assets/img/stochastome_logo.jfif';

function Header(){
    const {token, logOut} = useAuth();
    const navigate = useNavigate();
    
    const  handleLogout = () =>{
	logOut();
        };	
    return (
        <header>
          <img src={logo} alt="Stochastome Logo" />
          <nav>
            <ul className="nav-bar">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/register">Sign Up</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/about">About</Link></li>
               {token? (
              <li><button onClick={handleLogout}>Logout</button></li>
              ) : (
                 <li><Link to="/login">Login</Link></li>
                   )}
            </ul>
          </nav>
        </header>
      );
}

export default Header;
