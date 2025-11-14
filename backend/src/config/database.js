const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './wine_companion.db';
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          displayName TEXT NOT NULL,
          photoURL TEXT,
          preferences TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        )
      `);

      // Wine cellars table
      db.run(`
        CREATE TABLE IF NOT EXISTS wine_cellars (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          location TEXT NOT NULL,
          temperature REAL NOT NULL,
          humidity REAL NOT NULL,
          capacity INTEGER NOT NULL,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Cellar wines table
      db.run(`
        CREATE TABLE IF NOT EXISTS cellar_wines (
          id TEXT PRIMARY KEY,
          cellarId TEXT NOT NULL,
          userId TEXT NOT NULL,
          name TEXT NOT NULL,
          region TEXT NOT NULL,
          vintage TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          purchasePrice REAL NOT NULL,
          currentValue REAL,
          grape TEXT,
          winery TEXT,
          drinkByDate INTEGER,
          notes TEXT,
          isSustainable BOOLEAN DEFAULT 0,
          addedDate INTEGER,
          purchaseDate INTEGER,
          storageLocation TEXT,
          agingPotential INTEGER,
          isOpened BOOLEAN DEFAULT 0,
          openedDate INTEGER,
          timestamp INTEGER,
          FOREIGN KEY (cellarId) REFERENCES wine_cellars (id) ON DELETE CASCADE,
          FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_cellar_wines_userId ON cellar_wines(userId)');
      db.run('CREATE INDEX IF NOT EXISTS idx_cellar_wines_cellarId ON cellar_wines(cellarId)');

      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

// Helper function to run queries with promises
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

// Helper function to get single row
const getRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Helper function to get multiple rows
const getAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  runQuery,
  getRow,
  getAll
}; 