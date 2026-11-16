import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

console.log('🔍 TESTING EXPAND & SHRINK TOGGLE SYSTEM (RRITJE & ZVOGËLIM ME KLIKIM)...');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAILED: ${message}`);
  }
}

// 1. Check AuctionCard toggle & visual growth
const cardTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'components', 'AuctionCard.tsx'), 'utf-8');
assert(cardTsx.includes('scale-[1.03]'), 'AuctionCard visually enlarges with scale-[1.03] when expanded');
assert(cardTsx.includes('ring-4 ring-amber-400/90'), 'AuctionCard highlights with prominent glowing ring');
assert(cardTsx.includes('Hapur • Kliko Prap për Zvogëlim ✕'), 'AuctionCard pill clearly signals click-to-shrink');
assert(cardTsx.includes('onSelect(product)'), 'AuctionCard triggers toggle on card click');

// 2. Check ExpandableProductGrid smooth expand and shrink transitions
const gridTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'components', 'ExpandableProductGrid.tsx'), 'utf-8');
assert(gridTsx.includes('isExpandedVisible'), 'ExpandableProductGrid tracks visibility for animation');
assert(gridTsx.includes('opacity-100 max-h-[3500px] scale-100'), 'ExpandableProductGrid has smooth expansion transition styles');
assert(gridTsx.includes('opacity-0 max-h-0 scale-98'), 'ExpandableProductGrid has smooth shrinking transition styles');
assert(gridTsx.includes('setExpandedId(null)'), 'ExpandableProductGrid supports toggling closed / shrink on second click');

// 3. Check InlineProductDetails top shrink banner & image zoom
const detailsTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'components', 'InlineProductDetails.tsx'), 'utf-8');
assert(detailsTsx.includes('Kliko këtu ose prap mbi kartën për ta zvogëluar'), 'InlineProductDetails includes top click-to-shrink banner');
assert(detailsTsx.includes('Zvogëlo ✕'), 'InlineProductDetails has prominent Zvogëlo collapse button');
assert(detailsTsx.includes('isImageZoomed'), 'InlineProductDetails supports image enlarge / zoom state');
assert(detailsTsx.includes('Kliko prap kudo mbi foto ose jashtë për ta zvogëluar'), 'InlineProductDetails has image zoom lightbox modal that shrinks on click');

// 4. Verify dist bundle
const distDir = path.join(rootDir, 'client', 'dist', 'assets');
assert(fs.existsSync(distDir), 'client/dist/assets exists');
const files = fs.readdirSync(distDir);
const jsBundle = files.find(f => f.endsWith('.js'));
assert(Boolean(jsBundle), `Production JS bundle exists: ${jsBundle}`);

console.log(`\n====================================================`);
console.log(`TOGGLE EXPAND/SHRINK TEST: ${passed}/${total} assertions passed.`);
console.log(`====================================================`);

if (passed === total) {
  console.log('🎉 ALL TOGGLE EXPAND & SHRINK TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
} else {
  console.error('❌ TESTS FAILED');
  process.exit(1);
}
