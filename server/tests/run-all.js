import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initDatabase } from '../db.js';
import { placeBid, executeBuyNow, processExpiredAuctions, getMinBidIncrement } from '../auction-engine.js';
import { generateBulkDatasetCSV, importProductsFromCSV, generateSlug, generateSKU } from '../importer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize test DB
initDatabase();

console.log('====================================================');
console.log('🧪 NISJA E TESTEVE AUTOMATIKE PËR ANKANDET.KS');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Detajet e gabimit:`, err.message);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Detajet e gabimit:`, err.message);
  }
}

// Setup Test Users
const u1 = db.prepare("INSERT OR IGNORE INTO users (email, password_hash, full_name, role) VALUES ('test_u1@ankandet.al', 'hash', 'Testuesi Një', 'buyer')").run();
const u2 = db.prepare("INSERT OR IGNORE INTO users (email, password_hash, full_name, role) VALUES ('test_u2@ankandet.al', 'hash', 'Testuesi Dy', 'buyer')").run();
const u3 = db.prepare("INSERT OR IGNORE INTO users (email, password_hash, full_name, role) VALUES ('test_u3@ankandet.al', 'hash', 'Testuesi Tre', 'buyer')").run();

const user1 = db.prepare("SELECT id FROM users WHERE email = 'test_u1@ankandet.al'").get();
const user2 = db.prepare("SELECT id FROM users WHERE email = 'test_u2@ankandet.al'").get();
const user3 = db.prepare("SELECT id FROM users WHERE email = 'test_u3@ankandet.al'").get();

// -------------------------------------------------------------
// TEST 1: Bid Increment Ladder
// -------------------------------------------------------------
runTest('Moduli 1: Tabela e Rritjes Minimale të Ofertave (Bid Increments)', () => {
  assert.strictEqual(getMinBidIncrement(10), 1.00);
  assert.strictEqual(getMinBidIncrement(49.99), 1.00);
  assert.strictEqual(getMinBidIncrement(50), 2.00);
  assert.strictEqual(getMinBidIncrement(199.99), 2.00);
  assert.strictEqual(getMinBidIncrement(200), 5.00);
  assert.strictEqual(getMinBidIncrement(650), 10.00);
  assert.strictEqual(getMinBidIncrement(1200), 25.00);
  assert.strictEqual(getMinBidIncrement(5500), 50.00);
});

// -------------------------------------------------------------
// TEST 2: Proxy Bidding Engine
// -------------------------------------------------------------
runTest('Moduli 2: Logjika e Ofertimit Automatik (Proxy Bidding)', () => {
  const now = new Date();
  const future = new Date(now.getTime() + 2 * 3600 * 1000); // 2 hours
  const testSku = 'TEST-SKU-' + Date.now() + '-P';
  const testSlug = 'test-laptop-proxy-' + Date.now();

  const prodResult = db.prepare(`
    INSERT INTO products (
      title, slug, sku, starting_price, current_price, reserve_price,
      auction_start, auction_end, original_end_time, status
    ) VALUES (
      'Test Laptop ThinkPad T14', ?, ?, 50.00, 50.00, 0,
      ?, ?, ?, 'active'
    )
  `).run(testSlug, testSku, now.toISOString(), future.toISOString(), future.toISOString());

  const pid = prodResult.lastInsertRowid;

  // Step A: User 1 sets proxy of 100 (starting price 50)
  const res1 = placeBid({ productId: pid, userId: user1.id, amount: 100, isProxy: true });
  assert.strictEqual(res1.winnerId, user1.id);
  assert.strictEqual(res1.currentPrice, 50.00, 'Oferta e parë duhet të mbetet në çmimin fillestar');

  // Step B: User 2 bids 70
  // System should bid for User 1 at 70 + increment(70)=2 -> 72
  const res2 = placeBid({ productId: pid, userId: user2.id, amount: 70, isProxy: true });
  assert.strictEqual(res2.winnerId, user1.id, 'User 1 duhet të mbetet fitues sepse ka proxy deri në 100');
  assert.strictEqual(res2.currentPrice, 72.00, 'Çmimi duhet të avancohet në 72 (70 + rritja prej 2)');

  // Step C: User 3 sets higher proxy of 150
  // System pushes price to User 1 max (100) + increment(100)=2 -> 102, User 3 wins!
  const res3 = placeBid({ productId: pid, userId: user3.id, amount: 150, isProxy: true });
  assert.strictEqual(res3.winnerId, user3.id, 'User 3 duhet të fitojë sepse ka proxy 150 mbi 100');
  assert.strictEqual(res3.currentPrice, 102.00, 'Çmimi i ri fitues duhet të jetë 102 (100 + rritja 2)');
});

// -------------------------------------------------------------
// TEST 3: Anti-Sniping (Soft Close)
// -------------------------------------------------------------
runTest('Moduli 3: Mbrojtja nga Sniping (Zgjatje automatike në minutat e fundit)', () => {
  const now = Date.now();
  const soonEnd = new Date(now + 45 * 1000).toISOString();
  const testSku = 'TEST-SKU-' + Date.now() + '-S';
  const testSlug = 'test-phone-snip-' + Date.now();

  const prod = db.prepare(`
    INSERT INTO products (
      title, slug, sku, starting_price, current_price, reserve_price,
      auction_start, auction_end, original_end_time, anti_snip_minutes, anti_snip_extension, status
    ) VALUES (
      'Test Telefon Anti-Snip', ?, ?, 10.00, 10.00, 0,
      ?, ?, ?, 2, 3, 'active'
    )
  `).run(testSlug, testSku, new Date(now - 10000).toISOString(), soonEnd, soonEnd);

  const pid = prod.lastInsertRowid;

  // Bid placed within last 45s
  const bidRes = placeBid({ productId: pid, userId: user2.id, amount: 20, isProxy: false });
  assert.strictEqual(bidRes.antiSnipExtended, true, 'Ankandi duhet të zgjatet automatikisht nga Anti-Sniping');

  // Verify database record
  const updated = db.prepare('SELECT auction_end, anti_snip_count FROM products WHERE id = ?').get(pid);
  assert.strictEqual(updated.anti_snip_count, 1);
  const newEndTime = new Date(updated.auction_end).getTime();
  assert.ok(newEndTime > now + 2 * 60 * 1000, 'Koha e re e mbylljes duhet të jetë shtyrë me të paktën 3 minuta');
});

// -------------------------------------------------------------
// TEST 4: Reserve Price Enforcement
// -------------------------------------------------------------
runTest('Moduli 4: Mbrojtja e Çmimit Dysheme (Reserve Price)', () => {
  const now = new Date();
  const past = new Date(now.getTime() - 10000).toISOString();
  const testSku = 'TEST-SKU-' + Date.now() + '-R';
  const testSlug = 'test-reserve-item-' + Date.now();

  // Create an expired auction with starting price 20, reserve 100
  const prod = db.prepare(`
    INSERT INTO products (
      title, slug, sku, starting_price, current_price, reserve_price,
      auction_start, auction_end, original_end_time, status, total_bids, current_winner_id
    ) VALUES (
      'Test Artikull me Çmim Rezervë', ?, ?, 20.00, 45.00, 100.00,
      ?, ?, ?, 'active', 2, ?
    )
  `).run(testSlug, testSku, past, past, past, user1.id);

  const pid = prod.lastInsertRowid;

  // Process expired auctions
  processExpiredAuctions();

  const finishedProd = db.prepare('SELECT status FROM products WHERE id = ?').get(pid);
  assert.strictEqual(finishedProd.status, 'ended', 'Ankandi duhet të mbyllet si "ended" e jo "sold" sepse çmimi rezervë nuk u arrit');

  // Ensure no order was created for unsold reserve item
  const order = db.prepare('SELECT id FROM orders WHERE product_id = ?').get(pid);
  assert.strictEqual(order, undefined, 'Nuk duhet të gjenerohet porosi nëse çmimi rezervë nuk plotësohet');
});

// -------------------------------------------------------------
// TEST 5: Buy Now ("Bli Menjëherë") & Order Generation
// -------------------------------------------------------------
runTest('Moduli 5: Bli Menjëherë (Buy Now) dhe Krijimi i Porosisë në Kosovë', () => {
  const now = new Date();
  const future = new Date(now.getTime() + 3600 * 1000).toISOString();
  const testSku = 'TEST-SKU-' + Date.now() + '-B';
  const testSlug = 'sony-kufje-buynow-' + Date.now();

  const prod = db.prepare(`
    INSERT INTO products (
      title, slug, sku, starting_price, current_price, reserve_price, buy_now_price,
      auction_start, auction_end, original_end_time, status
    ) VALUES (
      'Sony Kufje Buy Now', ?, ?, 50.00, 50.00, 0, 180.00,
      ?, ?, ?, 'active'
    )
  `).run(testSlug, testSku, now.toISOString(), future, future);

  const pid = prod.lastInsertRowid;

  const buyRes = executeBuyNow({
    productId: pid,
    userId: user2.id,
    shippingDetails: {
      shipping_name: 'Agron Morina',
      shipping_phone: '049123456',
      shipping_city: 'Prishtinë',
      shipping_address: 'Rruga B, Banesa 12/A'
    }
  });

  assert.strictEqual(buyRes.success, true);
  assert.strictEqual(buyRes.finalPrice, 180.00);

  const updatedProd = db.prepare('SELECT status, current_winner_id FROM products WHERE id = ?').get(pid);
  assert.strictEqual(updatedProd.status, 'sold');
  assert.strictEqual(updatedProd.current_winner_id, user2.id);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(buyRes.orderId);
  assert.strictEqual(order.final_price, 180.00);
  assert.strictEqual(order.shipping_fee, 3.00, 'Tarifa e transportit për Kosovë duhet të jetë 3.00 EUR');
  assert.strictEqual(order.total_amount, 183.00);
  assert.strictEqual(order.shipping_city, 'Prishtinë');
  assert.strictEqual(order.order_status, 'processing');
});

// -------------------------------------------------------------
// TEST 6: Mass 9,000 Products CSV Import Benchmark
// -------------------------------------------------------------
await runAsyncTest('Moduli 6: Importi Masiv i 9,000 Produkteve përmes CSV (Performance & Integrity)', async () => {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const testCsvPath = path.join(uploadsDir, 'test_9000_items.csv');
  console.log('   -> Gjenerimi i të dhënave për 9,000 produkte në skedar CSV...');
  
  await generateBulkDatasetCSV(testCsvPath, 9000);

  console.log('   -> Nisja e importimit me chunks në SQLite me WAL mode...');
  const importResult = await importProductsFromCSV(testCsvPath, 'test_9000_items.csv', { batchSize: 1000 });

  console.log(`   -> U importuan ${importResult.successfulRows} produkte në ${importResult.durationSeconds} sekonda!`);
  assert.strictEqual(importResult.successfulRows, 9000, 'Të gjithë 9,000 artikujt duhet të importohen pa gabime');
  assert.ok(importResult.durationMs < 20000, 'Importi i 9,000 artikujve duhet të marrë më pak se 20 sekonda');

  // Verify samples from DB
  const sampleA = db.prepare("SELECT * FROM products WHERE condition_grade = 'A' LIMIT 1").get();
  const sampleB = db.prepare("SELECT * FROM products WHERE condition_grade = 'B' LIMIT 1").get();
  const sampleC = db.prepare("SELECT * FROM products WHERE condition_grade = 'C' LIMIT 1").get();
  assert.ok(sampleA, 'Klasa A e gjendjes duhet të ekzistojë');
  assert.ok(sampleB, 'Klasa B e gjendjes duhet të ekzistojë');
  assert.ok(sampleC, 'Klasa C e gjendjes duhet të ekzistojë');

  // Cleanup test CSV
  try { fs.unlinkSync(testCsvPath); } catch (e) {}
});

console.log('\n====================================================');
console.log(`REZULTATI PËRFUNDIMTAR: ${passedTests}/${totalTests} TESTE KALUAN ME SUKSES! 🚀`);
console.log('====================================================');
