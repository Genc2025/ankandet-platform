try {
  const Database = require('better-sqlite3');
  const db = new Database(':memory:');
  console.log('SUCCESS: better-sqlite3 is working', db.prepare('SELECT 1 as x').get());
} catch (e) {
  console.error('ERROR:', e.message);
}
