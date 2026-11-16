import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ankandet.db');
const db = new Database(dbPath, {
  // verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable WAL mode for high concurrent read/write performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'buyer', -- 'buyer' or 'admin'
      city TEXT DEFAULT 'Prishtinë',
      address TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      description TEXT,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      condition_grade TEXT DEFAULT 'A', -- 'A': Si e re, 'B': E përdorur mirë, 'C': Shenja përdorimi
      condition_details TEXT,
      images TEXT, -- JSON array of image URLs
      cost_price REAL NOT NULL DEFAULT 0.00, -- Kostoja e blerjes / investimit
      starting_price REAL NOT NULL DEFAULT 1.00,
      current_price REAL NOT NULL DEFAULT 1.00,
      reserve_price REAL DEFAULT 0.00,
      buy_now_price REAL DEFAULT NULL,
      min_bid_increment REAL DEFAULT 1.00,
      auction_start DATETIME NOT NULL,
      auction_end DATETIME NOT NULL,
      original_end_time DATETIME NOT NULL,
      anti_snip_minutes INTEGER DEFAULT 2,
      anti_snip_extension INTEGER DEFAULT 3,
      anti_snip_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active', -- 'draft', 'active', 'ended', 'sold', 'cancelled'
      current_winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      total_bids INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      max_proxy_amount REAL DEFAULT NULL,
      bid_type TEXT DEFAULT 'manual', -- 'manual', 'proxy', 'buy_now'
      is_winning INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS proxy_bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      max_amount REAL NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(product_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      cost_price REAL DEFAULT 0.00, -- Kosto e mallit të shitur (COGS)
      final_price REAL NOT NULL,
      shipping_fee REAL DEFAULT 3.00,
      total_amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash_on_delivery',
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'processing',
      return_status TEXT DEFAULT 'none', -- 'none', 'requested', 'approved', 'refunded'
      refund_amount REAL DEFAULT 0.00,
      shipping_name TEXT NOT NULL,
      shipping_phone TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      tracking_number TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL, -- 'dogana', 'transport', 'marketing', 'operim', 'paketim', 'tjeter'
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      expense_date DATE DEFAULT (DATE('now')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS financial_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- 'product_sold', 'auction_ended', 'order_unpaid', 'high_views_no_bids', 'low_stock', 'suspicious_activity'
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT DEFAULT 'info', -- 'info', 'warning', 'danger', 'success'
      entity_type TEXT,
      entity_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS csv_imports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      total_rows INTEGER DEFAULT 0,
      successful_rows INTEGER DEFAULT 0,
      failed_rows INTEGER DEFAULT 0,
      status TEXT DEFAULT 'completed',
      error_log TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for ultra-fast querying & sorting
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_auction_end ON products(auction_end);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_bids_product ON bids(product_id);
    CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id);
    CREATE INDEX IF NOT EXISTS idx_proxy_product ON proxy_bids(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
    CREATE INDEX IF NOT EXISTS idx_logs_action ON activity_logs(action);
    CREATE INDEX IF NOT EXISTS idx_notif_unread ON admin_notifications(is_read);
  `);

  // Run dynamic schema migrations for existing DB
  safeAddColumn('products', 'cost_price', 'REAL NOT NULL DEFAULT 0.00');
  safeAddColumn('products', 'relist_count', 'INTEGER DEFAULT 0');
  safeAddColumn('products', 'last_cycled_at', 'DATETIME');
  safeAddColumn('orders', 'cost_price', 'REAL DEFAULT 0.00');
  safeAddColumn('orders', 'return_status', "TEXT DEFAULT 'none'");
  safeAddColumn('orders', 'refund_amount', 'REAL DEFAULT 0.00');

  // Initialize default initial capital if not set
  const initCap = db.prepare("SELECT value FROM financial_settings WHERE key = 'initial_investment'").get();
  if (!initCap) {
    db.prepare("INSERT INTO financial_settings (key, value) VALUES ('initial_investment', '31000.00')").run();
  }

  // Initialize auto-rotation settings if not set
  const initRotation = db.prepare("SELECT value FROM financial_settings WHERE key = 'auto_rotation_enabled'").get();
  if (!initRotation) {
    db.prepare("INSERT INTO financial_settings (key, value) VALUES ('auto_rotation_enabled', '1')").run();
    db.prepare("INSERT INTO financial_settings (key, value) VALUES ('rotation_pool_size', '100')").run();
    db.prepare("INSERT INTO financial_settings (key, value) VALUES ('rotation_duration_hours', '24')").run();
    db.prepare("INSERT INTO financial_settings (key, value) VALUES ('rotation_mode', 'random')").run();
  }

  // Initialize exchange rate (1 EUR = 100.00 ALL Lek)
  const initRate = db.prepare("SELECT value FROM financial_settings WHERE key = 'eur_to_all_rate'").get();
  if (!initRate) {
    db.prepare("INSERT INTO financial_settings (key, value) VALUES ('eur_to_all_rate', '100.00')").run();
  }

  console.log('Database schema & business tables initialized successfully at:', dbPath);
}

function safeAddColumn(table, column, definition) {
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
    const exists = tableInfo.some(c => c.name === column);
    if (!exists) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    }
  } catch (err) {
    // Ignore migration error if already exists
  }
}

export function logActivity(userId, action, entityType, entityId, details = {}, ip = null) {
  try {
    const stmt = db.prepare(`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, action, entityType, entityId, JSON.stringify(details), ip);
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
}

export function createAdminNotification({ type, title, message, severity = 'info', entityType = null, entityId = null, broadcastFn = null }) {
  try {
    const stmt = db.prepare(`
      INSERT INTO admin_notifications (type, title, message, severity, entity_type, entity_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(type, title, message, severity, entityType, entityId);

    if (broadcastFn) {
      broadcastFn('ADMIN_NOTIFICATION', {
        id: res.lastInsertRowid,
        type,
        title,
        message,
        severity,
        entityType,
        entityId,
        created_at: new Date().toISOString()
      });
    }

    return res.lastInsertRowid;
  } catch (e) {
    console.error('Failed to create admin notification:', e);
  }
}

export default db;
