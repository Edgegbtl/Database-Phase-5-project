import React, { useState } from 'react';
import axios from 'axios';
import './Search.css'; // Optional: For styling

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchQuery.trim() === '') {
      setErrorMessage('Please enter a search term.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.data.length > 0) {
        setSearchResults(response.data);
        setErrorMessage('');
      } else {
        setSearchResults([]);
        setErrorMessage('No results found.');
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setErrorMessage('Failed to fetch search results. Please try again.');
    }
  };

  return (
    <div className="search-page">
      <h1>Search Recipes</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter recipe name, ingredient, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="search-results">
        {searchResults.map((result) => (
          <div key={result.ID} className="result-item">
            <h2>{result.RName}</h2>
            <p><strong>Serving Size:</strong> {result.ServingSize}</p>
            <p><strong>Difficulty:</strong> {result.Difficulty}</p>
            <p><strong>Diet:</strong> {result.Diet}</p>
            <p><strong>Preparation Time:</strong> {result.PrepTime}</p>
            <p><strong>Category:</strong> {result.CName}</p>
            <p><strong>Source:</strong> {result.Source || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
