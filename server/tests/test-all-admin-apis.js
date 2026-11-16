import db from '../db.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';

async function run() {
  const admin = db.prepare("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1").get();
  console.log('Admin user found:', admin);

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET
  );

  const headers = { Authorization: 'Bearer ' + token };
  const eps = [
    '/api/admin/stats',
    '/api/admin/financials',
    '/api/admin/analytics/daily-chart?days=14',
    '/api/admin/analytics/sales',
    '/api/admin/inventory/summary',
    '/api/admin/notifications',
    '/api/admin/logs?limit=5'
  ];

  for (const ep of eps) {
    try {
      const res = await fetch('http://localhost:5000' + ep, { headers });
      const d = await res.json();
      console.log(ep, '-> status:', res.status, 'keys:', Object.keys(d));
    } catch (e) {
      console.error(ep, '-> ERR:', e.message);
    }
  }
}

run();
