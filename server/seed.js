import bcrypt from 'bcryptjs';
import db, { initDatabase, logActivity, createAdminNotification } from './db.js';
import { generateSlug, generateSKU } from './importer.js';
import { placeBid, executeBuyNow } from './auction-engine.js';

initDatabase();

console.log('Seeding initial business data for Ankandet Platform...');

// 1. Initial Financial Capital Settings
db.prepare(`
  INSERT INTO financial_settings (key, value) 
  VALUES ('initial_investment', '31000.00')
  ON CONFLICT(key) DO UPDATE SET value = '31000.00'
`).run();

// 2. Seed Realistic Operating Expenses (Doganë, Transport, Magazinë, Marketing)
db.prepare('DELETE FROM expenses').run();
const insertExpense = db.prepare(`
  INSERT INTO expenses (category, title, amount, expense_date, notes)
  VALUES (?, ?, ?, ?, ?)
`);

insertExpense.run('dogana', 'Zhboganimi i Kontingjentit #1 të Pajisjeve Elektronike', 2450.00, '2026-11-01', 'Dogana e Kosovës - Terminali Prishtinë');
insertExpense.run('transport', 'Transporti Ndërkombëtar me Kamion (Gjermani - Kosovë)', 1800.00, '2026-11-02', 'Transporti i 9,000 artikujve');
insertExpense.run('operim', 'Qiraja dhe Mirëmbajtja e Magazinës në Fushë Kosovë', 850.00, '2026-11-05', 'Hapësira 450m2');
insertExpense.run('marketing', 'Fushata e Marketingut në Facebook & Instagram në Kosovë', 450.00, '2026-11-08', 'Synim blerësit në Prishtinë, Prizren, Pejë');
insertExpense.run('paketim', 'Furnizim me Kuti Kartoni dhe Material Mbrojtës (Bubble wrap)', 280.00, '2026-11-10', 'Paketim i sigurt për dërgesa');

// 3. Seed Users
const salt = bcrypt.genSaltSync(10);
const adminPassword = bcrypt.hashSync('Admin123!', salt);
const buyerPassword = bcrypt.hashSync('Klienti123!', salt);

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (email, password_hash, full_name, phone, role, city, address)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

insertUser.run('admin@ankandet.al', adminPassword, 'Administratori Kryesor', '+38344111222', 'admin', 'Prishtinë', 'Rruga Nënë Tereza 14');
insertUser.run('agron.m@gmail.com', buyerPassword, 'Agron Morina', '+38349223344', 'buyer', 'Prishtinë', 'Dardania, Blloku 4');
insertUser.run('blerina.k@gmail.com', buyerPassword, 'Blerina Krasniqi', '+38345334455', 'buyer', 'Prizren', 'Shadërvan Nr. 8');
insertUser.run('dardan.g@gmail.com', buyerPassword, 'Dardan Gashi', '+38344556677', 'buyer', 'Pejë', 'Rruga Mbretëresha Teutë');

const admin = db.prepare("SELECT id FROM users WHERE email = 'admin@ankandet.al'").get();
const agron = db.prepare("SELECT id FROM users WHERE email = 'agron.m@gmail.com'").get();
const blerina = db.prepare("SELECT id FROM users WHERE email = 'blerina.k@gmail.com'").get();
const dardan = db.prepare("SELECT id FROM users WHERE email = 'dardan.g@gmail.com'").get();

// 4. Seed Categories
const categories = [
  { name: 'Elektronikë & TV', icon: 'Tv', description: 'Televizorë inteligjentë, sisteme audio, pajisje argëtuese dhe pajisje multimediale' },
  { name: 'Telefonë & Smart', icon: 'Smartphone', description: 'Smartphones, tabletë, orë inteligjente dhe aksesorë origjinalë' },
  { name: 'Laptopë & IT', icon: 'Laptop', description: 'Laptopë gaming, pajisje zyre, monitorë dhe komponentë kompjuterikë' },
  { name: 'Pajisje Shtëpiake', icon: 'Home', description: 'Kondicionerë, fritezë, lavatriçe, aparate kafeje dhe miksera' },
  { name: 'Vegla Pune & Makineri', icon: 'Wrench', description: 'Trapanë, prerëse këndore, gjeneratorë, sete çelësash profesionalë' },
  { name: 'Pjesë Automjetesh', icon: 'Car', description: 'Fellne alumini, goma, fenerë LED, vajra motori dhe pjesë këmbimi' },
  { name: 'Orë & Aksesorë', icon: 'Watch', description: 'Orë automatike zvicerane, syze dielli, kuleta dhe çanta lëkure' }
];

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, slug, icon, description, sort_order)
  VALUES (?, ?, ?, ?, ?)
`);

categories.forEach((cat, idx) => {
  insertCategory.run(cat.name, generateSlug(cat.name), cat.icon, cat.description, idx + 1);
});

// 5. Seed Realistic Products with Cost Price (Kosto Blerjeje)
const catRows = db.prepare('SELECT * FROM categories').all();
const catMap = {};
catRows.forEach(c => { catMap[c.name] = c.id; });

const now = Date.now();
const hour = 3600 * 1000;
const day = 24 * hour;

const initialProducts = [
  {
    title: 'Apple iPhone 15 Pro Max 256GB - Titanium Natyral',
    category: 'Telefonë & Smart',
    condition: 'A',
    condition_details: 'Klasa A (Si e re). Bateria 99%, vjen me kuti origjinale dhe kabllo USB-C të papërdorur.',
    sku: 'ANK-APL-15PM',
    description: 'iPhone 15 Pro Max me trup titani të lehtë, procesor A17 Pro, kamerë kryesore 48MP me zmadhim optik 5x. Testuar në të gjithë operatorët e Kosovës (Vala & IPKO).',
    cost_price: 450.00,
    starting_price: 150.00,
    reserve_price: 650.00,
    buy_now_price: 890.00,
    views_count: 142,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a'
    ],
    end_offset: 4 * hour + 15 * 60 * 1000
  },
  {
    title: 'Sony PlayStation 5 Slim Edition 1TB + 2 Kontrollues DualSense',
    category: 'Elektronikë & TV',
    condition: 'A',
    condition_details: 'Klasa A (Paketim i hapur). Përdorur vetëm 2 javë në ambient zyre, pa asnjë gërvishtje.',
    sku: 'ANK-SNY-PS5S',
    description: 'Versioni më i ri kompakt i PS5 Slim me disk 1TB SSD, grafika 4K 120Hz dhe teknologji Ray Tracing. Përfshin dy telekomandë origjinale DualSense me feedback haptik.',
    cost_price: 240.00,
    starting_price: 80.00,
    reserve_price: 380.00,
    buy_now_price: 499.00,
    views_count: 98,
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f'
    ],
    end_offset: 1 * hour + 30 * 60 * 1000
  },
  {
    title: 'Apple MacBook Air 15" M2 (16GB RAM, 512GB SSD) - Midnight Blue',
    category: 'Laptopë & IT',
    condition: 'A',
    condition_details: 'Klasa A (Gjendje e përkryer). 38 cikle ngarkimi baterie. Tastierë US/QWERTY me ndriçim.',
    sku: 'ANK-MAC-15M2',
    description: 'Ekrani Liquid Retina 15.3 inç, çipi efikas M2 me 8-core CPU dhe 10-core GPU. Ideale për punë zyre, dizajnim grafik dhe programim. Bateri deri në 18 orë.',
    cost_price: 580.00,
    starting_price: 200.00,
    reserve_price: 750.00,
    buy_now_price: 1050.00,
    views_count: 85,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9'
    ],
    end_offset: 12 * hour
  },
  {
    title: 'Set Profesional Trapan me Bateri Bosch Professional GSB 18V-55',
    category: 'Vegla Pune & Makineri',
    condition: 'B',
    condition_details: 'Klasa B (E përdorur me kujdes). Shenja të lehta në valixhe, mekanizmi dhe motori Brushless punojnë 100%.',
    sku: 'ANK-BSH-18V',
    description: 'Përfshin trapanin me goditje Bosch GSB 18V-55 pa furça (Brushless), 2x bateri ProCORE18V 4.0Ah, karikues të shpejtë GAL 18V-40 dhe valixhe origjinale L-BOXX.',
    cost_price: 75.00,
    starting_price: 30.00,
    reserve_price: 110.00,
    buy_now_price: 175.00,
    views_count: 62,
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758'
    ],
    end_offset: 2 * day
  },
  {
    title: 'Kondicioner Inverter Midea Breezeless 12000 BTU A+++ me Wi-Fi',
    category: 'Pajisje Shtëpiake',
    condition: 'A',
    condition_details: 'Klasa A (E re në paketim). Paketim i mbyllur me garancion të plotë nga importuesi.',
    sku: 'ANK-MDA-12BR',
    description: 'Teknologji revolucionare me mikrovrimat TwinFlap që nuk fryjnë ajër të fortë direkt. Ngrohje efikase deri në -20°C, kontroll i plotë përmes aplikacionit në telefon.',
    cost_price: 195.00,
    starting_price: 60.00,
    reserve_price: 320.00,
    buy_now_price: 430.00,
    views_count: 51,
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586'
    ],
    end_offset: 3 * day
  },
  {
    title: 'Set 4 Fellne Alumini Origjinale BMW M-Performance 19" (Styling 791M)',
    category: 'Pjesë Automjetesh',
    condition: 'B',
    condition_details: 'Klasa B. Drejtimi 100% i saktë, pa krisje ose saldime. Vetëm disa shenja të lehta trotuari.',
    sku: 'ANK-BMW-791M',
    description: 'Set origjinal i përshtatshëm për BMW Seria 3 (G20/G21) dhe Seria 4 (G22/G23). Hapësira e vidave 5x112. Përfshijnë sensorët origjinalë të presionit TPMS.',
    cost_price: 310.00,
    starting_price: 120.00,
    reserve_price: 550.00,
    buy_now_price: 780.00,
    views_count: 73,
    images: [
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd',
      'https://images.unsplash.com/photo-1563720223185-11003d516935'
    ],
    end_offset: 18 * hour
  },
  {
    title: 'Orë Automatike Japoneze Seiko Prospex "Turtle" 200m Diver',
    category: 'Orë & Aksesorë',
    condition: 'A',
    condition_details: 'Klasa A. Përdorur vetëm disa herë. Xhami pa asnjë mikrovijë, mekanizmi 4R36 punon me saktësi kronometri.',
    sku: 'ANK-SEI-TRTL',
    description: 'Orë legjendare e zhytësve profesionalë rezistente ndaj ujit deri në 200 metra. Rrip silikoni origjinal Seiko, numërues me ndriçim Lumibrite që shkëlqen fort në errësirë.',
    cost_price: 135.00,
    starting_price: 50.00,
    reserve_price: 240.00,
    buy_now_price: 360.00,
    views_count: 38,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6'
    ],
    end_offset: 28 * hour
  },
  {
    title: 'Fshesë Robot me Larje me Ujë Roborock S8 Pro Ultra',
    category: 'Pajisje Shtëpiake',
    condition: 'A',
    condition_details: 'Klasa A. Stacioni i pastrimit automatik i plotë me shishet e ujit të pastër dhe të ndotur.',
    sku: 'ANK-ROB-S8PU',
    description: 'Fshesa më e avancuar me fuqi thithëse 6000Pa, furça të dyfishta gome dhe larje të leckës me ajër të nxehtë. Navigim LiDAR me shmangie të zgjuar të pengesave 3D.',
    cost_price: 290.00,
    starting_price: 100.00,
    reserve_price: 480.00,
    buy_now_price: 680.00,
    views_count: 22,
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90'
    ],
    end_offset: 45 * hour
  }
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (
    title, slug, sku, description, category_id,
    condition_grade, condition_details, images,
    cost_price, starting_price, current_price, reserve_price, buy_now_price,
    min_bid_increment, auction_start, auction_end, original_end_time,
    anti_snip_minutes, anti_snip_extension, views_count, status
  ) VALUES (
    ?, ?, ?, ?, ?,
    ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    2, 3, ?, 'active'
  )
`);

for (const p of initialProducts) {
  const catId = catMap[p.category] || null;
  const startTime = new Date(now).toISOString();
  const endTime = new Date(now + p.end_offset).toISOString();
  const slug = generateSlug(p.title);

  insertProduct.run(
    p.title,
    slug,
    p.sku,
    p.description,
    catId,
    p.condition,
    p.condition_details,
    JSON.stringify(p.images),
    p.cost_price,
    p.starting_price,
    p.starting_price,
    p.reserve_price,
    p.buy_now_price,
    p.starting_price < 50 ? 1 : 2,
    startTime,
    endTime,
    endTime,
    p.views_count || 10
  );
}

// 6. Seed Sample Historical Completed Orders for Business Intelligence Charts
const existingOrdersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
if (existingOrdersCount < 5 && agron && blerina) {
  console.log('Seeding historical sales for business analytics...');
  
  const sampleSales = [
    { title: 'Televizor Samsung 55" 4K Smart Crystal UHD', sku: 'ANK-OLD-SAM55', price: 340.00, cost: 210.00, date: '2026-11-09', city: 'Prishtinë', user_id: agron.id },
    { title: 'Laptop Lenovo Legion 5 Gaming 16GB', sku: 'ANK-OLD-LEG5', price: 680.00, cost: 420.00, date: '2026-11-10', city: 'Prizren', user_id: blerina.id },
    { title: 'Gjenerator Rryme Honda 3.5KW Inverter Silent', sku: 'ANK-OLD-HON35', price: 420.00, cost: 260.00, date: '2026-11-11', city: 'Pejë', user_id: dardan.id },
    { title: 'Kufje Sony WH-1000XM5 me Noise Cancelling', sku: 'ANK-OLD-WHXM5', price: 230.00, cost: 140.00, date: '2026-11-12', city: 'Gjilan', user_id: agron.id },
    { title: 'Aparat Kafeje DeLonghi Magnifica S Espresso', sku: 'ANK-OLD-DELMG', price: 280.00, cost: 165.00, date: '2026-11-13', city: 'Ferizaj', user_id: blerina.id }
  ];

  for (const s of sampleSales) {
    // Create sold product record
    const pSlug = generateSlug(s.title);
    const pInfo = db.prepare(`
      INSERT OR IGNORE INTO products (
        title, slug, sku, starting_price, current_price, cost_price, status, auction_start, auction_end, original_end_time
      ) VALUES (?, ?, ?, ?, ?, ?, 'sold', ?, ?, ?)
    `).run(s.title, pSlug, s.sku, s.cost, s.price, s.cost, `${s.date} 10:00:00`, `${s.date} 18:00:00`, `${s.date} 18:00:00`);

    const pId = pInfo.lastInsertRowid || db.prepare('SELECT id FROM products WHERE sku = ?').get(s.sku).id;

    // Create completed order
    db.prepare(`
      INSERT OR IGNORE INTO orders (
        order_number, user_id, product_id, cost_price, final_price, shipping_fee, total_amount,
        payment_method, payment_status, order_status, shipping_name, shipping_phone, shipping_city, shipping_address, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, 3.00, ?, 'cash_on_delivery', 'paid', 'delivered', ?, '044111222', ?, 'Qendër', ?
      )
    `).run(
      `ANK-HIST-${Date.now()}-${pId}`,
      s.user_id,
      pId,
      s.cost,
      s.price,
      s.price + 3.00,
      s.city === 'Prishtinë' ? 'Agron Morina' : 'Blerina Krasniqi',
      s.city,
      `${s.date} 18:30:00`
    );
  }
}

// 7. Seed Initial Notifications
db.prepare('DELETE FROM admin_notifications').run();
createAdminNotification({
  type: 'product_sold',
  title: 'Artikull i Shitur me Sukses!',
  message: 'Televizor Samsung 55" 4K u shit për €340.00. Fitimi bruto: €130.00.',
  severity: 'success'
});

createAdminNotification({
  type: 'low_stock',
  title: 'Paralajmërim Stoku!',
  message: 'Kategoria "Pajisje Shtëpiake" ka vetëm 2 artikuj aktivë në magazinë.',
  severity: 'warning'
});

createAdminNotification({
  type: 'high_views_no_bids',
  title: 'Interes i lartë por pa oferta',
  message: 'Artikulli "Fshesë Robot Roborock S8" ka arritur 22 shikime por ende nuk ka oferta.',
  severity: 'info'
});

console.log('Seeding completed successfully! Financials, expenses, and analytics ready.');
