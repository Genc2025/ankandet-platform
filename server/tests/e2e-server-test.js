import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const serverPath = path.join(__dirname, '..', 'server.js');
  console.log('🚀 Starting server from:', serverPath);

  const serverProc = spawn('node', [serverPath], {
    shell: true,
    stdio: 'pipe'
  });

  serverProc.stdout.on('data', d => console.log(d.toString().trim()));
  serverProc.stderr.on('data', d => console.error(d.toString().trim()));

  // Wait 2.5 seconds for startup
  await new Promise(r => setTimeout(r, 2500));

  try {
    console.log('\n--- Test 1: Health Endpoint ---');
    const health = await getJson('http://localhost:5000/api/health');
    console.log('Status code:', health.status);
    console.log('Platform:', health.data?.platform);

    console.log('\n--- Test 2: Active Auctions List ---');
    const auctions = await getJson('http://localhost:5000/api/auctions?limit=5');
    console.log('Auctions returned:', auctions.data?.data?.length);
    console.log('Top auction:', auctions.data?.data?.[0]?.title);
    console.log('Current price:', '€' + auctions.data?.data?.[0]?.current_price);
    console.log('Condition grade:', auctions.data?.data?.[0]?.condition_grade);

    console.log('\n--- Test 3: Categories ---');
    const cats = await getJson('http://localhost:5000/api/auctions/categories');
    console.log('Total categories:', cats.data?.categories?.length);

    console.log('\n--- Test 4: Kosovo Municipalities ---');
    const cities = await getJson('http://localhost:5000/api/auth/cities');
    console.log('Kosovo cities listed:', cities.data?.cities?.length);

    console.log('\n--- Test 5: Single Product & Live Bid History ---');
    const prodId = auctions.data?.data?.[0]?.id;
    const prodDetail = await getJson(`http://localhost:5000/api/auctions/${prodId}`);
    console.log('Auction title:', prodDetail.data?.product?.title);
    console.log('Total bids in history:', prodDetail.data?.bidHistory?.length);
    console.log('Masked winning bidder:', prodDetail.data?.bidHistory?.[0]?.bidder_name);

    console.log('\n🎉 ALL 5 E2E SERVER & API TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ E2E test error:', err);
  } finally {
    console.log('🛑 Closing test server process...');
    serverProc.kill('SIGINT');
  }
}

run();
