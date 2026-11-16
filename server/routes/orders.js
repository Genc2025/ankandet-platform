import express from 'express';
import db, { logActivity } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/orders - Get user orders (or all orders for admin)
router.get('/', authenticate, (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const conditions = [];
    const params = [];

    if (!isAdmin) {
      conditions.push('o.user_id = ?');
      params.push(req.user.id);
    }

    if (status) {
      conditions.push('o.order_status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;
    const total = db.prepare(countQuery).get(...params).total;

    const selectQuery = `
      SELECT 
        o.*,
        p.title as product_title,
        p.sku as product_sku,
        p.images as product_images,
        p.condition_grade,
        u.email as buyer_email,
        u.full_name as buyer_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.id DESC
      LIMIT ? OFFSET ?
    `;

    const orders = db.prepare(selectQuery).all(...params, parseInt(limit, 10), offset);

    const formatted = orders.map(order => {
      let images = [];
      try { images = JSON.parse(order.product_images || '[]'); } catch (e) { images = [order.product_images]; }
      return {
        ...order,
        product_images: images
      };
    });

    res.json({
      orders: formatted,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json({ error: 'Dështoi ngarkimi i porosive.' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const order = db.prepare(`
      SELECT 
        o.*,
        p.title as product_title,
        p.sku as product_sku,
        p.images as product_images,
        p.condition_grade,
        u.email as buyer_email,
        u.full_name as buyer_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `).get(id);

    if (!order) {
      return res.status(404).json({ error: 'Porosia nuk u gjet.' });
    }

    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Nuk keni qasje në këtë porosi.' });
    }

    let images = [];
    try { images = JSON.parse(order.product_images || '[]'); } catch (e) { images = [order.product_images]; }

    res.json({
      order: {
        ...order,
        product_images: images
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi marrja e porosisë.' });
  }
});

// PUT /api/orders/:id/status (Admin only)
router.put('/:id/status', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status, tracking_number, notes } = req.body;

    const updates = [];
    const params = [];

    if (order_status) {
      updates.push('order_status = ?');
      params.push(order_status);
    }
    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }
    if (tracking_number !== undefined) {
      updates.push('tracking_number = ?');
      params.push(tracking_number);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    logActivity(req.user.id, 'ORDER_STATUS_UPDATED', 'order', id, { order_status, payment_status, tracking_number });

    res.json({ message: 'Statusi i porosisë u përditësua me sukses.' });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi përditësimi i statusit.' });
  }
});

// PUT /api/orders/:id/shipping (Buyer can update their shipping details before shipped)
router.put('/:id/shipping', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const { shipping_name, shipping_phone, shipping_city, shipping_address, notes } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return res.status(404).json({ error: 'Porosia nuk u gjet.' });
    }

    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Nuk keni të drejtë të modifikoni këtë porosi.' });
    }

    if (order.order_status === 'shipped' || order.order_status === 'delivered') {
      return res.status(400).json({ error: 'Porosia tashmë është nisur ose dërguar dhe adresa nuk mund të ndryshohet.' });
    }

    db.prepare(`
      UPDATE orders 
      SET shipping_name = ?, shipping_phone = ?, shipping_city = ?, shipping_address = ?, notes = ?
      WHERE id = ?
    `).run(
      shipping_name || order.shipping_name,
      shipping_phone || order.shipping_phone,
      shipping_city || order.shipping_city,
      shipping_address || order.shipping_address,
      notes || order.notes,
      id
    );

    res.json({ message: 'Të dhënat e transportit u ruajtën me sukses.' });
  } catch (err) {
    res.status(500).json({ error: 'Dështoi përditësimi i të dhënave të transportit.' });
  }
});

export default router;
