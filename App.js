import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Registration from './Registration';
import Home from './Home';
import CreateRecipe from './CreateRecipe'; // Import CreateRecipe component

function App() {
  const isAuthenticated = !!localStorage.getItem('authToken'); // Check if the user is authenticated

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Default route redirects to login or home based on authentication */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} />} />

          {/* Login and Registration routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />

          {/* Home route, accessible only if the user is authenticated */}
          <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />

          {/* CreateRecipe route, accessible only if the user is authenticated */}
          <Route path="/create-recipe" element={isAuthenticated ? <CreateRecipe /> : <Navigate to="/login" />} />

          {/* Catch-all route to redirect unknown paths to the login page */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;




