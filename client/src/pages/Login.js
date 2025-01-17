import React, {useState} from 'react';
import '../styles/Register.css';
import axios from 'axios'
import { useAuth } from '../components/AuthProvider';
import {useNavigate} from 'react-router-dom'

function Login() {
  const { user, setUser, loginAction } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [session, setSession] = useState('');
  const [errors, setErrors] = useState([]);

  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/register');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Signing in started');
      const response = await loginAction({ username, password });

      if (response.success) {
        setUser(username);
        console.log("User:", username);
        setUsername('');
        setPassword('');
        navigate('/Profile'); // Redirect to profile page
      } else if (response.requiresMfa) {
        // MFA required, handled in AuthProvider
        // You might want to show a message that MFA is required
      } else if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        setSession(response.Session);
        setErrors(['You need to set a new password.']);
      } else {
        setErrors([response.error || 'Login Failed']);
      }
    } catch (error) {
      console.error('Error signing in:', error.response?.data || error.message);
      setErrors([error.response?.data.error || error.message]);
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/complete-new-password', { username, newPassword, session });
      const data = response.data;

      if (data.message === "success") {
        localStorage.setItem('jwt-token', data.token);
        setUsername('');
        setPassword('');
        setNewPassword('');
        navigate('/'); // Redirect to the home page
      } else {
        setErrors([data.error || 'Failed to set new password']);
      }
    } catch (error) {
      console.error('Error setting new password:', error.response?.data?.error || error.message);
      setErrors([error.response?.data?.error || error.message]);
    }
  };

  return (
    <div className="register-container">
      <h1>Login</h1>
      <form className="register-form" onSubmit={handleLogin}>
        <input
          className="text_field"
          type="text"
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="text_field"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="submit" value="Login" />
      </form>
        <button type="button" onClick={handleSignUp}>Sign up</button>
      {errors.length > 0 && (
        <div className="error-messages">
          <ul>
            {errors.map((error, index) => (
              <li key={index} style={{ color: 'red' }}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


export default Login;
