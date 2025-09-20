const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Sample data to seed the database
const sampleBelongings = [
  {
    name: "Laptop",
    category: "electronics",
    tags: ["essential", "work", "fragile"],
    status: "unpacked"
  },
  {
    name: "Winter Jacket",
    category: "clothes",
    tags: ["winter", "outerwear"],
    status: "packed"
  },
  {
    name: "Passport",
    category: "documents",
    tags: ["important", "travel"],
    status: "unpacked"
  },
  {
    name: "Phone Charger",
    category: "electronics",
    tags: ["essential", "daily-use"],
    status: "packed"
  },
  {
    name: "Textbooks",
    category: "books",
    tags: ["study", "heavy"],
    status: "unpacked"
  },
  {
    name: "Bedsheets",
    category: "bedding",
    tags: ["comfort", "dorm"],
    status: "packed"
  }
];

db.serialize(() => {
  // Clear existing data
  db.run('DELETE FROM belongings');
  
  // Insert sample data
  const stmt = db.prepare(`
    INSERT INTO belongings (name, category, tags, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  sampleBelongings.forEach(item => {
    stmt.run(item.name, item.category, JSON.stringify(item.tags), item.status);
  });
  
  stmt.finalize();
  
  console.log('Database seeded with sample data!');
});

db.close();
