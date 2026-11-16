import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

console.log('🌓 TESTING DAY & NIGHT (DARK MODE) SYSTEM FOR ANKANDET.KS...');

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

// 1. Check index.css has Tailwind v4 custom variant
const indexCss = fs.readFileSync(path.join(rootDir, 'client', 'src', 'index.css'), 'utf-8');
assert(indexCss.includes('@custom-variant dark (&:where(.dark, .dark *));'), 'index.css configures class-based dark variant');

// 2. Check ThemeContext.tsx exists and is implemented correctly
const themeContext = fs.readFileSync(path.join(rootDir, 'client', 'src', 'context', 'ThemeContext.tsx'), 'utf-8');
assert(themeContext.includes('export const ThemeProvider'), 'ThemeContext exports ThemeProvider');
assert(themeContext.includes('export const useTheme'), 'ThemeContext exports useTheme');
assert(themeContext.includes("root.classList.add('dark')"), 'ThemeContext toggles dark class on html root');
assert(themeContext.includes("localStorage.setItem('ankandet_theme'"), 'ThemeContext persists theme in localStorage');

// 3. Check main.tsx wraps App with ThemeProvider
const mainTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'main.tsx'), 'utf-8');
assert(mainTsx.includes('<ThemeProvider>') && mainTsx.includes('</ThemeProvider>'), 'main.tsx wraps App with ThemeProvider');

// 4. Check Navbar.tsx has Theme Toggle (Sun and Moon)
const navbarTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'components', 'Navbar.tsx'), 'utf-8');
assert(navbarTsx.includes('useTheme()'), 'Navbar uses useTheme hook');
assert(navbarTsx.includes('<Sun') && navbarTsx.includes('<Moon'), 'Navbar renders Sun and Moon icons for toggle');
assert(navbarTsx.includes('dark:bg-slate-900'), 'Navbar has dark background variant');

// 5. Check App.tsx has dark mode classes
const appTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'App.tsx'), 'utf-8');
assert(appTsx.includes('dark:bg-slate-950'), 'App root has dark:bg-slate-950');
assert(appTsx.includes('dark:text-slate-100'), 'App text has dark:text-slate-100');
assert(appTsx.includes('dark:bg-slate-900'), 'App toolbars & containers have dark:bg-slate-900');

// 6. Check AuctionCard.tsx has dark mode classes
const auctionCardTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'components', 'AuctionCard.tsx'), 'utf-8');
assert(auctionCardTsx.includes('dark:bg-slate-900'), 'AuctionCard has dark:bg-slate-900');
assert(auctionCardTsx.includes('dark:border-slate-800'), 'AuctionCard has dark:border-slate-800');
assert(auctionCardTsx.includes('dark:text-white'), 'AuctionCard has dark:text-white price styling');

// 7. Check InlineProductDetails.tsx has dark mode classes
const inlineDetailsTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'components', 'InlineProductDetails.tsx'), 'utf-8');
assert(inlineDetailsTsx.includes('dark:bg-slate-900'), 'InlineProductDetails has dark:bg-slate-900 container');
assert(inlineDetailsTsx.includes('dark:border-slate-800'), 'InlineProductDetails has dark:border-slate-800 dividers');
assert(inlineDetailsTsx.includes('dark:text-white'), 'InlineProductDetails has dark:text-white headings & prices');

// 8. Check UserDashboard.tsx has dark mode classes
const userDashTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'components', 'UserDashboard.tsx'), 'utf-8');
assert(userDashTsx.includes('dark:bg-slate-900'), 'UserDashboard has dark:bg-slate-900 cards & tabs');

// 9. Check BuyNowModal.tsx & AuthModal.tsx have dark mode classes
const buyNowTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'components', 'BuyNowModal.tsx'), 'utf-8');
const authModalTsx = fs.readFileSync(path.join(rootDir, 'client', 'src', 'components', 'AuthModal.tsx'), 'utf-8');
assert(buyNowTsx.includes('dark:bg-slate-900'), 'BuyNowModal has dark:bg-slate-900 modal surface');
assert(authModalTsx.includes('dark:bg-slate-900'), 'AuthModal has dark:bg-slate-900 modal surface');

// 10. Check client/dist assets exist and are compiled
const distDir = path.join(rootDir, 'client', 'dist', 'assets');
assert(fs.existsSync(distDir), 'client/dist/assets exists and contains built bundle');
const files = fs.readdirSync(distDir);
const cssFile = files.find(f => f.endsWith('.css'));
const jsFile = files.find(f => f.endsWith('.js'));
assert(Boolean(cssFile && jsFile), `Found compiled CSS (${cssFile}) and JS (${jsFile})`);

console.log(`\n====================================================`);
console.log(`THEME TEST RESULTS: ${passed}/${total} assertions passed.`);
console.log(`====================================================`);

if (passed === total) {
  console.log('🎉 ALL DAY & NIGHT MODE SYSTEM TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
