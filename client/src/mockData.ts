import { 
  Category, Product, User, Order, Expense, FinancialData, 
  DailyChartPoint, SalesAnalytics, InventorySummary, AdminNotification, 
  ActivityLog, AdminMetrics 
} from './types';

export const DEMO_CATEGORIES: Category[] = [
  { id: 1, name: 'Elektronikë & TV', slug: 'elektronike-tv', icon: 'Tv', description: 'Televizorë inteligjentë, sisteme audio, pajisje argëtuese', active_count: 3 },
  { id: 2, name: 'Telefonë & Smart', slug: 'telefone-smart', icon: 'Smartphone', description: 'Smartphones, tabletë, orë inteligjente dhe aksesorë', active_count: 4 },
  { id: 3, name: 'Laptopë & IT', slug: 'laptope-it', icon: 'Laptop', description: 'Laptopë gaming, pajisje zyre, monitorë', active_count: 2 },
  { id: 4, name: 'Pajisje Shtëpiake', slug: 'pajisje-shtepiake', icon: 'Home', description: 'Kondicionerë, fritezë, lavatriçe, aparate kafeje', active_count: 3 },
  { id: 5, name: 'Vegla Pune & Makineri', slug: 'vegla-pune-makineri', icon: 'Wrench', description: 'Trapanë, prerëse këndore, gjeneratorë', active_count: 2 },
  { id: 6, name: 'Pjesë Automjetesh', slug: 'pjese-automjetesh', icon: 'Car', description: 'Fellne alumini, goma, fenerë LED, vajra', active_count: 2 },
  { id: 7, name: 'Orë & Aksesorë', slug: 'ore-aksesore', icon: 'Watch', description: 'Orë automatike zvicerane, syze dielli, kuleta', active_count: 2 },
];

const now = Date.now();
const hour = 3600 * 1000;
const day = 24 * hour;

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Apple iPhone 15 Pro Max 256GB - Titanium Natyral',
    slug: 'apple-iphone-15-pro-max-256gb-titanium-natyral',
    sku: 'ANK-APL-15PM',
    description: 'iPhone 15 Pro Max me trup titani të lehtë, procesor A17 Pro, kamerë kryesore 48MP me zmadhim optik 5x. Testuar në të gjithë operatorët e Kosovës (Vala & IPKO).',
    category_id: 2,
    category_name: 'Telefonë & Smart',
    category_slug: 'telefone-smart',
    condition_grade: 'A',
    condition_details: 'Klasa A (Si e re). Bateria 99%, vjen me kuti origjinale dhe kabllo USB-C të papërdorur.',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 450.00,
    starting_price: 150.00,
    current_price: 680.00,
    reserve_price: 650.00,
    buy_now_price: 890.00,
    min_bid_increment: 10,
    min_next_bid: 690.00,
    auction_start: new Date(now - 2 * day).toISOString(),
    auction_end: new Date(now + 4 * hour + 15 * 60 * 1000).toISOString(),
    original_end_time: new Date(now + 4 * hour + 15 * 60 * 1000).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 142,
    current_winner_id: 2,
    winner_name: 'Agron M.',
    total_bids: 18,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 2 * day).toISOString()
  },
  {
    id: 2,
    title: 'Sony PlayStation 5 Slim Edition 1TB + 2 Kontrollues DualSense',
    slug: 'sony-playstation-5-slim-edition-1tb-2-kontrollues-dualsense',
    sku: 'ANK-SNY-PS5S',
    description: 'Versioni më i ri kompakt i PS5 Slim me disk 1TB SSD, grafika 4K 120Hz dhe teknologji Ray Tracing. Përfshin dy telekomandë origjinale DualSense me feedback haptik.',
    category_id: 1,
    category_name: 'Elektronikë & TV',
    category_slug: 'elektronike-tv',
    condition_grade: 'A',
    condition_details: 'Klasa A (Paketim i hapur). Përdorur vetëm 2 javë në ambient zyre, pa asnjë gërvishtje.',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 240.00,
    starting_price: 80.00,
    current_price: 410.00,
    reserve_price: 380.00,
    buy_now_price: 499.00,
    min_bid_increment: 5,
    min_next_bid: 415.00,
    auction_start: new Date(now - day).toISOString(),
    auction_end: new Date(now + 1 * hour + 30 * 60 * 1000).toISOString(),
    original_end_time: new Date(now + 1 * hour + 30 * 60 * 1000).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 98,
    current_winner_id: 3,
    winner_name: 'Blerina K.',
    total_bids: 24,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - day).toISOString()
  },
  {
    id: 3,
    title: 'Apple MacBook Air 15" M2 (16GB RAM, 512GB SSD) - Midnight Blue',
    slug: 'apple-macbook-air-15-m2-16gb-ram-512gb-ssd-midnight-blue',
    sku: 'ANK-MAC-15M2',
    description: 'Ekrani Liquid Retina 15.3 inç, çipi efikas M2 me 8-core CPU dhe 10-core GPU. Ideale për punë zyre, dizajnim grafik dhe programim. Bateri deri në 18 orë.',
    category_id: 3,
    category_name: 'Laptopë & IT',
    category_slug: 'laptope-it',
    condition_grade: 'A',
    condition_details: 'Klasa A (Gjendje e përkryer). 38 cikle ngarkimi baterie. Tastierë US/QWERTY me ndriçim.',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 580.00,
    starting_price: 200.00,
    current_price: 760.00,
    reserve_price: 750.00,
    buy_now_price: 1050.00,
    min_bid_increment: 10,
    min_next_bid: 770.00,
    auction_start: new Date(now - day).toISOString(),
    auction_end: new Date(now + 12 * hour).toISOString(),
    original_end_time: new Date(now + 12 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 85,
    current_winner_id: 4,
    winner_name: 'Dardan G.',
    total_bids: 15,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - day).toISOString()
  },
  {
    id: 4,
    title: 'Set Profesional Trapan me Bateri Bosch Professional GSB 18V-55',
    slug: 'set-profesional-trapan-me-bateri-bosch-gsb-18v-55',
    sku: 'ANK-BSH-18V',
    description: 'Përfshin trapanin me goditje Bosch GSB 18V-55 pa furça (Brushless), 2x bateri ProCORE18V 4.0Ah, karikues të shpejtë GAL 18V-40 dhe valixhe origjinale L-BOXX.',
    category_id: 5,
    category_name: 'Vegla Pune & Makineri',
    category_slug: 'vegla-pune-makineri',
    condition_grade: 'B',
    condition_details: 'Klasa B (E përdorur me kujdes). Shenja të lehta në valixhe, mekanizmi dhe motori Brushless punojnë 100%.',
    images: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 75.00,
    starting_price: 30.00,
    current_price: 125.00,
    reserve_price: 110.00,
    buy_now_price: 175.00,
    min_bid_increment: 5,
    min_next_bid: 130.00,
    auction_start: new Date(now - 12 * hour).toISOString(),
    auction_end: new Date(now + 2 * day).toISOString(),
    original_end_time: new Date(now + 2 * day).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 62,
    current_winner_id: 2,
    winner_name: 'Agron M.',
    total_bids: 11,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 12 * hour).toISOString()
  },
  {
    id: 5,
    title: 'Kondicioner Inverter Midea Breezeless 12000 BTU A+++ me Wi-Fi',
    slug: 'kondicioner-inverter-midea-breezeless-12000-btu-a-plus-me-wi-fi',
    sku: 'ANK-MDA-12BR',
    description: 'Teknologji revolucionare me mikrovrimat TwinFlap që nuk fryjnë ajër të fortë direkt. Ngrohje efikase deri në -20°C, kontroll i plotë përmes aplikacionit në telefon.',
    category_id: 4,
    category_name: 'Pajisje Shtëpiake',
    category_slug: 'pajisje-shtepiake',
    condition_grade: 'A',
    condition_details: 'Klasa A (E re në paketim). Paketim i mbyllur me garancion të plotë nga importuesi.',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 195.00,
    starting_price: 60.00,
    current_price: 335.00,
    reserve_price: 320.00,
    buy_now_price: 430.00,
    min_bid_increment: 10,
    min_next_bid: 345.00,
    auction_start: new Date(now - day).toISOString(),
    auction_end: new Date(now + 3 * day).toISOString(),
    original_end_time: new Date(now + 3 * day).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 51,
    current_winner_id: 3,
    winner_name: 'Blerina K.',
    total_bids: 14,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - day).toISOString()
  },
  {
    id: 6,
    title: 'Set 4 Fellne Alumini Origjinale BMW M-Performance 19" (Styling 791M)',
    slug: 'set-4-fellne-alumini-bmw-m-performance-19',
    sku: 'ANK-BMW-791M',
    description: 'Set origjinal i përshtatshëm për BMW Seria 3 (G20/G21) dhe Seria 4 (G22/G23). Hapësira e vidave 5x112. Përfshijnë sensorët origjinalë të presionit TPMS.',
    category_id: 6,
    category_name: 'Pjesë Automjetesh',
    category_slug: 'pjese-automjetesh',
    condition_grade: 'B',
    condition_details: 'Klasa B. Drejtimi 100% i saktë, pa krisje ose saldime. Vetëm disa shenja të lehta trotuari.',
    images: [
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 310.00,
    starting_price: 120.00,
    current_price: 560.00,
    reserve_price: 550.00,
    buy_now_price: 780.00,
    min_bid_increment: 10,
    min_next_bid: 570.00,
    auction_start: new Date(now - day).toISOString(),
    auction_end: new Date(now + 18 * hour).toISOString(),
    original_end_time: new Date(now + 18 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 73,
    current_winner_id: 4,
    winner_name: 'Dardan G.',
    total_bids: 20,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - day).toISOString()
  },
  {
    id: 7,
    title: 'Orë Automatike Japoneze Seiko Prospex "Turtle" 200m Diver',
    slug: 'ore-automatike-seiko-prospex-turtle-200m-diver',
    sku: 'ANK-SEI-TRTL',
    description: 'Orë legjendare e zhytësve profesionalë rezistente ndaj ujit deri në 200 metra. Rrip silikoni origjinal Seiko, numërues me ndriçim Lumibrite që shkëlqen fort në errësirë.',
    category_id: 7,
    category_name: 'Orë & Aksesorë',
    category_slug: 'ore-aksesore',
    condition_grade: 'A',
    condition_details: 'Klasa A. Përdorur vetëm disa herë. Xhami pa asnjë mikrovijë, mekanizmi 4R36 punon me saktësi kronometri.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 135.00,
    starting_price: 50.00,
    current_price: 255.00,
    reserve_price: 240.00,
    buy_now_price: 360.00,
    min_bid_increment: 5,
    min_next_bid: 260.00,
    auction_start: new Date(now - 8 * hour).toISOString(),
    auction_end: new Date(now + 28 * hour).toISOString(),
    original_end_time: new Date(now + 28 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 38,
    current_winner_id: 2,
    winner_name: 'Agron M.',
    total_bids: 16,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 8 * hour).toISOString()
  },
  {
    id: 8,
    title: 'Fshesë Robot me Larje me Ujë Roborock S8 Pro Ultra',
    slug: 'fshese-robot-roborock-s8-pro-ultra',
    sku: 'ANK-ROB-S8PU',
    description: 'Fshesa më e avancuar me fuqi thithëse 6000Pa, furça të dyfishta gome dhe larje të leckës me ajër të nxehtë. Navigim LiDAR me shmangie të zgjuar të pengesave 3D.',
    category_id: 4,
    category_name: 'Pajisje Shtëpiake',
    category_slug: 'pajisje-shtepiake',
    condition_grade: 'A',
    condition_details: 'Klasa A. Stacioni i pastrimit automatik i plotë me shishet e ujit të pastër dhe të ndotur.',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 290.00,
    starting_price: 100.00,
    current_price: 490.00,
    reserve_price: 480.00,
    buy_now_price: 680.00,
    min_bid_increment: 10,
    min_next_bid: 500.00,
    auction_start: new Date(now - 14 * hour).toISOString(),
    auction_end: new Date(now + 36 * hour).toISOString(),
    original_end_time: new Date(now + 36 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 22,
    current_winner_id: 3,
    winner_name: 'Blerina K.',
    total_bids: 19,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 14 * hour).toISOString()
  }
];

export function filterDemoAuctions(params: {
  search?: string;
  category?: string;
  condition?: string;
  buy_now?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  let list = [...DEMO_PRODUCTS];

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }

  if (params.category) {
    list = list.filter(p => p.category_slug === params.category || String(p.category_id) === params.category);
  }

  if (params.condition) {
    list = list.filter(p => p.condition_grade === params.condition);
  }

  if (params.buy_now === '1') {
    list = list.filter(p => p.buy_now_price !== null && p.buy_now_price !== undefined);
  }

  if (params.sort === 'price_asc') {
    list.sort((a, b) => a.current_price - b.current_price);
  } else if (params.sort === 'price_desc') {
    list.sort((a, b) => b.current_price - a.current_price);
  } else if (params.sort === 'bids') {
    list.sort((a, b) => b.total_bids - a.total_bids);
  } else if (params.sort === 'ending_soon') {
    list.sort((a, b) => new Date(a.auction_end).getTime() - new Date(b.auction_end).getTime());
  }

  const page = params.page || 1;
  const limit = params.limit || 12;
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;
  const paged = list.slice(offset, offset + limit);

  return {
    data: paged,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  };
}

// User Profiles
export const DEMO_ADMIN_USER: User = {
  id: 1,
  email: 'admin@ankandet.al',
  full_name: 'Administratori Kryesor',
  phone: '+38344111222',
  role: 'admin',
  city: 'Prishtinë',
  address: 'Rruga Nënë Tereza 14',
  status: 'active',
  created_at: new Date(now - 30 * day).toISOString()
};

export const DEMO_BUYER_USER: User = {
  id: 2,
  email: 'agron.m@gmail.com',
  full_name: 'Agron Morina',
  phone: '+38349223344',
  role: 'buyer',
  city: 'Prishtinë',
  address: 'Dardania, Blloku 4',
  status: 'active',
  created_at: new Date(now - 15 * day).toISOString()
};

export const DEMO_USERS: User[] = [
  DEMO_ADMIN_USER,
  DEMO_BUYER_USER,
  { id: 3, email: 'blerina.k@gmail.com', full_name: 'Blerina Krasniqi', phone: '+38345334455', role: 'buyer', city: 'Prizren', address: 'Shadërvan Nr. 8', status: 'active', created_at: new Date(now - 10 * day).toISOString() },
  { id: 4, email: 'dardan.g@gmail.com', full_name: 'Dardan Gashi', phone: '+38344556677', role: 'buyer', city: 'Pejë', address: 'Rruga Mbretëresha Teutë', status: 'active', created_at: new Date(now - 5 * day).toISOString() }
];

export const DEMO_ORDERS: Order[] = [
  {
    id: 1,
    order_number: 'ORD-2026-001',
    user_id: 2,
    product_id: 1,
    product_title: 'Apple iPhone 15 Pro Max 256GB',
    product_sku: 'ANK-APL-15PM',
    product_images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80'],
    buyer_name: 'Agron Morina',
    buyer_email: 'agron.m@gmail.com',
    cost_price: 450,
    final_price: 890,
    shipping_fee: 3,
    total_amount: 893,
    payment_method: 'cash_on_delivery',
    payment_status: 'paid',
    order_status: 'delivered',
    shipping_name: 'Agron Morina',
    shipping_phone: '+38349223344',
    shipping_city: 'Prishtinë',
    shipping_address: 'Dardania, Blloku 4',
    tracking_number: 'POSTA-KS-88219',
    created_at: new Date(now - 2 * day).toISOString()
  },
  {
    id: 2,
    order_number: 'ORD-2026-002',
    user_id: 3,
    product_id: 2,
    product_title: 'Sony PlayStation 5 Slim Edition',
    product_sku: 'ANK-SNY-PS5S',
    product_images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80'],
    buyer_name: 'Blerina Krasniqi',
    buyer_email: 'blerina.k@gmail.com',
    cost_price: 240,
    final_price: 410,
    shipping_fee: 3,
    total_amount: 413,
    payment_method: 'card',
    payment_status: 'paid',
    order_status: 'shipped',
    shipping_name: 'Blerina Krasniqi',
    shipping_phone: '+38345334455',
    shipping_city: 'Prizren',
    shipping_address: 'Shadërvan Nr. 8',
    tracking_number: 'POSTA-KS-99120',
    created_at: new Date(now - day).toISOString()
  }
];

export const DEMO_EXPENSES: Expense[] = [
  { id: 1, category: 'dogana', title: 'Zhboganimi i Kontingjentit #1 të Pajisjeve', amount: 2450, expense_date: '2026-11-01', notes: 'Dogana e Kosovës', created_at: new Date(now - 15 * day).toISOString() },
  { id: 2, category: 'transport', title: 'Transporti Ndërkombëtar me Kamion (Gjermani - Kosovë)', amount: 1800, expense_date: '2026-11-02', notes: 'Transporti i artikujve', created_at: new Date(now - 14 * day).toISOString() },
  { id: 3, category: 'operim', title: 'Qiraja dhe Mirëmbajtja e Magazinës në Fushë Kosovë', amount: 850, expense_date: '2026-11-05', notes: 'Hapësira 450m2', created_at: new Date(now - 11 * day).toISOString() },
  { id: 4, category: 'marketing', title: 'Fushata e Marketingut në Facebook & Instagram', amount: 450, expense_date: '2026-11-08', notes: 'Target Kosovë', created_at: new Date(now - 8 * day).toISOString() },
  { id: 5, category: 'paketim', title: 'Kuti Kartoni dhe Material Mbrojtës', amount: 280, expense_date: '2026-11-10', notes: 'Paketim i sigurt', created_at: new Date(now - 6 * day).toISOString() }
];

export const DEMO_ADMIN_METRICS: AdminMetrics = {
  totalAuctions: 8,
  activeAuctions: 6,
  soldAuctions: 2,
  totalBids: 137,
  totalUsers: 48,
  totalOrders: 14,
  pendingOrders: 2,
  completedOrders: 12,
  newCustomersToday: 5,
  todaySales: { revenue: 1300, orders: 2 },
  weekSales: { revenue: 5840, orders: 8 },
  monthSales: { revenue: 18450, orders: 26 },
  totalRevenue: 18450,
  grossProfit: 7850,
  netProfit: 2020,
  unreadAlerts: 3
};

export const DEMO_FINANCIALS: FinancialData = {
  initialInvestment: 31000,
  exchangeRate: 100,
  totalRevenue: 18450,
  cogs: 10600,
  grossProfit: 7850,
  totalExpenses: 5830,
  netProfit: 2020,
  profitMarginPct: 10.95,
  lockedCapitalWarehouse: 18500,
  retailValueWarehouse: 29400,
  unsoldProductsCount: 16,
  breakEvenProgress: 59.5,
  expensesByCategory: [
    { category: 'dogana', total: 2450, count: 1 },
    { category: 'transport', total: 1800, count: 1 },
    { category: 'operim', total: 850, count: 1 },
    { category: 'marketing', total: 450, count: 1 },
    { category: 'paketim', total: 280, count: 1 }
  ]
};

export const DEMO_DAILY_CHART: DailyChartPoint[] = [
  { date: '10 Nën', published: 4, sold: 1, revenue: 499, profit: 259 },
  { date: '11 Nën', published: 6, sold: 2, revenue: 1300, profit: 610 },
  { date: '12 Nën', published: 3, sold: 1, revenue: 760, profit: 180 },
  { date: '13 Nën', published: 5, sold: 3, revenue: 1850, profit: 890 },
  { date: '14 Nën', published: 8, sold: 4, revenue: 2450, profit: 1120 },
  { date: '15 Nën', published: 4, sold: 2, revenue: 1250, profit: 540 },
  { date: '16 Nën', published: 5, sold: 3, revenue: 1780, profit: 790 }
];

export const DEMO_SALES_ANALYTICS: SalesAnalytics = {
  topProducts: [
    { id: 1, title: 'Apple iPhone 15 Pro Max 256GB', sku: 'ANK-APL-15PM', category_name: 'Telefonë & Smart', units_sold: 4, total_revenue: 3560, total_profit: 1760 },
    { id: 2, title: 'Sony PlayStation 5 Slim 1TB', sku: 'ANK-SNY-PS5S', category_name: 'Elektronikë & TV', units_sold: 5, total_revenue: 2495, total_profit: 1295 },
    { id: 3, title: 'MacBook Air 15" M2', sku: 'ANK-MAC-15M2', category_name: 'Laptopë & IT', units_sold: 2, total_revenue: 2100, total_profit: 940 }
  ],
  topCategories: [
    { id: 2, name: 'Telefonë & Smart', total_products: 4, total_sales: 6, total_revenue: 5200, total_bids_placed: 45 },
    { id: 1, name: 'Elektronikë & TV', total_products: 3, total_sales: 5, total_revenue: 3100, total_bids_placed: 38 },
    { id: 3, name: 'Laptopë & IT', total_products: 2, total_sales: 3, total_revenue: 2850, total_bids_placed: 29 }
  ],
  averageOrderValue: 461.25,
  totalSoldUnits: 14,
  traffic: {
    totalViews: 980,
    totalBids: 137,
    totalOrders: 14,
    conversionRateViewsToSale: 1.43,
    conversionRateBidsToSale: 10.22
  },
  deadStock: []
};

export const DEMO_INVENTORY: InventorySummary = {
  totalProducts: 24,
  publishedProducts: 8,
  soldProducts: 4,
  warehouseProducts: 12,
  lockedCost: 18500,
  retailValuation: 29400,
  categoryStock: [
    { id: 2, name: 'Telefonë & Smart', total_items: 8, active_items: 4, sold_items: 2, capital_locked: 5800 },
    { id: 1, name: 'Elektronikë & TV', total_items: 6, active_items: 3, sold_items: 2, capital_locked: 4200 },
    { id: 3, name: 'Laptopë & IT', total_items: 4, active_items: 2, sold_items: 0, capital_locked: 3900 },
    { id: 4, name: 'Pajisje Shtëpiake', total_items: 6, active_items: 3, sold_items: 0, capital_locked: 4600 }
  ]
};

export const DEMO_NOTIFICATIONS: AdminNotification[] = [
  { id: 1, type: 'product_sold', title: 'Artikull i Shitur', message: 'Apple iPhone 15 Pro Max u shit me opsionin Bli Tani për 890 €', severity: 'success', is_read: 0, created_at: new Date(now - 30 * 60 * 1000).toISOString() },
  { id: 2, type: 'auction_ended', title: 'Ankandi Përfundoi', message: 'Sony PS5 Slim përfundoi me çmimin fitues 410 €', severity: 'info', is_read: 0, created_at: new Date(now - 2 * hour).toISOString() },
  { id: 3, type: 'high_views_no_bids', title: 'Shikueshmëri e Lartë', message: 'MacBook Air 15" ka arritur 85 shikime në 12 orë', severity: 'warning', is_read: 0, created_at: new Date(now - 5 * hour).toISOString() }
];

export const DEMO_LOGS: ActivityLog[] = [
  { id: 1, action: 'BUY_NOW_EXECUTE', entity_type: 'orders', entity_id: 1, details: 'Blerje e menjëhershme: iPhone 15 Pro Max', ip_address: '192.168.1.1', user_name: 'Agron Morina', user_email: 'agron.m@gmail.com', created_at: new Date(now - 30 * 60 * 1000).toISOString() },
  { id: 2, action: 'BID_PLACED', entity_type: 'auctions', entity_id: 2, details: 'Ofertë 410 € nga Blerina K.', ip_address: '192.168.1.2', user_name: 'Blerina Krasniqi', user_email: 'blerina.k@gmail.com', created_at: new Date(now - 2 * hour).toISOString() },
  { id: 3, action: 'ADMIN_LOGIN', entity_type: 'auth', details: 'Kyçje në sistem nga paneli administrativ', ip_address: '127.0.0.1', user_name: 'Administratori Kryesor', user_email: 'admin@ankandet.al', created_at: new Date(now - 3 * hour).toISOString() }
];
