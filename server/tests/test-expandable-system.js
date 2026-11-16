import assert from 'assert';

async function testExpandableSystem() {
  console.log('====================================================');
  console.log('🧪 VERIFIKIMI I SISTEMIT GLOBAL TË KARTËS SË ZGJERUESHME (INLINE EXPANSION)');
  console.log('====================================================');

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Fetch public product listing
  const listRes = await fetch(`${BASE_URL}/auctions?limit=12`);
  assert.strictEqual(listRes.status, 200, 'Listing endpoint should return 200');
  const listData = await listRes.json();
  assert(listData.data.length > 0, 'Products list should contain items');
  const sampleProduct = listData.data[0];
  console.log(`✅ [PASS] Shfletimi i Listës së Produkteve: U morën ${listData.data.length} artikuj. Shembull: "${sampleProduct.title}" (ID: ${sampleProduct.id})`);

  // 2. Fetch inline expanded details for this product
  const detailRes = await fetch(`${BASE_URL}/auctions/${sampleProduct.id}`);
  assert.strictEqual(detailRes.status, 200, 'Single product endpoint should return 200');
  const detailData = await detailRes.json();
  assert(detailData.product, 'Product details must exist');
  assert(Array.isArray(detailData.product.images), 'Images must be an array');
  assert(Array.isArray(detailData.bidHistory), 'Bid history must be an array');
  assert(Array.isArray(detailData.relatedProducts), 'Related products must be an array');
  console.log(`✅ [PASS] Detajet e Zgjeruara Inline:`);
  console.log(`   - Imazhe në galeri: ${detailData.product.images.length}`);
  console.log(`   - Historiku i ofertave: ${detailData.bidHistory.length} oferta`);
  console.log(`   - Çmimi aktual: €${detailData.product.current_price.toFixed(2)}`);
  console.log(`   - Oferta minimale e radhës: €${detailData.product.min_next_bid.toFixed(2)}`);
  console.log(`   - Produkte të ngjashme në kategori: ${detailData.relatedProducts.length}`);

  // 3. User Login & Bidding via Expanded Console
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'agron.m@gmail.com', password: 'Klienti123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert(token, 'User should receive auth token');

  const nextBid = detailData.product.min_next_bid || (detailData.product.current_price + 2);
  const bidRes = await fetch(`${BASE_URL}/auctions/${sampleProduct.id}/bid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount: nextBid, isProxy: true })
  });
  const bidData = await bidRes.json();
  assert.strictEqual(bidRes.status, 200, 'Bid should succeed');
  console.log(`✅ [PASS] Vendosja e Ofertës nga Paneli Inline:`);
  console.log(`   - Mesazhi: ${bidData.message}`);
  console.log(`   - Çmimi i ri i regjistruar: €${bidData.currentPrice.toFixed(2)}`);
  console.log(`   - Totali i ofertave: ${bidData.totalBids}`);

  // 4. Verify Watchlist Toggle
  const watchRes = await fetch(`${BASE_URL}/auctions/${sampleProduct.id}/watchlist`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const watchData = await watchRes.json();
  assert.strictEqual(watchRes.status, 200, 'Watchlist toggle should succeed');
  console.log(`✅ [PASS] Ndryshimi i Preferencave (Watchlist): ${watchData.message} (watched: ${watchData.watched})`);

  // 5. Test Quick Filtering and Sorting
  const endingSoonRes = await fetch(`${BASE_URL}/auctions?sort=ending_soon&limit=5`);
  const endingSoonData = await endingSoonRes.json();
  assert.strictEqual(endingSoonRes.status, 200);

  const newestRes = await fetch(`${BASE_URL}/auctions?sort=newest&limit=5`);
  const newestData = await newestRes.json();
  assert.strictEqual(newestRes.status, 200);

  const buyNowRes = await fetch(`${BASE_URL}/auctions?buy_now=1&limit=5`);
  const buyNowData = await buyNowRes.json();
  assert.strictEqual(buyNowRes.status, 200);
  console.log(`✅ [PASS] Filtrat e Shpejtë (Përfundojnë së Shpejti, Më të Rejat, Bli Menjëherë) funksionojnë pa ndërprerje.`);

  console.log('====================================================');
  console.log('🎉 TË GJITHA KONTROLLET E SISTEMIT INLINE EXPANSION KALUAN ME SUKSES!');
  console.log('====================================================');
}

testExpandableSystem().catch((err) => {
  console.error('❌ Dështoi verifikimi:', err);
  process.exit(1);
});
