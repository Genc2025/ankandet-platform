import { Category, Product } from './types';

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
    views_count: 120,
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
    views_count: 120,
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
    views_count: 120,
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
    views_count: 120,
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
    views_count: 120,
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
    views_count: 120,
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
    views_count: 120,
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
    views_count: 120,
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
