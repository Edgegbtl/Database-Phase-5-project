const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the database connection
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Secret key for JWT
const JWT_SECRET = 'your-jwt-secret';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test the database connection
app.get('/test-connection', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ message: 'Database connected successfully!', result: rows });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed!', details: error });
  }
});

// Create a new user
app.post('/add-user', async (req, res) => {
  const { username, email, password, diet } = req.body;

  if (!username || !email || !password || !diet) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user data into the database
    const [result] = await db.execute(
      'INSERT INTO Users (email, Password, UserName, Diet, created_at) VALUES (?, ?, ?, ?, NOW())',
      [email, hashedPassword, username, diet]
    );

    res.json({ message: 'User added successfully!', userId: result.insertId });
  } catch (error) {
    console.error('Error adding user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'User with this email already exists.' });
    } else {
      res.status(500).json({ error: 'Failed to add user', details: error });
    }
  }
});

// Function to generate JWT token
const generateAuthToken = (user) => {
  const payload = {
    userId: user.UserId,
    username: user.UserName,
    email: user.email,
  };

  // Generate a token valid for 1 hour
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM Users WHERE UserName = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = generateAuthToken(user);
    return res.status(200).json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Invalid token format.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user data to the request object
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid token.' });
  }
};


// Create a new recipe (Protected route)
app.post('/create-recipe', verifyToken, async (req, res) => {
  const { rName, servingSize, difficulty, diet, prepTime, ingredients, techniques, source, category } = req.body;

  if (!rName || !servingSize || !difficulty || !diet || !prepTime || !ingredients || !techniques || !category) {
    return res.status(400).json({ error: 'All fields except source are required.' });
  }

  try {
    // Insert category if not exists
    const [categoryResult] = await db.execute('SELECT CID FROM Categories WHERE CName = ?', [category]);
    let categoryId;
    
    if (categoryResult.length === 0) {
      const [insertCategoryResult] = await db.execute('INSERT INTO Categories (CName) VALUES (?)', [category]);
      categoryId = insertCategoryResult.insertId;
    } else {
      categoryId = categoryResult[0].CID;
    }

    // Insert recipe into the Recipes table
    const [recipeResult] = await db.execute(
      'INSERT INTO Recipes (RName, ServingSize, Difficulty, Diet, PrepTime, Source, CID) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [rName, servingSize, difficulty, diet, prepTime, source, categoryId]
    );
    
    const recipeId = recipeResult.insertId;

    // Insert ingredients
    const ingredientIds = [];
    for (const name of ingredients.map((ingredient) => ingredient.name.trim())) {
      const [ingredientResult] = await db.execute('SELECT IID FROM Ingredients WHERE IName = ?', [name]);
      let ingredientId;

      if (ingredientResult.length === 0) {
        const [insertIngredientResult] = await db.execute('INSERT INTO Ingredients (IName) VALUES (?)', [name]);
        ingredientId = insertIngredientResult.insertId;
      } else {
        ingredientId = ingredientResult[0].IID;
      }

      ingredientIds.push(ingredientId);
    }
    for (const ingredientId of ingredientIds) {
      await db.execute('INSERT INTO RecipeIngredients (RecipeID, IngredientID) VALUES (?, ?)', [recipeId, ingredientId]);
    }

    // Insert techniques
    const techniqueIds = [];
    for (const name of techniques.map((technique) => technique.name.trim())) {
      const [techniqueResult] = await db.execute('SELECT TID FROM Techniques WHERE TName = ?', [name]);
      let techniqueId;

      if (techniqueResult.length === 0) {
        const [insertTechniqueResult] = await db.execute('INSERT INTO Techniques (TName) VALUES (?)', [name]);
        techniqueId = insertTechniqueResult.insertId;
      } else {
        techniqueId = techniqueResult[0].TID;
      }

      techniqueIds.push(techniqueId);
    }
    for (const techniqueId of techniqueIds) {
      await db.execute('INSERT INTO RecipeTechniques (RecipeID, TechniqueID) VALUES (?, ?)', [recipeId, techniqueId]);
    }

    res.json({ success: true, message: 'Recipe created successfully!', recipeId });
  } catch (error) {
    console.error('Error creating recipe:', error.message);
    res.status(500).json({ error: 'Failed to create recipe.', details: error.message });
  }
});

app.get('/search', async (req, res) => {
  const searchQuery = req.query.query;
  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  try {
    const [results] = await db.query(
      `SELECT Recipes.*, Categories.CName
       FROM Recipes
       LEFT JOIN Categories ON Recipes.CID = Categories.CID
       WHERE Recipes.RName LIKE ? OR Categories.CName LIKE ?`,
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );
    res.json(results);
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).json({ error: 'Failed to perform search.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});











