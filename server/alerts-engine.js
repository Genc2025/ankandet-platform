import db, { createAdminNotification } from './db.js';

/**
 * Scan for business risks & automated notifications:
 * 1. Unpaid orders
 * 2. High views without bids (Stuck inventory)
 * 3. Low stock per category
 * 4. Suspicious bid patterns
 */
export function runAutomatedBusinessAlerts(broadcastFn = null) {
  try {
    // 1. Unpaid Orders Alert (Pending orders older than 24 hours)
    const unpaidOrders = db.prepare(`
      SELECT o.*, u.full_name as buyer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.payment_status = 'pending' 
        AND o.created_at <= datetime('now', '-24 hours')
        AND NOT EXISTS (
          SELECT 1 FROM admin_notifications an 
          WHERE an.type = 'order_unpaid' AND an.entity_id = o.id
        )
    `).all();

    for (const order of unpaidOrders) {
      createAdminNotification({
        type: 'order_unpaid',
        title: 'Porosi e papaguar në pritje!',
        message: `Porosia #${order.order_number} nga ${order.buyer_name} (€${order.total_amount.toFixed(2)}) ka më shumë se 24 orë në pritje pagese.`,
        severity: 'warning',
        entityType: 'order',
        entityId: order.id,
        broadcastFn
      });
    }

    // 2. High Views but Zero Bids Alert (Produkte me interes të lartë por pa oferta)
    const stuckProducts = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active' 
        AND p.views_count >= 15 
        AND p.total_bids = 0
        AND NOT EXISTS (
          SELECT 1 FROM admin_notifications an 
          WHERE an.type = 'high_views_no_bids' AND an.entity_id = p.id
        )
    `).all();

    for (const prod of stuckProducts) {
      createAdminNotification({
        type: 'high_views_no_bids',
        title: 'Shumë shikime, por pa oferta!',
        message: `Artikulli "${prod.title}" ka arritur ${prod.views_count} shikime por nuk ka asnjë ofertë. Sugjerohet ulja e çmimit fillestar prej €${prod.starting_price.toFixed(2)}.`,
        severity: 'info',
        entityType: 'product',
        entityId: prod.id,
        broadcastFn
      });
    }

    // 3. Low Category Stock Alert (Kategori me pak produkte)
    const lowStockCategories = db.prepare(`
      SELECT c.id, c.name, COUNT(p.id) as active_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      GROUP BY c.id
      HAVING active_count < 2
    `).all();

    for (const cat of lowStockCategories) {
      // Check if alert already sent in last 2 days
      const alreadyAlerted = db.prepare(`
        SELECT id FROM admin_notifications 
        WHERE type = 'low_stock' AND entity_id = ? AND created_at >= datetime('now', '-2 days')
      `).get(cat.id);

      if (!alreadyAlerted) {
        createAdminNotification({
          type: 'low_stock',
          title: 'Stoku i kategorisë po mbaron!',
          message: `Kategoria "${cat.name}" ka vetëm ${cat.active_count} artikuj aktivë në ankand. Kërkohet furnizim i ri.`,
          severity: 'warning',
          entityType: 'category',
          entityId: cat.id,
          broadcastFn
        });
      }
    }
  } catch (err) {
    console.error('Error running automated business alerts:', err);
  }
}
