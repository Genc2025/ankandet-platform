import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { logActivity } from '../db.js';
import { authenticate, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

export const KOSOVO_CITIES = [
  'Prishtinë',
  'Prizren',
  'Pejë',
  'Ferizaj',
  'Gjilan',
  'Gjakovë',
  'Mitrovicë',
  'Vushtrri',
  'Podujevë',
  'Fushë Kosovë',
  'Suharekë',
  'Rahovec',
  'Malishevë',
  'Drenas',
  'Lipjan',
  'Deçan',
  'Klinë',
  'Skenderaj',
  'Istog',
  'Kaçanik',
  'Shtime',
  'Kamenicë',
  'Dragash',
  'Obiliq'
];

// GET /api/auth/cities
router.get('/cities', (req, res) => {
  res.json({ cities: KOSOVO_CITIES });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { email, password, full_name, phone, city, address } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Emri i plotë, email-i dhe fjalëkalimi janë të detyrueshëm.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(400).json({ error: 'Një llogari me këtë email ekziston tashmë.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const userCity = city && KOSOVO_CITIES.includes(city) ? city : 'Prishtinë';

    const insertStmt = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, city, address, role, status)
      VALUES (?, ?, ?, ?, ?, ?, 'buyer', 'active')
    `);

    const result = insertStmt.run(
      email.trim().toLowerCase(),
      passwordHash,
      full_name.trim(),
      phone ? phone.trim() : null,
      userCity,
      address ? address.trim() : null
    );

    const userId = result.lastInsertRowid;
    const token = jwt.sign({ id: userId, email, role: 'buyer' }, JWT_SECRET, { expiresIn: '7d' });

    logActivity(userId, 'REGISTER', 'user', userId, { email });

    const newUser = db.prepare('SELECT id, email, full_name, role, phone, city, address FROM users WHERE id = ?').get(userId);

    res.status(201).json({
      message: 'Regjistrimi u krye me sukses!',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Ndodhi një gabim gjatë regjistrimit.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Ju lutem jepni email-in dhe fjalëkalimin.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (!user) {
      return res.status(400).json({ error: 'Kredencialet janë të pasakta.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Llogaria juaj është pezulluar. Kontaktoni mbështetjen.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Kredencialet janë të pasakta.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    logActivity(user.id, 'LOGIN', 'user', user.id, { ip: req.ip });

    const safeUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      city: user.city,
      address: user.address
    };

    res.json({
      message: 'Mirësevini përsëri!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ndodhi një gabim gjatë kyçjes.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  // Fetch statistics for the user
  const stats = {
    active_bids: db.prepare(`
      SELECT COUNT(DISTINCT product_id) as count FROM bids WHERE user_id = ?
    `).get(req.user.id).count,
    won_auctions: db.prepare(`
      SELECT COUNT(*) as count FROM orders WHERE user_id = ?
    `).get(req.user.id).count,
    watchlist_count: db.prepare(`
      SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?
    `).get(req.user.id).count
  };

  res.json({
    user: req.user,
    stats
  });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, (req, res) => {
  try {
    const { full_name, phone, city, address, password } = req.body;

    const updates = [];
    const params = [];

    if (full_name) {
      updates.push('full_name = ?');
      params.push(full_name.trim());
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone ? phone.trim() : null);
    }
    if (city && KOSOVO_CITIES.includes(city)) {
      updates.push('city = ?');
      params.push(city);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address ? address.trim() : null);
    }
    if (password && password.length >= 6) {
      const salt = bcrypt.genSaltSync(10);
      updates.push('password_hash = ?');
      params.push(bcrypt.hashSync(password, salt));
    }

    if (updates.length > 0) {
      params.push(req.user.id);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare('SELECT id, email, full_name, role, phone, city, address FROM users WHERE id = ?').get(req.user.id);

    res.json({
      message: 'Profili u përditësua me sukses.',
      user: updated
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Dështoi përditësimi i profilit.' });
  }
});

export default router;
