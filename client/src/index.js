import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AuthProvider from './components/AuthProvider';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

