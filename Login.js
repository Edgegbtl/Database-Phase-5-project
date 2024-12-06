import React, { useState } from 'react';
import axios from 'axios'; // To handle HTTP requests
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!username || !password) {
      setErrorMessage('Please fill in both fields');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Send login request to backend
      const response = await axios.post('http://localhost:5000/login', {
        username,
        password,
      });

      if (response.data?.token) {
        // If login is successful, redirect to the home page
        console.log('Login successful:', response.data);

        // Save the token in localStorage
        localStorage.setItem('authToken', response.data.token); // Store the JWT token

        // Clear the form and redirect to home
        setUsername('');
        setPassword('');
        navigate('/home'); // Redirect to Home page
      } else {
        setErrorMessage('Invalid username or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
      <p>New user? <Link to="/register">Create an account</Link></p> {/* Link to Registration */}
    </div>
  );
};

export default Login;

