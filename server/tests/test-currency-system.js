import assert from 'assert';

async function testCurrencySystem() {
  console.log('====================================================');
  console.log('🧪 TESTIMI I SISTEMIT TË KONVERTIMIT VALUTOR (EUR <-> LEK)');
  console.log('====================================================');

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Test public exchange-rate endpoint
  const rateRes = await fetch(`${BASE_URL}/auctions/exchange-rate`);
  assert.strictEqual(rateRes.status, 200, 'Exchange rate endpoint should return 200');
  const rateData = await rateRes.json();
  console.log(`✅ [PASS] Marrja e kursit publik: 1 ${rateData.baseCurrency} = ${rateData.rate} ${rateData.currency}`);
  assert(rateData.rate > 0, 'Rate should be greater than 0');

  // 2. Admin login to test updating exchange rate
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ankandet.al', password: 'Admin123!' })
  });
  const { token } = await loginRes.json();
  assert(token, 'Admin should have valid token');

  // 3. Update rate to 100.50
  const updateRes = await fetch(`${BASE_URL}/admin/financials/exchange-rate`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ rate: 100.50 })
  });
  assert.strictEqual(updateRes.status, 200, 'Update exchange rate should return 200');
  const updateData = await updateRes.json();
  console.log(`✅ [PASS] Përditësimi nga Admini: ${updateData.message} (kursi i ri: ${updateData.exchangeRate})`);

  // 4. Check that /financials includes the updated rate
  const finRes = await fetch(`${BASE_URL}/admin/financials`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const finData = await finRes.json();
  assert.strictEqual(finData.exchangeRate, 100.50, 'Financials should reflect updated rate');
  console.log(`✅ [PASS] Paneli Financiar reflekton kursin e ri: 1 € = ${finData.exchangeRate} L`);

  // 5. Restore rate to 100.00
  await fetch(`${BASE_URL}/admin/financials/exchange-rate`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ rate: 100.00 })
  });
  console.log(`✅ [PASS] Kursi u rivendos në standardin 1 € = 100.00 L`);

  console.log('====================================================');
  console.log('🎉 TË GJITHA TESTET E KONVERTIMIT NË LEK KALUAN ME SUKSES!');
  console.log('====================================================');
}

testCurrencySystem().catch((err) => {
  console.error('❌ Dështoi testimi:', err);
  process.exit(1);
});
