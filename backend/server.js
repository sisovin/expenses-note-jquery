const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const dbPath = path.resolve(__dirname, 'datadb', 'expense.db');
const db = new sqlite3.Database(dbPath);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database
app.get('/init-db', (req, res) => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
      )`);

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
          res.status(500).send('Error initializing database');
        } else {
          res.send('Database initialized successfully');
        }
      }
    );
  });
});

// Drop tables
app.get('/drop-tables', (req, res) => {
  db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS expenses`);
    db.run(`DROP TABLE IF EXISTS categories`, (err) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
