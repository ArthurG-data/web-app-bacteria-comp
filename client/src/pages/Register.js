import React , {useState}from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'

import '../styles/Register.css';

const passwordRules = [
  "Password must be at least 8 characters long",
  "Password must contain at least one uppercase letter",
  "Password must contain at least one number",
  "Password must contain at least one special character",
];

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push(passwordRules[0]);
  if (!/[A-Z]/.test(password)) errors.push(passwordRules[1]);
  if (!/[0-9]/.test(password)) errors.push(passwordRules[2]);
  if (!/[!@#$%^&*]/.test(password)) errors.push(passwordRules[3]);
  console.log("Error test: this sould print", errors);
  return errors;
};

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate(); 

  const handleSignUp = async (e) => {
    e.preventDefault();

    const passwordErrors = validatePassword(password);
    

    // Log the password validation result
    console.log("Password validation result:", passwordErrors);

    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return;
    }

    try {
      const response = await axios.post('/signup', {
        username,
        password,
        email,
      })
      console.log('Sign up successful:', response.data);
      navigate('/confirm');
    } catch (error) {
      console.error('Error signing up:', error.response?.data || error.message);
      setErrors([error.response?.data.error || error.message]);
    }
  };

  return (
    <div className="register-container">
      <h1>Sign Up</h1>
      <form className="register-form" onSubmit={handleSignUp}>
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
        <input
          className="text_field"
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input type="submit" value="Sign Up" />
      </form>

      {errors.length > 0 && (
        <div className="error-messages">
          <h3>Password Requirements:</h3>
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

export default Register;
