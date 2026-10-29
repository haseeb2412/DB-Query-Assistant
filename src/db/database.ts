import Database from 'better-sqlite3';

// Creates a local SQLite file named 'shop.db' in your project root
const db = new Database('shop.db');

/**
 * Initializes tables and populates them with sample data if empty.
 */
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      city TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Check if customers table is empty, then seed data
  const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
  
  if (customerCount.count === 0) {
    db.exec(`
      INSERT INTO customers (name, email, city) VALUES 
      ('Alice Smith', 'alice@example.com', 'New York'),
      ('Bob Jones', 'bob@example.com', 'Los Angeles'),
      ('Charlie Brown', 'charlie@example.com', 'Chicago'),
      ('Diana Prince', 'diana@example.com', 'Gotham');

      INSERT INTO products (name, category, price) VALUES 
      ('Wireless Mouse', 'Electronics', 29.99),
      ('Mechanical Keyboard', 'Electronics', 89.99),
      ('Standing Desk', 'Furniture', 299.99),
      ('Coffee Mug', 'Kitchen', 12.50),
      ('Noise-Canceling Headphones', 'Electronics', 199.99);

      INSERT INTO orders (customer_id, product_id, quantity, order_date) VALUES 
      (1, 1, 2, '2026-10-01'),
      (1, 3, 1, '2026-10-05'),
      (2, 2, 1, '2026-10-10'),
      (3, 4, 4, '2026-10-15'),
      (4, 5, 1, '2026-10-20');
    `);
    console.log('📦 SQLite database initialized and seeded successfully!');
  }
}

/**
 * Safely executes a SQL statement against our database.
 */
export function runQuery(sql: string) {
  const stmt = db.prepare(sql);
  return stmt.all();
}