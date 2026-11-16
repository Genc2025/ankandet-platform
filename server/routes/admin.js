import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as xlsx from 'xlsx';
import db, { logActivity, createAdminNotification } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { 
  importProductsFromCSV, 
  generateSampleCSV, 
  generateBulkDatasetCSV,
  generateSlug, 
  generateSKU 
} from '../importer.js';
import { broadcast } from '../websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.use(requireAdmin);

// Multer setup for CSV uploads and image uploads
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// =========================================================================
// 1. BUSINESS OVERVIEW & STATS
// =========================================================================
router.get('/stats', (req, res) => {
  try {
    const totalAuctions = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const activeAuctions = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'active'").get().count;
    const soldAuctions = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'sold'").get().count;
    const totalBids = db.prepare('SELECT COUNT(*) as count FROM bids').get().count;
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'buyer'").get().count;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'processing'").get().count;
    const completedOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'delivered'").get().count;

    // Sales over time periods
    const todaySales = db.prepare(`
      SELECT SUM(final_price) as total, COUNT(*) as count
      FROM orders 
      WHERE DATE(created_at) = DATE('now') AND order_status != 'cancelled'
    `).get();

    const weekSales = db.prepare(`
      SELECT SUM(final_price) as total, COUNT(*) as count
      FROM orders 
      WHERE created_at >= datetime('now', '-7 days') AND order_status != 'cancelled'
    `).get();

    const monthSales = db.prepare(`
      SELECT SUM(final_price) as total, COUNT(*) as count
      FROM orders 
      WHERE created_at >= datetime('now', '-30 days') AND order_status != 'cancelled'
    `).get();

    const totalRevenue = db.prepare(`
      SELECT SUM(final_price) as total 
      FROM orders 
      WHERE order_status != 'cancelled'
    `).get().total || 0;

    const totalCogs = db.prepare(`
      SELECT SUM(cost_price) as total 
      FROM orders 
      WHERE order_status != 'cancelled'
    `).get().total || 0;

    const totalExpenses = db.prepare('SELECT SUM(amount) as total FROM expenses').get().total || 0;
    const grossProfit = totalRevenue - totalCogs;
    const netProfit = grossProfit - totalExpenses;

    const newCustomersToday = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE role = 'buyer' AND DATE(created_at) = DATE('now')
    `).get().count;

    const recentLogs = db.prepare(`
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.id DESC
      LIMIT 12
    `).all();

    const conditionStats = db.prepare(`
      SELECT condition_grade, COUNT(*) as count 
      FROM products 
      GROUP BY condition_grade
    `).all();

    // Unread notifications count
    const unreadAlerts = db.prepare('SELECT COUNT(*) as count FROM admin_notifications WHERE is_read = 0').get().count;

    res.json({
      metrics: {
        totalAuctions,
        activeAuctions,
        soldAuctions,
        totalBids,
        totalUsers,
        totalOrders,
        pendingOrders,
        completedOrders,
        newCustomersToday,
        todaySales: {
          revenue: todaySales.total || 0,
          orders: todaySales.count || 0
        },
        weekSales: {
          revenue: weekSales.total || 0,
          orders: weekSales.count || 0
        },
        monthSales: {
          revenue: monthSales.total || 0,
          orders: monthSales.count || 0
        },
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        grossProfit: parseFloat(grossProfit.toFixed(2)),
        netProfit: parseFloat(netProfit.toFixed(2)),
        unreadAlerts
      },
      conditionStats,
      recentLogs
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Dështoi marrja e statistikave: ' + err.message });
  }
});

// =========================================================================
// 2. FINANCIAL CONTROL & EXPENSES
// =========================================================================
router.get('/financials', (req, res) => {
  try {
    const initCapRow = db.prepare("SELECT value FROM financial_settings WHERE key = 'initial_investment'").get();
    const initialInvestment = initCapRow ? parseFloat(initCapRow.value) : 31000.00;

    const totalRevenue = db.prepare("SELECT SUM(final_price) as total FROM orders WHERE order_status != 'cancelled'").get().total || 0;
    const totalCogs = db.prepare("SELECT SUM(cost_price) as total FROM orders WHERE order_status != 'cancelled'").get().total || 0;
    const grossProfit = totalRevenue - totalCogs;

    const expensesByCategory = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM expenses
      GROUP BY category
    `).all();

    const totalExpenses = expensesByCategory.reduce((sum, item) => sum + item.total, 0);
    const netProfit = grossProfit - totalExpenses;
    const profitMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Locked capital in warehouse (unsold products cost price)
    const lockedCapital = db.prepare(`
      SELECT 
        SUM(cost_price) as total_cost,
        SUM(starting_price) as total_retail_estimate,
        COUNT(*) as count
      FROM products 
      WHERE status IN ('active', 'draft')
    `).get();

    // Break-even status
    const breakEvenProgress = initialInvestment > 0 ? Math.min(100, Math.max(0, (netProfit / initialInvestment) * 100)) : 100;

    const rateRow = db.prepare("SELECT value FROM financial_settings WHERE key = 'eur_to_all_rate'").get();
    const exchangeRate = rateRow ? parseFloat(rateRow.value) : 100.00;

    res.json({
      initialInvestment,
      exchangeRate,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      cogs: parseFloat(totalCogs.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      profitMarginPct: parseFloat(profitMarginPct.toFixed(1)),
      lockedCapitalWarehouse: parseFloat((lockedCapital.total_cost || 0).toFixed(2)),
      retailValueWarehouse: parseFloat((lockedCapital.total_retail_estimate || 0).toFixed(2)),
      unsoldProductsCount: lockedCapital.count || 0,
      breakEvenProgress: parseFloat(breakEvenProgress.toFixed(1)),
      expensesByCategory
    });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi marrja e të dhënave financiare: ' + err.message });
  }
});

router.put('/financials/initial-investment', (req, res) => {
  try {
    const { amount } = req.body;
    const val = parseFloat(amount) || 0;
    db.prepare(`
      INSERT INTO financial_settings (key, value, updated_at)
      VALUES ('initial_investment', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(String(val));

    res.json({ message: 'Investimi fillestar u përditësua me sukses.', initialInvestment: val });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi përditësimi: ' + err.message });
  }
});

router.put('/financials/exchange-rate', (req, res) => {
  try {
    const { rate } = req.body;
    const val = parseFloat(rate);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({ error: 'Ju lutem jepni një kurs këmbimi të vlefshëm.' });
    }
    db.prepare(`
      INSERT INTO financial_settings (key, value, updated_at)
      VALUES ('eur_to_all_rate', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(String(val));

    logActivity(req.user?.id, 'UPDATE_EXCHANGE_RATE', 'financial_settings', null, { rate: val });
    res.json({ message: 'Kursi i këmbimit EUR/ALL u përditësua me sukses.', exchangeRate: val });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi përditësimi i kursit: ' + err.message });
  }
});

router.get('/expenses', (req, res) => {
  try {
    const expenses = db.prepare('SELECT * FROM expenses ORDER BY expense_date DESC, id DESC LIMIT 100').all();
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi ngarkimi i shpenzimeve.' });
  }
});

router.post('/expenses', (req, res) => {
  try {
    const { category, title, amount, expense_date, notes } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ error: 'Titulli dhe shuma janë të detyrueshme.' });
    }

    const info = db.prepare(`
      INSERT INTO expenses (category, title, amount, expense_date, notes)
      VALUES (?, ?, ?, COALESCE(?, DATE('now')), ?)
    `).run(category || 'operim', title.trim(), parseFloat(amount), expense_date || null, notes || '');

    logActivity(req.user.id, 'EXPENSE_ADDED', 'expense', info.lastInsertRowid, { title, amount });
    res.status(201).json({ message: 'Shpenzimi u regjistrua me sukses.', id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi regjistrimi i shpenzimit: ' + err.message });
  }
});

router.delete('/expenses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ message: 'Shpenzimi u fshi.' });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi fshirja e shpenzimit.' });
  }
});

// =========================================================================
// 3. DAILY INTERACTIVE CHART (Published, Sold, Realized Revenue)
// =========================================================================
router.get('/analytics/daily-chart', (req, res) => {
  try {
    const daysCount = parseInt(req.query.days || '14', 10);
    const dailyData = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      // Calculate day string
      const dateRow = db.prepare(`SELECT DATE('now', '-${i} days') as d`).get();
      const dateStr = dateRow.d;

      const published = db.prepare(`
        SELECT COUNT(*) as count 
        FROM products 
        WHERE DATE(created_at) = ?
      `).get(dateStr).count;

      const sales = db.prepare(`
        SELECT 
          COUNT(*) as sold_count,
          SUM(final_price) as revenue,
          SUM(final_price - cost_price) as profit
        FROM orders 
        WHERE DATE(created_at) = ? AND order_status != 'cancelled'
      `).get(dateStr);

      dailyData.push({
        date: dateStr,
        published,
        sold: sales.sold_count || 0,
        revenue: parseFloat((sales.revenue || 0).toFixed(2)),
        profit: parseFloat((sales.profit || 0).toFixed(2))
      });
    }

    res.json({ chart: dailyData });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi kalkulimi i grafikut ditor: ' + err.message });
  }
});

// =========================================================================
// 4. SALES INTELLIGENCE & CONVERSION ANALYTICS
// =========================================================================
router.get('/analytics/sales', (req, res) => {
  try {
    // Top selling products
    const topProducts = db.prepare(`
      SELECT 
        p.id, p.title, p.sku, p.images, p.category_id, c.name as category_name,
        COUNT(o.id) as units_sold,
        SUM(o.final_price) as total_revenue,
        SUM(o.final_price - o.cost_price) as total_profit
      FROM orders o
      JOIN products p ON o.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE o.order_status != 'cancelled'
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT 8
    `).all();

    // Top categories by demand & revenue
    const topCategories = db.prepare(`
      SELECT 
        c.id, c.name,
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT o.id) as total_sales,
        COALESCE(SUM(o.final_price), 0) as total_revenue,
        COALESCE(SUM(p.total_bids), 0) as total_bids_placed
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN orders o ON p.id = o.product_id AND o.order_status != 'cancelled'
      GROUP BY c.id
      ORDER BY total_revenue DESC, total_bids_placed DESC
    `).all();

    // Average order value (AOV)
    const aovRow = db.prepare(`
      SELECT AVG(final_price) as aov, COUNT(*) as count 
      FROM orders 
      WHERE order_status != 'cancelled'
    `).get();

    // Dead Stock (Products with 0 bids, active, high days/views)
    const deadStock = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active' AND p.total_bids = 0
      ORDER BY p.views_count DESC, p.id ASC
      LIMIT 10
    `).all();

    // Traffic & Conversion funnels
    const totalViews = db.prepare('SELECT SUM(views_count) as total FROM products').get().total || 0;
    const totalBids = db.prepare('SELECT COUNT(*) as total FROM bids').get().count || 0;
    const totalOrders = db.prepare("SELECT COUNT(*) as total FROM orders WHERE order_status != 'cancelled'").get().count || 0;

    const conversionRateViewsToSale = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;
    const conversionRateBidsToSale = totalBids > 0 ? (totalOrders / totalBids) * 100 : 0;

    res.json({
      topProducts,
      topCategories,
      averageOrderValue: parseFloat((aovRow.aov || 0).toFixed(2)),
      totalSoldUnits: aovRow.count || 0,
      traffic: {
        totalViews,
        totalBids,
        totalOrders,
        conversionRateViewsToSale: parseFloat(conversionRateViewsToSale.toFixed(2)),
        conversionRateBidsToSale: parseFloat(conversionRateBidsToSale.toFixed(2))
      },
      deadStock
    });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi marrja e analitikës së shitjeve: ' + err.message });
  }
});

// =========================================================================
// 5. INVENTORY & WAREHOUSE CONTROL
// =========================================================================
router.get('/inventory/summary', (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const publishedProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'active'").get().count;
    const soldProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'sold'").get().count;
    const warehouseProducts = db.prepare("SELECT COUNT(*) as count FROM products WHERE status IN ('draft', 'ended')").get().count;

    const warehouseValuation = db.prepare(`
      SELECT 
        COALESCE(SUM(cost_price), 0) as locked_cost,
        COALESCE(SUM(starting_price), 0) as starting_valuation,
        COALESCE(SUM(CASE WHEN buy_now_price > 0 THEN buy_now_price ELSE starting_price * 1.5 END), 0) as retail_valuation
      FROM products
      WHERE status != 'sold'
    `).get();

    const categoryStock = db.prepare(`
      SELECT 
        c.id, c.name,
        COUNT(p.id) as total_items,
        SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_items,
        SUM(CASE WHEN p.status = 'sold' THEN 1 ELSE 0 END) as sold_items,
        COALESCE(SUM(CASE WHEN p.status != 'sold' THEN p.cost_price ELSE 0 END), 0) as capital_locked
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY capital_locked DESC
    `).all();

    res.json({
      totalProducts,
      publishedProducts,
      soldProducts,
      warehouseProducts,
      lockedCost: parseFloat(warehouseValuation.locked_cost.toFixed(2)),
      retailValuation: parseFloat(warehouseValuation.retail_valuation.toFixed(2)),
      categoryStock
    });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi marrja e përmbledhjes së inventarit.' });
  }
});

// =========================================================================
// 6. AUTOMATED NOTIFICATIONS & RISK ALERTS
// =========================================================================
router.get('/notifications', (req, res) => {
  try {
    const notifications = db.prepare(`
      SELECT * FROM admin_notifications 
      ORDER BY is_read ASC, id DESC 
      LIMIT 50
    `).all();

    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM admin_notifications WHERE is_read = 0').get().count;

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi ngarkimi i njoftimeve.' });
  }
});

router.put('/notifications/:id/read', (req, res) => {
  try {
    db.prepare('UPDATE admin_notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi përditësimi i njoftimit.' });
  }
});

router.post('/notifications/mark-all-read', (req, res) => {
  try {
    db.prepare('UPDATE admin_notifications SET is_read = 1').run();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi shënimi i njoftimeve.' });
  }
});

// =========================================================================
// 7. ORDER RETURNS & REFUNDS
// =========================================================================
router.put('/orders/:id/return', (req, res) => {
  try {
    const { id } = req.params;
    const { return_status, refund_amount, notes } = req.body;

    db.prepare(`
      UPDATE orders 
      SET return_status = ?, refund_amount = ?, notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(return_status || 'approved', parseFloat(refund_amount) || 0, notes || null, id);

    logActivity(req.user.id, 'ORDER_RETURN_UPDATED', 'order', id, { return_status, refund_amount });

    res.json({ message: 'Statusi i kthimit u përditësua me sukses.' });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi përditësimi i kthimit: ' + err.message });
  }
});

// =========================================================================
// 8. EXCEL REPORT EXPORT (.xlsx)
// =========================================================================
router.get('/reports/export-excel', (req, res) => {
  try {
    const wb = xlsx.utils.book_new();

    // 1. Sheet: Orders / Sales Ledger
    const ordersData = db.prepare(`
      SELECT 
        o.order_number as "Numri Porosisë",
        p.sku as "SKU",
        p.title as "Produkti",
        o.shipping_name as "Blerësi",
        o.shipping_city as "Qyteti",
        o.shipping_phone as "Telefoni",
        o.final_price as "Çmimi Shitjes (€)",
        o.cost_price as "Kosto Blerjes (€)",
        (o.final_price - o.cost_price) as "Fitimi Bruto (€)",
        o.shipping_fee as "Posta (€)",
        o.total_amount as "Totali (€)",
        o.payment_method as "Pagesa",
        o.order_status as "Statusi",
        o.created_at as "Data"
      FROM orders o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.id DESC
    `).all();

    const wsOrders = xlsx.utils.json_to_sheet(ordersData);
    xlsx.utils.book_append_sheet(wb, wsOrders, 'Ditari i Shitjeve');

    // 2. Sheet: Stock / Inventory
    const inventoryData = db.prepare(`
      SELECT 
        p.sku as "SKU",
        p.title as "Titulli",
        c.name as "Kategoria",
        p.condition_grade as "Klasa",
        p.cost_price as "Kostoja (€)",
        p.starting_price as "Çmimi Fillestar (€)",
        p.current_price as "Çmimi Aktual (€)",
        p.reserve_price as "Çmimi Rezervë (€)",
        p.buy_now_price as "Bli Menjëherë (€)",
        p.status as "Statusi",
        p.total_bids as "Oferta",
        p.views_count as "Shikime",
        p.created_at as "Data Regjistrimit"
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
      LIMIT 5000
    `).all();

    const wsInventory = xlsx.utils.json_to_sheet(inventoryData);
    xlsx.utils.book_append_sheet(wb, wsInventory, 'Inventari & Stoku');

    // 3. Sheet: Financial Summary
    const initCapRow = db.prepare("SELECT value FROM financial_settings WHERE key = 'initial_investment'").get();
    const initialInvestment = initCapRow ? parseFloat(initCapRow.value) : 31000.00;
    const totalRev = db.prepare("SELECT SUM(final_price) as t FROM orders WHERE order_status != 'cancelled'").get().t || 0;
    const totalCogs = db.prepare("SELECT SUM(cost_price) as t FROM orders WHERE order_status != 'cancelled'").get().t || 0;
    const totalExp = db.prepare("SELECT SUM(amount) as t FROM expenses").get().t || 0;

    const summaryData = [
      { "Treguesi Financiar": "Investimi Fillestar", "Vlera (€)": initialInvestment },
      { "Treguesi Financiar": "Të Ardhurat Totale nga Shitjet", "Vlera (€)": totalRev },
      { "Treguesi Financiar": "Kosto e Mallit të Shitur (COGS)", "Vlera (€)": totalCogs },
      { "Treguesi Financiar": "Fitimi Bruto", "Vlera (€)": totalRev - totalCogs },
      { "Treguesi Financiar": "Shpenzimet Operative (Doganë, Transport, etj.)", "Vlera (€)": totalExp },
      { "Treguesi Financiar": "Fitimi Neto", "Vlera (€)": totalRev - totalCogs - totalExp },
      { "Treguesi Financiar": "Marzha e Fitimit Neto (%)", "Vlera (€)": totalRev > 0 ? `${(((totalRev - totalCogs - totalExp) / totalRev) * 100).toFixed(1)}%` : '0%' }
    ];

    const wsSummary = xlsx.utils.json_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(wb, wsSummary, 'Përmbledhja Financiare');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Raporti_Biznesit_Ankandet_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ error: 'Dështoi gjenerimi i raportit Excel: ' + err.message });
  }
});

// =========================================================================
// 9. PRODUCTS CRUD & ACTIONS
// =========================================================================
router.get('/products', (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status, condition } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push('p.status = ?');
      params.push(status);
    }
    if (category) {
      conditions.push('p.category_id = ?');
      params.push(category);
    }
    if (condition) {
      conditions.push('p.condition_grade = ?');
      params.push(condition);
    }
    if (search && search.trim()) {
      conditions.push('(p.title LIKE ? OR p.sku LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    const total = db.prepare(countQuery).get(...params).total;

    const selectQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        u.full_name as winner_name,
        (SELECT MAX(max_amount) FROM proxy_bids WHERE product_id = p.id) as highest_proxy_bid
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.current_winner_id = u.id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;

    const products = db.prepare(selectQuery).all(...params, parseInt(limit, 10), offset);

    const formatted = products.map(item => {
      let images = [];
      try { images = JSON.parse(item.images || '[]'); } catch (e) { images = [item.images]; }
      return { ...item, images };
    });

    res.json({
      products: formatted,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi ngarkimi i produkteve.' });
  }
});

router.post('/products', (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      condition_grade = 'A',
      condition_details,
      sku,
      cost_price = 0,
      starting_price = 10,
      reserve_price = 0,
      buy_now_price,
      duration_days = 5,
      images = [],
      anti_snip_minutes = 2,
      anti_snip_extension = 3
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Titulli i produktit është i detyrueshëm.' });
    }

    const finalSku = sku && sku.trim() ? sku.trim() : generateSKU();
    const finalSlug = generateSlug(title);
    const startPrice = parseFloat(starting_price) || 1.0;
    const costP = parseFloat(cost_price) || (startPrice * 0.6);
    const resPrice = parseFloat(reserve_price) || 0.0;
    const bnPrice = buy_now_price && parseFloat(buy_now_price) > 0 ? parseFloat(buy_now_price) : null;

    const now = new Date();
    const endTime = new Date(now.getTime() + (parseInt(duration_days, 10) || 3) * 24 * 60 * 60 * 1000);

    const imagesArray = Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'];

    const stmt = db.prepare(`
      INSERT INTO products (
        title, slug, sku, description, category_id,
        condition_grade, condition_details, images,
        cost_price, starting_price, current_price, reserve_price, buy_now_price,
        min_bid_increment, auction_start, auction_end, original_end_time,
        anti_snip_minutes, anti_snip_extension, status
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 'active'
      )
    `);

    const result = stmt.run(
      title.trim(),
      finalSlug,
      finalSku,
      description || '',
      category_id ? parseInt(category_id, 10) : null,
      condition_grade,
      condition_details || '',
      JSON.stringify(imagesArray),
      costP,
      startPrice,
      startPrice,
      resPrice,
      bnPrice,
      startPrice < 50 ? 1 : 2,
      now.toISOString(),
      endTime.toISOString(),
      endTime.toISOString(),
      parseInt(anti_snip_minutes, 10) || 2,
      parseInt(anti_snip_extension, 10) || 3
    );

    logActivity(req.user.id, 'CREATE_AUCTION', 'product', result.lastInsertRowid, {
      title,
      sku: finalSku,
      cost_price: costP,
      starting_price: startPrice
    });

    res.status(201).json({
      message: 'Ankandi u krijua me sukses!',
      productId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Dështoi krijimi i produktit: ' + err.message });
  }
});

router.put('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category_id,
      condition_grade,
      condition_details,
      cost_price,
      reserve_price,
      buy_now_price,
      status,
      extend_hours
    } = req.body;

    const current = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!current) {
      return res.status(404).json({ error: 'Produkti nuk u gjet.' });
    }

    const updates = [];
    const params = [];

    if (title) { updates.push('title = ?'); params.push(title.trim()); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (category_id !== undefined) { updates.push('category_id = ?'); params.push(category_id ? parseInt(category_id, 10) : null); }
    if (condition_grade) { updates.push('condition_grade = ?'); params.push(condition_grade); }
    if (condition_details !== undefined) { updates.push('condition_details = ?'); params.push(condition_details); }
    if (cost_price !== undefined) { updates.push('cost_price = ?'); params.push(parseFloat(cost_price)); }
    if (reserve_price !== undefined) { updates.push('reserve_price = ?'); params.push(parseFloat(reserve_price)); }
    if (buy_now_price !== undefined) { updates.push('buy_now_price = ?'); params.push(buy_now_price ? parseFloat(buy_now_price) : null); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (extend_hours && parseInt(extend_hours, 10) > 0) {
      const currentEnd = new Date(current.auction_end).getTime();
      const newEnd = new Date(currentEnd + parseInt(extend_hours, 10) * 3600 * 1000);
      updates.push('auction_end = ?');
      params.push(newEnd.toISOString());
    }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    logActivity(req.user.id, 'UPDATE_AUCTION', 'product', id, req.body);
    res.json({ message: 'Produkti u përditësua me sukses.' });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi përditësimi: ' + err.message });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    logActivity(req.user.id, 'DELETE_AUCTION', 'product', id);
    res.json({ message: 'Ankandi u fshi me sukses.' });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi fshirja e ankandit: ' + err.message });
  }
});

router.post('/products/:id/end-early', (req, res) => {
  try {
    const { id } = req.params;
    const nowIso = new Date().toISOString();
    db.prepare('UPDATE products SET auction_end = ? WHERE id = ?').run(nowIso, id);
    res.json({ message: 'Ankandi u mbyll menjëherë. Çmimi dhe fituesi po llogariten.' });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi mbyllja e ankandit.' });
  }
});

// =========================================================================
// 10. USER CONTROLS & CSV MASS IMPORT
// =========================================================================
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        u.id, u.email, u.full_name, u.phone, u.city, u.role, u.status, u.created_at,
        (SELECT COUNT(*) FROM bids WHERE user_id = u.id) as total_bids,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as won_orders
      FROM users u
      ORDER BY u.id DESC
    `).all();

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi marrja e përdoruesve.' });
  }
});

router.put('/users/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const updates = [];
    const params = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (role) { updates.push('role = ?'); params.push(role); }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    logActivity(req.user.id, 'USER_STATUS_UPDATED', 'user', id, { status, role });
    res.json({ message: 'Statusi i përdoruesit u përditësua.' });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi përditësimi i përdoruesit.' });
  }
});

router.post('/import/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ju lutem ngarkoni një skedar CSV.' });
    }

    const result = await importProductsFromCSV(req.file.path, req.file.originalname);
    try { fs.unlinkSync(req.file.path); } catch (e) {}

    res.json({
      message: `Importimi përfundoi! U shtuan me sukses ${result.successfulRows} nga ${result.totalRows} produkte në ${result.durationSeconds} sekonda.`,
      result
    });
  } catch (err) {
    console.error('Import CSV error:', err);
    res.status(500).json({ error: 'Dështoi importimi i skedarit: ' + err.message });
  }
});

router.post('/import/generate-bulk-test', async (req, res) => {
  try {
    const count = parseInt(req.body.count || '9000', 10);
    const tempFile = path.join(uploadDir, `bulk_test_${Date.now()}.csv`);

    generateBulkDatasetCSV(tempFile, count);

    setTimeout(async () => {
      try {
        const importResult = await importProductsFromCSV(tempFile, `Katalogu_Kosovë_${count}_Produkte.csv`);
        try { fs.unlinkSync(tempFile); } catch (e) {}

        res.json({
          message: `U gjeneruan dhe u importuan me sukses ${importResult.successfulRows} artikuj në sistem në ${importResult.durationSeconds}s!`,
          result: importResult
        });
      } catch (err) {
        res.status(500).json({ error: 'Gabim gjatë importit të katalogut: ' + err.message });
      }
    }, 500);

  } catch (err) {
    res.status(500).json({ error: 'Dështoi gjenerimi i testit masiv: ' + err.message });
  }
});

router.get('/import/template', (req, res) => {
  const csvContent = generateSampleCSV(15);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ankandet_shabllon_importi.csv"');
  res.send('\uFEFF' + csvContent);
});

router.get('/import/history', (req, res) => {
  try {
    const history = db.prepare('SELECT * FROM csv_imports ORDER BY id DESC LIMIT 20').all();
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi marrja e historikut.' });
  }
});

router.get('/logs', (req, res) => {
  try {
    const { action, limit = 50 } = req.query;
    let query = `
      SELECT al.*, u.full_name as user_name, u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
    `;
    const params = [];
    if (action) {
      query += ' WHERE al.action = ? ';
      params.push(action);
    }
    query += ' ORDER BY al.id DESC LIMIT ? ';
    params.push(parseInt(limit, 10));

    const logs = db.prepare(query).all(...params);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi marrja e regjistrit të aktiviteteve.' });
  }
});

router.get('/backup', (req, res) => {
  try {
    const dataDir = path.join(__dirname, '..', '..', 'data');
    const dbPath = path.join(dataDir, 'ankandet.db');
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Databaza nuk u gjet.' });
    }
    const backupFilename = `ankandet_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
    res.download(dbPath, backupFilename);
  } catch (err) {
    res.status(500).json({ error: 'Dështoi krijimi i kopjes rezervë.' });
  }
});

export default router;
