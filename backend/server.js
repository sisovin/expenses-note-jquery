const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const dbPath = path.resolve(__dirname, 'datadb', 'expense.db');
const db = new sqlite3.Database(dbPath);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database
app.get('/init-db', (req, res) => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error('Error creating categories table:', err.message);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL
    )`,
      (err) => {
        if (err) {
          console.error('Error creating incomes table:', err.message);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          category_id INTEGER,
          date TEXT NOT NULL,
          FOREIGN KEY (category_id) REFERENCES categories (id)
      )`,
      (err) => {
        if (err) {
          console.error('Error creating expenses table:', err.message);
          res.status(500).send('Error initializing database');
        } else {
          res.send('Database initialized successfully');
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          email TEXT NOT NULL,
          password TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
        }
      }
    );
  });
});

// Drop tables
app.get('/drop-tables', (req, res) => {
  db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS expenses`);
    db.run(`DROP TABLE IF EXISTS incomes`);
    db.run(`DROP TABLE IF EXISTS categories`);
    db.run(`DROP TABLE IF EXISTS users`, (err) => {
      if (err) {
        res.status(500).send('Error dropping tables');
      } else {
        res.send('Tables dropped successfully');
      }
    });
  });
});

// CRUD operations for categories
app.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) {
      res.status(400).send('Error retrieving categories');
    } else {
      res.json(rows);
    }
  });
});

app.post('/categories', (req, res) => {
  const { name } = req.body;
  console.log('Received category name:', name);
  if (!name) {
    return res.status(400).send('Category name is required');
  }
  db.run(`INSERT INTO categories (name) VALUES (?)`, [name], (err) => {
    if (err) {
      console.error('Error adding category:', err);
      res.status(400).send('Error adding category');
    } else {
      console.log('Category added successfully');
      res.status(201).send('Category added');
    }
  });
});

app.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.run(`UPDATE categories SET name = ? WHERE id = ?`, [name, id], (err) => {
    if (err) {
      res.status(400).send('Error updating category');
    } else {
      res.send('Category updated');
    }
  });
});

app.delete('/categories/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM categories WHERE id = ?`, id, (err) => {
    if (err) {
      res.status(400).send('Error deleting category');
    } else {
      res.send('Category deleted');
    }
  });
});

// CRUD operations for expenses
app.get('/expenses', (req, res) => {
  const query = `
    SELECT expenses.id, expenses.description, expenses.amount, expenses.date, categories.name as category_name
    FROM expenses
    LEFT JOIN categories ON expenses.category_id = categories.id
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(400).send('Error retrieving expenses');
    } else {
      res.json(rows);
    }
  });
});

app.get('/expenses/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT expenses.id, expenses.description, expenses.amount, expenses.date, expenses.category_id, categories.name as category_name
    FROM expenses
    LEFT JOIN categories ON expenses.category_id = categories.id
    WHERE expenses.id = ?
  `;
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(400).send('Error retrieving expense');
    } else {
      res.json(row);
    }
  });
});

app.post('/expenses', (req, res) => {
  const { description, amount, category_id, date } = req.body;
  db.run(
    `INSERT INTO expenses (description, amount, category_id, date) VALUES (?, ?, ?, ?)`,

    [description, amount, category_id, date],
    (err) => {
      if (err) {
        res.status(400).send('Error adding expense');
      } else {
        res.status(201).send('Expense added');
      }
    }
  );
});

app.put('/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { description, amount, category_id, date } = req.body;
  db.run(
    `UPDATE expenses SET description = ?, amount = ?, category_id = ?, date = ? WHERE id = ?`,
    [description, amount, category_id, date, id],
    (err) => {
      if (err) {
        res.status(400).send('Error updating expense');
      } else {
        res.send('Expense updated');
      }
    }
  );
});

app.delete('/expenses/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM expenses WHERE id = ?`, id, (err) => {
    if (err) {
      res.status(400).send('Error deleting expense');
    } else {
      res.send('Expense deleted');
    }
  });
});

// CRUD operations for incomes
app.get('/incomes', (req, res) => {
  db.all('SELECT * FROM incomes', [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

app.post('/incomes', (req, res) => {
  const { name, amount, date } = req.body;
  db.run(
    'INSERT INTO incomes (name, amount, date) VALUES (?, ?, ?)',
    [name, amount, date],
    function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.status(201).send({ id: this.lastID });
      }
    }
  );
});

app.put('/incomes/:id', (req, res) => {
  const { name, amount, date } = req.body;
  const { id } = req.params;
  db.run(
    'UPDATE incomes SET name = ?, amount = ?, date = ? WHERE id = ?',
    [name, amount, date, id],
    function (err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.send('Income updated successfully');
      }
    }
  );
});

app.delete('/incomes/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM incomes WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.send('Income deleted successfully');
    }
  });
});

// User Authentication
app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
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
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) {
      res.status(400).send('Error logging in');
    } else if (user && bcrypt.compareSync(password, user.password)) {
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
