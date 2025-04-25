const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// Initialize SQLite database
const db = new sqlite3.Database('./meals.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Create meals table
    db.run(`
      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ingredients TEXT NOT NULL,
        calories REAL,
        protein REAL,
        fat REAL,
        fiber REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating meals table:', err.message);
      }
    });
    // Create posts table
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meal_name TEXT NOT NULL,
        quote_text TEXT NOT NULL,
        user_name TEXT NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating posts table:', err.message);
      }
    });
  }
});
/*
// Send File on get request
app.get('/', (req, res) => {
  res.sendFile('/public/index.html', {root: __dirname});
  });
*/
// POST endpoint to save meal data
app.post('/api/meals', (req, res) => {
  const { name, ingredients, calories, protein, fat, fiber } = req.body;

  if (!name || !ingredients) {
    return res.status(400).json({ error: 'Name and ingredients are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO meals (name, ingredients, calories, protein, fat, fiber)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    name,
    JSON.stringify(ingredients),
    calories,
    protein,
    fat,
    fiber,
    (err) => {
      if (err) {
        console.error('Error inserting meal:', err.message);
        return res.status(500).json({ error: 'Failed to save meal' });
      }
      res.status(201).json({ message: 'Meal saved successfully' });
    }
  );
  stmt.finalize();
});

// POST endpoint to save post data
app.post('/api/posts', (req, res) => {
  const { meal_name, quote_text, user_name, message } = req.body;

  if (!meal_name || !quote_text || !user_name) {
    return res.status(400).json({ error: 'Meal name, quote text, and user name are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO posts (meal_name, quote_text, user_name, message)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(
    meal_name,
    quote_text,
    user_name,
    message,
    (err) => {
      if (err) {
        console.error('Error inserting post:', err.message);
        return res.status(500).json({ error: 'Failed to save post' });
      }
      res.status(201).json({ message: 'Post saved successfully' });
    }
  );
  stmt.finalize();
});

// GET endpoint to retrieve all posts
app.get('/api/posts', (req, res) => {
  db.all('SELECT * FROM posts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching posts:', err.message);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
    res.json(rows);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});