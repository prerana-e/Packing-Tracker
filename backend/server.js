const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS belongings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      status TEXT DEFAULT 'unpacked',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Routes

// GET all belongings with optional search and filter
app.get('/api/belongings', (req, res) => {
  const { search, category, tag, status } = req.query;
  
  let query = 'SELECT * FROM belongings WHERE 1=1';
  let params = [];
  
  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (tag) {
    query += ' AND tags LIKE ?';
    params.push(`%"${tag}"%`);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Parse tags from JSON string
    const belongings = rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]')
    }));
    
    res.json(belongings);
  });
});

// GET single belonging by ID
app.get('/api/belongings/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM belongings WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Belonging not found' });
      return;
    }
    
    const belonging = {
      ...row,
      tags: JSON.parse(row.tags || '[]')
    };
    
    res.json(belonging);
  });
});

// POST create new belonging
app.post('/api/belongings', (req, res) => {
  const { name, category, tags = [], status = 'unpacked' } = req.body;
  
  if (!name || !category) {
    res.status(400).json({ error: 'Name and category are required' });
    return;
  }
  
  const tagsJson = JSON.stringify(tags);
  const now = new Date().toISOString();
  
  db.run(
    'INSERT INTO belongings (name, category, tags, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, tagsJson, status, now, now],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Return the created belonging
      db.get('SELECT * FROM belongings WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        const belonging = {
          ...row,
          tags: JSON.parse(row.tags || '[]')
        };
        
        res.status(201).json(belonging);
      });
    }
  );
});

// POST bulk create belongings
app.post('/api/belongings/bulk', (req, res) => {
  const { items } = req.body;
  
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Items array is required and must not be empty' });
    return;
  }
  
  // Validate all items
  for (let item of items) {
    if (!item.name || !item.category) {
      res.status(400).json({ error: 'Name and category are required for all items' });
      return;
    }
  }
  
  const now = new Date().toISOString();
  const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
  const values = [];
  
  items.forEach(item => {
    const { name, category, tags = [], status = 'unpacked' } = item;
    const tagsJson = JSON.stringify(tags);
    values.push(name, category, tagsJson, status, now, now);
  });
  
  db.run(
    `INSERT INTO belongings (name, category, tags, status, created_at, updated_at) VALUES ${placeholders}`,
    values,
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.status(201).json({ 
        message: `Successfully created ${items.length} items`,
        count: items.length 
      });
    }
  );
});

// PUT update belonging
app.put('/api/belongings/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, tags, status } = req.body;
  
  if (!name || !category) {
    res.status(400).json({ error: 'Name and category are required' });
    return;
  }
  
  const tagsJson = JSON.stringify(tags || []);
  const now = new Date().toISOString();
  
  db.run(
    'UPDATE belongings SET name = ?, category = ?, tags = ?, status = ?, updated_at = ? WHERE id = ?',
    [name, category, tagsJson, status, now, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Belonging not found' });
        return;
      }
      
      // Return the updated belonging
      db.get('SELECT * FROM belongings WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        const belonging = {
          ...row,
          tags: JSON.parse(row.tags || '[]')
        };
        
        res.json(belonging);
      });
    }
  );
});

// DELETE belonging
app.delete('/api/belongings/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM belongings WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Belonging not found' });
      return;
    }
    
    res.json({ message: 'Belonging deleted successfully' });
  });
});

// GET available categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM belongings ORDER BY category', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const categories = rows.map(row => row.category);
    res.json(categories);
  });
});

// GET available tags
app.get('/api/tags', (req, res) => {
  db.all('SELECT tags FROM belongings', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const allTags = new Set();
    rows.forEach(row => {
      const tags = JSON.parse(row.tags || '[]');
      tags.forEach(tag => allTags.add(tag));
    });
    
    res.json([...allTags].sort());
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Packing Tracker API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
