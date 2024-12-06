import React, { useState } from 'react';
import axios from 'axios';

const CreateRecipe = () => {
  const [recipeData, setRecipeData] = useState({
    rName: '',
    servingSize: '',
    difficulty: '',
    diet: '',
    prepTime: '',
    ingredients: [{ name: '', unit: '', substitutes: '' }],
    techniques: [{ name: '' }],
    source: '',
    category: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecipeData({ ...recipeData, [name]: value });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...recipeData.ingredients];
    updatedIngredients[index][field] = value;
    setRecipeData({ ...recipeData, ingredients: updatedIngredients });
  };

  const handleTechniqueChange = (index, value) => {
    const updatedTechniques = [...recipeData.techniques];
    updatedTechniques[index].name = value;
    setRecipeData({ ...recipeData, techniques: updatedTechniques });
  };

  const addIngredientField = () => {
    setRecipeData({
      ...recipeData,
      ingredients: [...recipeData.ingredients, { name: '', unit: '', substitutes: '' }],
    });
  };

  const addTechniqueField = () => {
    setRecipeData({
      ...recipeData,
      techniques: [...recipeData.techniques, { name: '' }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken'); // Get the token from local storage
    if (!token) {
      setErrorMessage('No token found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/create-recipe', // Ensure the endpoint matches your backend
        {
          rName: recipeData.rName,
          servingSize: recipeData.servingSize,
          difficulty: recipeData.difficulty,
          diet: recipeData.diet,
          prepTime: recipeData.prepTime,
          ingredients: recipeData.ingredients,
          techniques: recipeData.techniques,
          source: recipeData.source || null, // Send null if source is not provided
          category: recipeData.category,
        },
        { headers: { Authorization: `Bearer ${token}` } } // Add Bearer prefix for JWT
      );

      setSuccessMessage(response.data.message || 'Recipe successfully created!');
      setErrorMessage('');
      // Optionally reset the form
      setRecipeData({
        rName: '',
        servingSize: '',
        difficulty: '',
        diet: '',
        prepTime: '',
        ingredients: [{ name: '', unit: '', substitutes: '' }],
        techniques: [{ name: '' }],
        source: '',
        category: '',
      });
    } catch (error) {
      console.error('Error creating recipe:', error);
      setErrorMessage(error.response?.data?.error || 'An error occurred');
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <h2>Create a New Recipe</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="rName"
          placeholder="Recipe Name"
          value={recipeData.rName}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="servingSize"
          placeholder="Serving Size"
          value={recipeData.servingSize}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="difficulty"
          placeholder="Difficulty Level"
          value={recipeData.difficulty}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="diet"
          placeholder="Diet"
          value={recipeData.diet}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="prepTime"
          placeholder="Preparation Time"
          value={recipeData.prepTime}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={recipeData.category}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="source"
          placeholder="Source (Optional)"
          value={recipeData.source}
          onChange={handleInputChange}
        />

        <h4>Ingredients</h4>
        {recipeData.ingredients.map((ingredient, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Ingredient Name"
              value={ingredient.name}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Unit (Optional)"
              value={ingredient.unit}
              onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
            />
            <input
              type="text"
              placeholder="Substitutes (Optional)"
              value={ingredient.substitutes}
              onChange={(e) => handleIngredientChange(index, 'substitutes', e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addIngredientField}>
          Add Ingredient
        </button>

        <h4>Techniques</h4>
        {recipeData.techniques.map((technique, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Technique Name"
              value={technique.name}
              onChange={(e) => handleTechniqueChange(index, e.target.value)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addTechniqueField}>
          Add Technique
        </button>

        <button type="submit">Submit Recipe</button>
      </form>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default CreateRecipe;





