const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = process.env.SQLITE_PATH || path.join(__dirname, 'ecom.sqlite');
const db = new sqlite3.Database(dbPath);

// Seed data
const initialProducts = [
  {
    title: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear acoustic fidelity.',
    price: 199.99,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 25,
  },
  {
    title: 'Minimalist Mechanical Keyboard',
    description: 'Compact 75% mechanical keyboard with customizable RGB backlighting, hot-swappable switches, and aluminum casing.',
    price: 119.50,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    stock: 40,
  },
  {
    title: 'Smart Fitness & Health Watch',
    description: 'Track daily workouts, heart rate, blood oxygen, sleep quality, and receive instant phone notifications in a sleek waterproof body.',
    price: 149.00,
    category: 'Electronics',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    stock: 18,
  },
  {
    title: 'Organic Cotton Everyday Hoodie',
    description: 'Ultra-soft, heavyweight 100% organic cotton fleece hoodie tailored for maximum comfort and lasting durability.',
    price: 65.00,
    category: 'Apparel',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    stock: 50,
  },
  {
    title: 'Handcrafted Full-Grain Leather Backpack',
    description: 'Vintage-inspired artisanal leather backpack featuring dedicated 15-inch laptop compartment and brass hardware.',
    price: 185.00,
    category: 'Apparel',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    stock: 12,
  },
  {
    title: 'Ceramic Pour-Over Coffee Dripper Set',
    description: 'Artisanal ceramic dripper with double-walled glass server and heat-resistant silicone collar for coffee lovers.',
    price: 48.00,
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    stock: 30,
  },
  {
    title: 'Stainless Steel Insulated Water Bottle (32oz)',
    description: 'Double-walled vacuum insulated canteen keeping liquids icy cold for 24h or steaming hot for 12h. BPA free.',
    price: 29.99,
    category: 'Home & Kitchen',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    stock: 65,
  },
  {
    title: 'Ergonomic Memory Foam Office Cushion',
    description: 'Contoured orthopedic seat cushion designed to relieve tailbone pressure and improve posture during long work hours.',
    price: 42.50,
    category: 'Office',
    image_url: 'https://images.unsplash.com/photo-1580481077191-45455648c66e?auto=format&fit=crop&w=800&q=80',
    stock: 22,
  }
];

// Promise helper for SQLite queries
function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function queryGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function queryRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function runExec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function initDB() {
  console.log(`Initializing SQLite database at: ${dbPath}`);

  await runExec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
    );
  `);

  // Seed default admin and user
  const userCount = await queryGet('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    console.log('Seeding default accounts (admin@example.com / admin123, user@example.com / user123)...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const customerHash = await bcrypt.hash('user123', 10);

    await queryRun(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Admin Store Manager', 'admin@example.com', adminHash, 'admin']
    );
    await queryRun(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Jane Customer', 'user@example.com', customerHash, 'customer']
    );
  }

  // Seed initial products
  const productCount = await queryGet('SELECT COUNT(*) as count FROM products');
  if (productCount.count === 0) {
    console.log('Seeding demo product catalog...');
    for (const p of initialProducts) {
      await queryRun(
        'INSERT INTO products (title, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [p.title, p.description, p.price, p.category, p.image_url, p.stock]
      );
    }
  }

  console.log('✅ SQLite database initialized and ready!');
}

module.exports = {
  db,
  queryAll,
  queryGet,
  queryRun,
  runExec,
  initDB,
};
