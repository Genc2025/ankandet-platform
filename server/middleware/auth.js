import jwt from 'jsonwebtoken';
import db from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'ankandet-ks-super-secret-key-2026';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autorizimi kërkohet. Ju lutem kyçuni.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, full_name, role, phone, city, address, status FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Përdoruesi nuk ekziston më.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Llogaria juaj është pezulluar.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesioni ka skaduar ose është i pavlefshëm.' });
  }
}

export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, full_name, role, phone, city, address, status FROM users WHERE id = ?').get(decoded.id);
    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch (e) {
    // Ignore invalid token on optional auth
  }
  next();
}

export function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Nuk keni privilegje administratori për këtë veprim.' });
    }
    next();
  });
}
