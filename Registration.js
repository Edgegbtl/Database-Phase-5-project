import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [diet, setDiet] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !diet) {
      setErrorMessage('All fields are required');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/add-user',
        {
          username,
          email,
          password,
          diet,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.message) {
        setSuccessMessage(response.data.message);
        setErrorMessage('');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error || 'Failed to create user.');
      } else if (error.request) {
        setErrorMessage('No response from server. Please try again later.');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
      setSuccessMessage('');
    }
  };

  return (
    <div className="registration-form">
      <h2>Create a New Account</h2>

      {errorMessage && <div className="error-message" style={{ color: 'red' }}>{errorMessage}</div>}
      {successMessage && <div className="success-message" style={{ color: 'green' }}>{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="diet">Preferred Diet</label>
          <input
            type="text"
            id="diet"
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            required
          />
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Registration;


