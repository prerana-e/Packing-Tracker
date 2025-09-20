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
  
  // Schedule events table
  db.run(`
    CREATE TABLE IF NOT EXISTS schedule_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      day_type TEXT NOT NULL CHECK(day_type IN ('packing', 'move-in')),
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Junction table for many-to-many relationship between events and belongings
  db.run(`
    CREATE TABLE IF NOT EXISTS event_belongings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      belonging_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES schedule_events (id) ON DELETE CASCADE,
      FOREIGN KEY (belonging_id) REFERENCES belongings (id) ON DELETE CASCADE,
      UNIQUE(event_id, belonging_id)
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

// SCHEDULE EVENTS ENDPOINTS

// GET all schedule events
app.get('/api/schedule/events', (req, res) => {
  const { day_type } = req.query;
  
  let query = `
    SELECT se.*, 
           GROUP_CONCAT(eb.belonging_id) as belonging_ids,
           GROUP_CONCAT(b.name) as belonging_names
    FROM schedule_events se
    LEFT JOIN event_belongings eb ON se.id = eb.event_id
    LEFT JOIN belongings b ON eb.belonging_id = b.id
  `;
  
  let params = [];
  
  if (day_type) {
    query += ' WHERE se.day_type = ?';
    params.push(day_type);
  }
  
  query += ' GROUP BY se.id ORDER BY se.start_time';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const events = rows.map(row => ({
      ...row,
      belonging_ids: row.belonging_ids ? row.belonging_ids.split(',').map(id => parseInt(id)) : [],
      belonging_names: row.belonging_names ? row.belonging_names.split(',') : []
    }));
    
    res.json(events);
  });
});

// GET single schedule event by ID
app.get('/api/schedule/events/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT se.*, 
           GROUP_CONCAT(eb.belonging_id) as belonging_ids
    FROM schedule_events se
    LEFT JOIN event_belongings eb ON se.id = eb.event_id
    WHERE se.id = ?
    GROUP BY se.id
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    const event = {
      ...row,
      belonging_ids: row.belonging_ids ? row.belonging_ids.split(',').map(id => parseInt(id)) : []
    };
    
    res.json(event);
  });
});

// POST create new schedule event
app.post('/api/schedule/events', (req, res) => {
  const { title, start_time, end_time, day_type, notes = '', belonging_ids = [] } = req.body;
  
  if (!title || !start_time || !end_time || !day_type) {
    res.status(400).json({ error: 'Title, start_time, end_time, and day_type are required' });
    return;
  }
  
  if (!['packing', 'move-in'].includes(day_type)) {
    res.status(400).json({ error: 'day_type must be either "packing" or "move-in"' });
    return;
  }
  
  const now = new Date().toISOString();
  
  db.run(
    'INSERT INTO schedule_events (title, start_time, end_time, day_type, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, start_time, end_time, day_type, notes, now, now],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const eventId = this.lastID;
      
      // Link belongings to the event if provided
      if (belonging_ids.length > 0) {
        const placeholders = belonging_ids.map(() => '(?, ?, ?)').join(', ');
        const values = [];
        belonging_ids.forEach(belongingId => {
          values.push(eventId, belongingId, now);
        });
        
        db.run(
          `INSERT INTO event_belongings (event_id, belonging_id, created_at) VALUES ${placeholders}`,
          values,
          (err) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            
            // Return the created event with belongings
            res.status(201).json({ id: eventId, ...req.body, belonging_ids });
          }
        );
      } else {
        res.status(201).json({ id: eventId, ...req.body, belonging_ids: [] });
      }
    }
  );
});

// PUT update schedule event
app.put('/api/schedule/events/:id', (req, res) => {
  const { id } = req.params;
  const { title, start_time, end_time, day_type, notes, belonging_ids = [] } = req.body;
  
  if (!title || !start_time || !end_time || !day_type) {
    res.status(400).json({ error: 'Title, start_time, end_time, and day_type are required' });
    return;
  }
  
  const now = new Date().toISOString();
  
  db.run(
    'UPDATE schedule_events SET title = ?, start_time = ?, end_time = ?, day_type = ?, notes = ?, updated_at = ? WHERE id = ?',
    [title, start_time, end_time, day_type, notes || '', now, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }
      
      // Update event-belongings relationships
      db.run('DELETE FROM event_belongings WHERE event_id = ?', [id], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        if (belonging_ids.length > 0) {
          const placeholders = belonging_ids.map(() => '(?, ?, ?)').join(', ');
          const values = [];
          belonging_ids.forEach(belongingId => {
            values.push(id, belongingId, now);
          });
          
          db.run(
            `INSERT INTO event_belongings (event_id, belonging_id, created_at) VALUES ${placeholders}`,
            values,
            (err) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              
              res.json({ id: parseInt(id), ...req.body });
            }
          );
        } else {
          res.json({ id: parseInt(id), ...req.body, belonging_ids: [] });
        }
      });
    }
  );
});

// DELETE schedule event
app.delete('/api/schedule/events/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM schedule_events WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    res.json({ message: 'Event deleted successfully' });
  });
});

// GET belongings for a specific event
app.get('/api/schedule/events/:id/belongings', (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT b.* 
    FROM belongings b
    INNER JOIN event_belongings eb ON b.id = eb.belonging_id
    WHERE eb.event_id = ?
    ORDER BY b.name
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const belongings = rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]')
    }));
    
    res.json(belongings);
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
