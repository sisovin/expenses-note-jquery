const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2'); // Update to use argon2

const app = express();
const dbPath = path.resolve(__dirname, 'datadb', 'expense.db');
const db = new sqlite3.Database(dbPath);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// User Authentication
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await argon2.hash(password); // Use argon2 to hash password
    db.run(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashedPassword],
      (err) => {
        if (err) {
          res.status(400).send('Error signing up');
        } else {
          res.status(201).send('User signed up');
        }
      }
    );
  } catch (err) {
    res.status(500).send('Internal server error');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      res.status(400).send('Error logging in');
    } else if (user && await argon2.verify(user.password, password)) { // Use argon2 to verify password
      const token = jwt.sign({ id: user.id }, 'your_jwt_secret', {
        expiresIn: '1h',
      });
      res.json({ token });
    } else {
      res.status(401).send('Invalid email or password');
    }
  });
});

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).send('Access denied');
  }
  try {
    const verified = jwt.verify(token, 'your_jwt_secret');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

// Protect routes
app.get('/protected-route', authenticateJWT, (req, res) => {
  res.send('This is a protected route');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
