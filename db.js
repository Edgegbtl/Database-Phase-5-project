require('dotenv').config(); // Load environment variables from .env file
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'database-1.czwm4wsm6nuy.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'rootPass',
  database: 'RecipeBookDB',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully.');
    connection.release();
  }
});

module.exports = pool.promise();