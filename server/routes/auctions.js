import express from 'express';
import db, { logActivity } from '../db.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { placeBid, executeBuyNow, getMinBidIncrement } from '../auction-engine.js';
import { broadcast } from '../websocket.js';

const router = express.Router();

/**
 * Mask bidder name for public privacy: e.g. "Agron Morina" -> "Ag*** M."
 */
function maskName(name) {
  if (!name) return 'Ofertues Anonim';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2) + '***';
  }
  return parts[0].substring(0, 2) + '*** ' + parts[parts.length - 1].substring(0, 1) + '.';
}

// GET /api/auctions
router.get('/', optionalAuthenticate, (req, res) => {
  try {
    const {
      page = 1,
      limit = 24,
      category,
      condition,
      status = 'active',
      search,
      sort = 'ending_soon',
      buy_now
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (category) {
      if (!isNaN(category)) {
        conditions.push('p.category_id = ?');
        params.push(parseInt(category, 10));
      } else {
        conditions.push('c.slug = ?');
        params.push(category);
      }
    }

    if (condition && ['A', 'B', 'C'].includes(condition.toUpperCase())) {
      conditions.push('p.condition_grade = ?');
      params.push(condition.toUpperCase());
    }

    if (buy_now === '1' || buy_now === 'true') {
      conditions.push('p.buy_now_price IS NOT NULL AND p.buy_now_price > 0');
    }

    if (search && search.trim()) {
      conditions.push('(p.title LIKE ? OR p.sku LIKE ? OR p.description LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'p.auction_end ASC';
    if (sort === 'ending_soon') orderBy = 'p.auction_end ASC';
    else if (sort === 'price_low') orderBy = 'p.current_price ASC';
    else if (sort === 'price_high') orderBy = 'p.current_price DESC';
    else if (sort === 'bids_high') orderBy = 'p.total_bids DESC';
    else if (sort === 'newest') orderBy = 'p.id DESC';

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const totalCount = db.prepare(countQuery).get(...params).total;

    const selectQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        u.full_name as winner_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.current_winner_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const products = db.prepare(selectQuery).all(...params, parseInt(limit, 10), offset);

    // Format fields (parse JSON images, mask winner name)
    const formatted = products.map(item => {
      let images = [];
      try {
        images = JSON.parse(item.images || '[]');
      } catch (e) {
        images = item.images ? [item.images] : [];
      }

      let isWatched = false;
      let userProxy = null;
      if (req.user) {
        const watch = db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND product_id = ?').get(req.user.id, item.id);
        isWatched = !!watch;

        const proxy = db.prepare('SELECT max_amount FROM proxy_bids WHERE user_id = ? AND product_id = ?').get(req.user.id, item.id);
        userProxy = proxy ? proxy.max_amount : null;
      }

      return {
        ...item,
        images,
        winner_name: item.winner_name ? maskName(item.winner_name) : null,
        min_next_bid: item.total_bids === 0 ? item.starting_price : item.current_price + getMinBidIncrement(item.current_price),
        min_increment: getMinBidIncrement(item.current_price),
        is_watched: isWatched,
        user_proxy: userProxy,
        is_user_winning: req.user ? (item.current_winner_id === req.user.id) : false,
        reserve_met: item.reserve_price > 0 ? (item.current_price >= item.reserve_price) : true
      };
    });

    res.json({
      data: formatted,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit, 10))
      }
    });
  } catch (err) {
    console.error('List auctions error:', err);
    res.status(500).json({ error: 'Dështoi ngarkimi i ankandeve.' });
  }
});

// GET /api/auctions/categories
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as active_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `).all();

    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi ngarkimi i kategorive.' });
  }
});

// GET /api/auctions/exchange-rate
router.get('/exchange-rate', (req, res) => {
  try {
    const rateRow = db.prepare("SELECT value FROM financial_settings WHERE key = 'eur_to_all_rate'").get();
    const rate = rateRow ? parseFloat(rateRow.value) : 100.00;
    res.json({ rate, currency: 'ALL', baseCurrency: 'EUR' });
  } catch (err) {
    res.json({ rate: 100.00, currency: 'ALL', baseCurrency: 'EUR' });
  }
});

// GET /api/auctions/my/bids
router.get('/my/bids', authenticate, (req, res) => {
  try {
    const myBids = db.prepare(`
      SELECT DISTINCT 
        p.*,
        c.name as category_name,
        pb.max_amount as my_proxy_bid,
        (SELECT MAX(amount) FROM bids WHERE product_id = p.id AND user_id = ?) as my_highest_bid,
        (p.current_winner_id = ?) as is_winning
      FROM bids b
      JOIN products p ON b.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN proxy_bids pb ON pb.product_id = p.id AND pb.user_id = ?
      WHERE b.user_id = ?
      ORDER BY p.auction_end ASC
    `).all(req.user.id, req.user.id, req.user.id, req.user.id);

    const formatted = myBids.map(p => {
      let images = [];
      try { images = JSON.parse(p.images || '[]'); } catch (e) { images = [p.images]; }
      return {
        ...p,
        images,
        is_winning: Boolean(p.is_winning)
      };
    });

    res.json({ bids: formatted });
  } catch (err) {
    console.error('My bids error:', err);
    res.status(500).json({ error: 'Dështoi ngarkimi i historikut të ofertave.' });
  }
});

// GET /api/auctions/my/watchlist
router.get('/my/watchlist', authenticate, (req, res) => {
  try {
    const list = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        w.created_at as watched_since
      FROM watchlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.id DESC
    `).all(req.user.id);

    const formatted = list.map(p => {
      let images = [];
      try { images = JSON.parse(p.images || '[]'); } catch (e) { images = [p.images]; }
      return {
        ...p,
        images,
        is_watched: true
      };
    });

    res.json({ watchlist: formatted });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi ngarkimi i listës së preferuar.' });
  }
});

// GET /api/auctions/:id
router.get('/:id', optionalAuthenticate, (req, res) => {
  try {
    const { id } = req.params;

    // Increment view count
    db.prepare('UPDATE products SET views_count = views_count + 1 WHERE id = ?').run(id);

    const product = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        u.full_name as winner_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.current_winner_id = u.id
      WHERE p.id = ? OR p.slug = ?
    `).get(id, id);

    if (!product) {
      return res.status(404).json({ error: 'Ankandi nuk u gjet.' });
    }

    // Bid History (Masked)
    const bidHistory = db.prepare(`
      SELECT 
        b.id,
        b.amount,
        b.bid_type,
        b.is_winning,
        b.created_at,
        u.full_name,
        u.city
      FROM bids b
      JOIN users u ON b.user_id = u.id
      WHERE b.product_id = ?
      ORDER BY b.amount DESC, b.created_at DESC
      LIMIT 50
    `).all(product.id).map(b => ({
      ...b,
      bidder_name: maskName(b.full_name)
    }));

    let images = [];
    try {
      images = JSON.parse(product.images || '[]');
    } catch (e) {
      images = product.images ? [product.images] : [];
    }

    let isWatched = false;
    let userProxy = null;
    let isUserWinning = false;

    if (req.user) {
      const watch = db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND product_id = ?').get(req.user.id, product.id);
      isWatched = !!watch;

      const proxy = db.prepare('SELECT max_amount FROM proxy_bids WHERE user_id = ? AND product_id = ?').get(req.user.id, product.id);
      userProxy = proxy ? proxy.max_amount : null;

      isUserWinning = product.current_winner_id === req.user.id;
    }

    const minIncrement = getMinBidIncrement(product.current_price);
    const minNextBid = product.total_bids === 0 
      ? product.starting_price 
      : product.current_price + minIncrement;

    // Related products in the same category
    const relatedRows = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
      ORDER BY p.auction_end ASC
      LIMIT 6
    `).all(product.category_id || 0, product.id);

    const relatedProducts = relatedRows.map(rp => {
      let rImgs = [];
      try { rImgs = JSON.parse(rp.images || '[]'); } catch (e) { rImgs = rp.images ? [rp.images] : []; }
      return {
        ...rp,
        images: rImgs,
        min_next_bid: rp.total_bids === 0 ? rp.starting_price : rp.current_price + getMinBidIncrement(rp.current_price),
        min_increment: getMinBidIncrement(rp.current_price)
      };
    });

    res.json({
      product: {
        ...product,
        images,
        winner_name: product.winner_name ? maskName(product.winner_name) : null,
        min_next_bid: minNextBid,
        min_increment: minIncrement,
        is_watched: isWatched,
        user_proxy: userProxy,
        is_user_winning: isUserWinning,
        reserve_met: product.reserve_price > 0 ? (product.current_price >= product.reserve_price) : true
      },
      bidHistory,
      relatedProducts
    });
  } catch (err) {
    console.error('Get auction error:', err);
    res.status(500).json({ error: 'Dështoi ngarkimi i detajeve të ankandit.' });
  }
});

// POST /api/auctions/:id/bid
router.post('/:id/bid', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const { amount, isProxy } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Ju lutem jepni një shumë të vlefshme.' });
    }

    const result = placeBid({
      productId: parseInt(id, 10),
      userId: req.user.id,
      amount: parseFloat(amount),
      isProxy: Boolean(isProxy),
      ip: req.ip,
      broadcastFn: broadcast
    });

    res.json({
      message: 'Oferta juaj u pranua me sukses!',
      ...result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auctions/:id/buy-now
router.post('/:id/buy-now', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const shippingDetails = req.body || {};

    const result = executeBuyNow({
      productId: parseInt(id, 10),
      userId: req.user.id,
      shippingDetails,
      ip: req.ip,
      broadcastFn: broadcast
    });

    res.json({
      message: 'Urime! Ju e bletë artikullin me sukses!',
      ...result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auctions/:id/watchlist
router.post('/:id/watchlist', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);

    const existing = db.prepare('SELECT id FROM watchlist WHERE user_id = ? AND product_id = ?').get(req.user.id, productId);

    if (existing) {
      db.prepare('DELETE FROM watchlist WHERE id = ?').run(existing.id);
      return res.json({ watched: false, message: 'U hoq nga lista e preferuar.' });
    } else {
      db.prepare('INSERT INTO watchlist (user_id, product_id) VALUES (?, ?)').run(req.user.id, productId);
      return res.json({ watched: true, message: 'U shtua në listën e preferuar.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Dështoi modifikimi i listës së preferuar.' });
  }
});

export default router;
