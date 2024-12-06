import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css'; // Import the external CSS file

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [review, setReview] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/recipes'); // Replace with your endpoint
        if (response.data.length > 0) {
          setRecipes(response.data);
          setSelectedRecipe(response.data[0]); // Set the first recipe as the default
        } else {
          setErrorMessage('Sorry, we couldn\'t find a recipe suitable for you.');
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setErrorMessage('Failed to load recipes. Please try again later.');
      }
    };

    fetchRecipes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove the token
    navigate('/login'); // Redirect to login page on logout
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`); // Redirect to Search.js with the query
    }
  };

  const handleCreateRecipe = () => {
    navigate('/create-recipe'); // Navigate to Create Recipe page
  };

  const handleReviewSubmit = async () => {
    if (!review) {
      alert('Please select a review before submitting.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/reviews', { // Replace with your review endpoint
        recipeID: selectedRecipe.ID,
        rating: review,
      });
      alert('Review submitted successfully!');
      setReview(''); // Reset review dropdown
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  return (
    <div>
      <div className="top-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search for recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        <button onClick={handleCreateRecipe} className="create-button">
          Create Recipe
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="main-content">
        <h1>Welcome to the Home Page</h1>
        <p>You have successfully logged in!</p>
      </div>

      {/* Recipe Popup */}
      <div className="popup">
        {selectedRecipe ? (
          <div className="recipe-popup">
            <h2>{selectedRecipe.RName}</h2>
            <p><strong>Serving Size:</strong> {selectedRecipe.ServingSize}</p>
            <p><strong>Difficulty:</strong> {selectedRecipe.Difficulty}</p>
            <p><strong>Diet:</strong> {selectedRecipe.Diet}</p>
            <p><strong>Preparation Time:</strong> {selectedRecipe.PrepTime}</p>
            <p><strong>Source:</strong> {selectedRecipe.Source || 'N/A'}</p>

            {/* Review Dropdown */}
            <div className="review-section">
              <label htmlFor="review">Give a Review:</label>
              <select
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
              <button onClick={handleReviewSubmit} className="submit-review">
                Submit Review
              </button>
            </div>
          </div>
        ) : (
          <p className="error-message">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default Home;



