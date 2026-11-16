import { 
  Category, Product, User, Order, Expense, FinancialData, 
  DailyChartPoint, SalesAnalytics, InventorySummary, AdminNotification, 
  ActivityLog, AdminMetrics 
} from './types';

export const DEMO_CATEGORIES: Category[] = [
  { id: 1, name: 'Elektronikë & TV', slug: 'elektronike-tv', icon: 'Tv', description: 'Televizorë inteligjentë, sisteme audio, pajisje argëtuese', active_count: 4 },
  { id: 2, name: 'Telefonë & Smart', slug: 'telefone-smart', icon: 'Smartphone', description: 'Smartphones, tabletë, orë inteligjente dhe aksesorë', active_count: 5 },
  { id: 3, name: 'Laptopë & IT', slug: 'laptope-it', icon: 'Laptop', description: 'Laptopë gaming, pajisje zyre, monitorë', active_count: 3 },
  { id: 4, name: 'Pajisje Shtëpiake', slug: 'pajisje-shtepiake', icon: 'Home', description: 'Kondicionerë, fritezë, lavatriçe, aparate kafeje', active_count: 4 },
  { id: 5, name: 'Vegla Pune & Makineri', slug: 'vegla-pune-makineri', icon: 'Wrench', description: 'Trapanë, prerëse këndore, gjeneratorë', active_count: 3 },
  { id: 6, name: 'Pjesë Automjetesh', slug: 'pjese-automjetesh', icon: 'Car', description: 'Fellne alumini, goma, fenerë LED, vajra', active_count: 3 },
  { id: 7, name: 'Orë & Aksesorë', slug: 'ore-aksesore', icon: 'Watch', description: 'Orë automatike zvicerane, syze dielli, kuleta', active_count: 2 },
];

const now = Date.now();
const hour = 3600 * 1000;
const day = 24 * hour;

export const DEMO_PRODUCTS: Product[] = [
  // 1
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
  // 2
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
  // 3
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
  // 4
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
  // 5
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
  // 6
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
  // 7
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
  // 8
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
  },
  // 9
  {
    id: 9,
    title: 'Samsung Galaxy S24 Ultra 512GB - Titanium Gray (Snapdragon 8 Gen 3)',
    slug: 'samsung-galaxy-s24-ultra-512gb-titanium-gray',
    sku: 'ANK-SAM-S24U',
    description: 'Flagship i Samsung me ekran të sheshtë Dynamic AMOLED 2X 120Hz, Galaxy AI të integruar, trup titani dhe lapsin S-Pen. Bateri 5000mAh me karikim ultra të shpejtë.',
    category_id: 2,
    category_name: 'Telefonë & Smart',
    category_slug: 'telefone-smart',
    condition_grade: 'A',
    condition_details: 'Klasa A (Paketim i mbyllur origjinal). Garancion 1 vit nga qendra e autorizuar.',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 520.00,
    starting_price: 180.00,
    current_price: 740.00,
    reserve_price: 700.00,
    buy_now_price: 950.00,
    min_bid_increment: 10,
    min_next_bid: 750.00,
    auction_start: new Date(now - 6 * hour).toISOString(),
    auction_end: new Date(now + 2 * day + 6 * hour).toISOString(),
    original_end_time: new Date(now + 2 * day + 6 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 115,
    current_winner_id: 4,
    winner_name: 'Dardan G.',
    total_bids: 21,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 6 * hour).toISOString()
  },
  // 10
  {
    id: 10,
    title: 'Smart TV Samsung 65" Neo QLED 4K (QN90C) 144Hz me Gaming Hub',
    slug: 'smart-tv-samsung-65-neo-qled-4k-qn90c',
    sku: 'ANK-SAM-65QLED',
    description: 'Televizor premium me Quantum Mini LED për kontrast të thellë, procesor Neural Quantum 4K dhe frekuencë freskimi 144Hz. Ideale për filma dhe konzola PS5 / Xbox.',
    category_id: 1,
    category_name: 'Elektronikë & TV',
    category_slug: 'elektronike-tv',
    condition_grade: 'A',
    condition_details: 'Klasa A (Paketim i ri i hapur vetëm për testim paneli). Zero dead-pixel.',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 430.00,
    starting_price: 150.00,
    current_price: 620.00,
    reserve_price: 590.00,
    buy_now_price: 820.00,
    min_bid_increment: 15,
    min_next_bid: 635.00,
    auction_start: new Date(now - 18 * hour).toISOString(),
    auction_end: new Date(now + 1 * day + 14 * hour).toISOString(),
    original_end_time: new Date(now + 1 * day + 14 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 88,
    current_winner_id: 2,
    winner_name: 'Agron M.',
    total_bids: 13,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 18 * hour).toISOString()
  },
  // 11
  {
    id: 11,
    title: 'Dron DJI Mini 4 Pro Fly More Combo (me Telekomandë DJI RC 2 me Ekran)',
    slug: 'dron-dji-mini-4-pro-fly-more-combo',
    sku: 'ANK-DJI-M4P',
    description: 'Pesha nën 249g pa nevojë regjistrimi, sensorë shmangieje pengesash 360°, xhirim video vertikale 4K 60fps HDR për TikTok/Reels dhe transmetim video O4 deri në 20km.',
    category_id: 1,
    category_name: 'Elektronikë & TV',
    category_slug: 'elektronike-tv',
    condition_grade: 'A',
    condition_details: 'Klasa A. Përfshin 3 bateri origjinale, çantë transporti, telekomandë me ekran dhe helika rezervë.',
    images: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 380.00,
    starting_price: 130.00,
    current_price: 540.00,
    reserve_price: 510.00,
    buy_now_price: 720.00,
    min_bid_increment: 10,
    min_next_bid: 550.00,
    auction_start: new Date(now - 10 * hour).toISOString(),
    auction_end: new Date(now + 2 * day + 2 * hour).toISOString(),
    original_end_time: new Date(now + 2 * day + 2 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 104,
    current_winner_id: 3,
    winner_name: 'Blerina K.',
    total_bids: 17,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 10 * hour).toISOString()
  },
  // 12
  {
    id: 12,
    title: 'Laptop Gaming ASUS ROG Zephyrus G14 (Ryzen 9, RTX 4060, 32GB RAM, 1TB)',
    slug: 'laptop-gaming-asus-rog-zephyrus-g14',
    sku: 'ANK-ASU-G14',
    description: 'Përbindësh kompakt gaming me ekran 14" ROG Nebula OLED 120Hz 3K, kartë grafike NVIDIA RTX 4060 8GB dhe trup alumini të lehtë. Ideale për arkitekturë, render dhe lojëra.',
    category_id: 3,
    category_name: 'Laptopë & IT',
    category_slug: 'laptope-it',
    condition_grade: 'A',
    condition_details: 'Klasa A (Paketim origjinal). Karikues 240W dhe kuti origjinale.',
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 620.00,
    starting_price: 220.00,
    current_price: 890.00,
    reserve_price: 850.00,
    buy_now_price: 1190.00,
    min_bid_increment: 20,
    min_next_bid: 910.00,
    auction_start: new Date(now - 20 * hour).toISOString(),
    auction_end: new Date(now + 3 * day + 4 * hour).toISOString(),
    original_end_time: new Date(now + 3 * day + 4 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 132,
    current_winner_id: 4,
    winner_name: 'Dardan G.',
    total_bids: 26,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 20 * hour).toISOString()
  },
  // 13
  {
    id: 13,
    title: 'Apple Watch Ultra 2 49mm Titanium me Rrip Portokalli Ocean Band',
    slug: 'apple-watch-ultra-2-49mm-titanium',
    sku: 'ANK-APL-WULT2',
    description: 'Ora më rezistente e Apple me trup titani të klasit aeronautik, ekran ultra të ndritshëm 3000 nits, GPS me frekuencë të dyfishtë dhe thellësi-matës për zhytje deri në 40m.',
    category_id: 7,
    category_name: 'Orë & Aksesorë',
    category_slug: 'ore-aksesore',
    condition_grade: 'A',
    condition_details: 'Klasa A. Shëndeti i baterisë 100%, vjen me karikues magnetik të shpejtë të thurur me pëlhurë.',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 290.00,
    starting_price: 110.00,
    current_price: 470.00,
    reserve_price: 450.00,
    buy_now_price: 620.00,
    min_bid_increment: 10,
    min_next_bid: 480.00,
    auction_start: new Date(now - 5 * hour).toISOString(),
    auction_end: new Date(now + 1 * day + 20 * hour).toISOString(),
    original_end_time: new Date(now + 1 * day + 20 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 79,
    current_winner_id: 2,
    winner_name: 'Agron M.',
    total_bids: 18,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 5 * hour).toISOString()
  },
  // 14
  {
    id: 14,
    title: 'Prerëse Këndore me Bateri DeWalt DCG405N 18V XR Brushless 125mm',
    slug: 'prerese-kendore-dewalt-dcg405n-18v-xr',
    sku: 'ANK-DWT-18VFLX',
    description: 'Flex profesional me motor pa furça (Brushless) 18V, fren elektronik që ndalon diskun në më pak se 2 sekonda dhe mbrojtje nga pluhurat me rrjetë çeliku të lëvizshme.',
    category_id: 5,
    category_name: 'Vegla Pune & Makineri',
    category_slug: 'vegla-pune-makineri',
    condition_grade: 'A',
    condition_details: 'Klasa A (Paketim i ri). Vjen me dorezë anësore antivibrim dhe çelës ndërrimi disku.',
    images: [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 65.00,
    starting_price: 25.00,
    current_price: 115.00,
    reserve_price: 100.00,
    buy_now_price: 160.00,
    min_bid_increment: 5,
    min_next_bid: 120.00,
    auction_start: new Date(now - 16 * hour).toISOString(),
    auction_end: new Date(now + 2 * day + 8 * hour).toISOString(),
    original_end_time: new Date(now + 2 * day + 8 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 47,
    current_winner_id: 3,
    winner_name: 'Blerina K.',
    total_bids: 12,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 16 * hour).toISOString()
  },
  // 15
  {
    id: 15,
    title: 'Aparat Kafeje Automatik DeLonghi Magnifica S me Shkumues Qumështi',
    slug: 'aparat-kafeje-delonghi-magnifica-s',
    sku: 'ANK-DLN-MAGS',
    description: 'Aparat automatik i kafesë me mulli çeliku me 13 nivele bluarjeje, sistem ngrohjeje Thermoblock për temperaturë ideale dhe tub avulli për kapuçino kremor.',
    category_id: 4,
    category_name: 'Pajisje Shtëpiake',
    category_slug: 'pajisje-shtepiake',
    condition_grade: 'A',
    condition_details: 'Klasa A. Përdorur shumë pak në zyrë, kryer pastrimi i plotë nga gëlqerja me set DeLonghi.',
    images: [
      'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 110.00,
    starting_price: 45.00,
    current_price: 195.00,
    reserve_price: 180.00,
    buy_now_price: 280.00,
    min_bid_increment: 5,
    min_next_bid: 200.00,
    auction_start: new Date(now - 7 * hour).toISOString(),
    auction_end: new Date(now + 1 * day + 8 * hour).toISOString(),
    original_end_time: new Date(now + 1 * day + 8 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 64,
    current_winner_id: 4,
    winner_name: 'Dardan G.',
    total_bids: 15,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 7 * hour).toISOString()
  },
  // 16
  {
    id: 16,
    title: 'Set Fenerësh Origjinalë HD Matrix LED për Audi A6 C8 (2019-2023)',
    slug: 'set-feneresh-audi-a6-c8-matrix-led',
    sku: 'ANK-AUD-A6C8M',
    description: 'Fenerë origjinalë të plotë majtas dhe djathtas me module kontrolli dhe drita dinamike vrapuese sinjalizimi. Pa asnjë këmbë të thyer apo gërvishtje në xham.',
    category_id: 6,
    category_name: 'Pjesë Automjetesh',
    category_slug: 'pjese-automjetesh',
    condition_grade: 'A',
    condition_details: 'Klasa A (Origjinal OEM Audi). Të gjitha llampat dhe LED-at janë testuar 100%.',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 360.00,
    starting_price: 150.00,
    current_price: 680.00,
    reserve_price: 650.00,
    buy_now_price: 920.00,
    min_bid_increment: 15,
    min_next_bid: 695.00,
    auction_start: new Date(now - 22 * hour).toISOString(),
    auction_end: new Date(now + 2 * day + 16 * hour).toISOString(),
    original_end_time: new Date(now + 2 * day + 16 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 81,
    current_winner_id: 2,
    winner_name: 'Agron M.',
    total_bids: 23,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 22 * hour).toISOString()
  },
  // 17
  {
    id: 17,
    title: 'Apple iPad Pro 12.9" M2 128GB Wi-Fi Space Gray (Liquid Retina XDR)',
    slug: 'apple-ipad-pro-12-9-m2-128gb',
    sku: 'ANK-APL-IPD12',
    description: 'Ekrani më i fuqishëm me Mini-LED Liquid Retina XDR me 1600 nits pik, procesor M2, mbështetje për Apple Pencil Hover dhe Face ID të shpejtë.',
    category_id: 2,
    category_name: 'Telefonë & Smart',
    category_slug: 'telefone-smart',
    condition_grade: 'A',
    condition_details: 'Klasa A (Si i ri në kuti). Bateri 98%.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 320.00,
    starting_price: 120.00,
    current_price: 580.00,
    reserve_price: 550.00,
    buy_now_price: 790.00,
    min_bid_increment: 10,
    min_next_bid: 590.00,
    auction_start: new Date(now - 15 * hour).toISOString(),
    auction_end: new Date(now + 1 * day + 6 * hour).toISOString(),
    original_end_time: new Date(now + 1 * day + 6 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 92,
    current_winner_id: 3,
    winner_name: 'Blerina K.',
    total_bids: 17,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 15 * hour).toISOString()
  },
  // 18
  {
    id: 18,
    title: 'Kufje me Anulim Zhurme Sony WH-1000XM5 Wireless Noise Cancelling',
    slug: 'kufje-sony-wh-1000xm5-wireless',
    sku: 'ANK-SNY-XM5',
    description: 'Mbreti i anulimit të zhurmës me 8 mikrofona, procesor të integruar V1 dhe QN1, mbështetje Hi-Res Audio Wireless LDAC dhe jetëgjatësi baterie deri në 30 orë.',
    category_id: 1,
    category_name: 'Elektronikë & TV',
    category_slug: 'elektronike-tv',
    condition_grade: 'A',
    condition_details: 'Klasa A. Valixhe origjinale, kabllo audio 3.5mm dhe kabllo karikimi.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 95.00,
    starting_price: 40.00,
    current_price: 185.00,
    reserve_price: 170.00,
    buy_now_price: 260.00,
    min_bid_increment: 5,
    min_next_bid: 190.00,
    auction_start: new Date(now - 9 * hour).toISOString(),
    auction_end: new Date(now + 18 * hour).toISOString(),
    original_end_time: new Date(now + 18 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 76,
    current_winner_id: 4,
    winner_name: 'Dardan G.',
    total_bids: 14,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 9 * hour).toISOString()
  },
  // 19
  {
    id: 19,
    title: 'Monitor Gaming i Lakuar Dell Alienware 34" QD-OLED 175Hz (AW3423DWF)',
    slug: 'monitor-gaming-dell-alienware-34-qd-oled',
    sku: 'ANK-DEL-AW34',
    description: 'Teknologji Quantum Dot OLED me ngjyra të thella të pafundme, kohë përgjigjeje 0.1ms dhe rezolucion WQHD 3440x1440 me mbështetje AMD FreeSync Premium Pro.',
    category_id: 3,
    category_name: 'Laptopë & IT',
    category_slug: 'laptope-it',
    condition_grade: 'A',
    condition_details: 'Klasa A (Si i ri në kuti). Asnjë shenjë përdorimi, zero burn-in.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 280.00,
    starting_price: 100.00,
    current_price: 520.00,
    reserve_price: 490.00,
    buy_now_price: 710.00,
    min_bid_increment: 10,
    min_next_bid: 530.00,
    auction_start: new Date(now - 14 * hour).toISOString(),
    auction_end: new Date(now + 2 * day + 12 * hour).toISOString(),
    original_end_time: new Date(now + 2 * day + 12 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 68,
    current_winner_id: 2,
    winner_name: 'Agron M.',
    total_bids: 16,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 14 * hour).toISOString()
  },
  // 20
  {
    id: 20,
    title: 'Gjenerator me Benzinë Inverter Honda EU22i 2.2kW Ultra i Qetë',
    slug: 'gjenerator-inverter-honda-eu22i',
    sku: 'ANK-HND-EU22',
    description: 'Gjeneratori më i besueshëm japonez me rrymë të pastër sinusoidale të sigurt për kompjuterë e pajisje elektronike. Konsum minimal dhe zhurmë vetëm 48dB.',
    category_id: 5,
    category_name: 'Vegla Pune & Makineri',
    category_slug: 'vegla-pune-makineri',
    condition_grade: 'A',
    condition_details: 'Klasa A (I papërdorur me vaj origjinal Honda).',
    images: [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 350.00,
    starting_price: 140.00,
    current_price: 650.00,
    reserve_price: 600.00,
    buy_now_price: 890.00,
    min_bid_increment: 15,
    min_next_bid: 665.00,
    auction_start: new Date(now - 11 * hour).toISOString(),
    auction_end: new Date(now + 3 * day).toISOString(),
    original_end_time: new Date(now + 3 * day).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 53,
    current_winner_id: 3,
    winner_name: 'Blerina K.',
    total_bids: 15,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 11 * hour).toISOString()
  },
  // 21
  {
    id: 21,
    title: 'Fritezë me Ajër të Nxehtë Philips Airfryer XXL me Teknologji Fat Removal',
    slug: 'friteze-me-ajer-philips-airfryer-xxl',
    sku: 'ANK-PHL-XXL',
    description: 'Kapacitet i madh 1.4kg / 7.2L për përgatitjen e vakteve familjare me 90% më pak yndyrë. 5 programe të paracaktuara gatimi me ekran dixhital me prekje.',
    category_id: 4,
    category_name: 'Pajisje Shtëpiake',
    category_slug: 'pajisje-shtepiake',
    condition_grade: 'A',
    condition_details: 'Klasa A (Paketim i mbyllur me libër recetash).',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 60.00,
    starting_price: 25.00,
    current_price: 110.00,
    reserve_price: 95.00,
    buy_now_price: 165.00,
    min_bid_increment: 5,
    min_next_bid: 115.00,
    auction_start: new Date(now - 8 * hour).toISOString(),
    auction_end: new Date(now + 1 * day + 18 * hour).toISOString(),
    original_end_time: new Date(now + 1 * day + 18 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 42,
    current_winner_id: 4,
    winner_name: 'Dardan G.',
    total_bids: 11,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 8 * hour).toISOString()
  },
  // 22
  {
    id: 22,
    title: 'Timon Sportiv Origjinal me Butona Touch & Airbag për VW Golf 8 R-Line',
    slug: 'timon-sportiv-vw-golf-8-r-line',
    sku: 'ANK-VW-G8RL',
    description: 'Timon origjinal me lëkurë të perforuar, qepje ngjyrë blu, butona haptikë touch dhe airbag origjinal të përfshirë. Përshtatet me Golf 8, Tiguan dhe Passat B8.',
    category_id: 6,
    category_name: 'Pjesë Automjetesh',
    category_slug: 'pjese-automjetesh',
    condition_grade: 'A',
    condition_details: 'Klasa A (I hequr nga makina testuese me 4,000km). Gjendje perfekte.',
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 160.00,
    starting_price: 70.00,
    current_price: 310.00,
    reserve_price: 290.00,
    buy_now_price: 440.00,
    min_bid_increment: 10,
    min_next_bid: 320.00,
    auction_start: new Date(now - 17 * hour).toISOString(),
    auction_end: new Date(now + 2 * day + 10 * hour).toISOString(),
    original_end_time: new Date(now + 2 * day + 10 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 61,
    current_winner_id: 2,
    winner_name: 'Agron M.',
    total_bids: 14,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 17 * hour).toISOString()
  },
  // 23
  {
    id: 23,
    title: 'Orë Zvicerane Tissot PRX Powermatic 80 Blue Dial (40mm)',
    slug: 'ore-zvicerane-tissot-prx-powermatic-80',
    sku: 'ANK-TIS-PRX80',
    description: 'Ikona e dizajnit të viteve 70 me mekanizëm automatik Powermatic 80 që ofron 80 orë rezervë fuqie. Numërues blu me teksturë waffle dhe xham safiri rezistent ndaj gërvishtjeve.',
    category_id: 7,
    category_name: 'Orë & Aksesorë',
    category_slug: 'ore-aksesore',
    condition_grade: 'A',
    condition_details: 'Klasa A (Vjen me kuti origjinale dhe kartë garancioni ndërkombëtare).',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 210.00,
    starting_price: 90.00,
    current_price: 390.00,
    reserve_price: 370.00,
    buy_now_price: 540.00,
    min_bid_increment: 10,
    min_next_bid: 400.00,
    auction_start: new Date(now - 12 * hour).toISOString(),
    auction_end: new Date(now + 2 * day + 15 * hour).toISOString(),
    original_end_time: new Date(now + 2 * day + 15 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 75,
    current_winner_id: 3,
    winner_name: 'Blerina K.',
    total_bids: 18,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 12 * hour).toISOString()
  },
  // 24
  {
    id: 24,
    title: 'Tablet Samsung Galaxy Tab S9 Ultra 256GB me Laps S-Pen & Tastierë',
    slug: 'samsung-galaxy-tab-s9-ultra-256gb',
    sku: 'ANK-SAM-TS9U',
    description: 'Ekrani gjigant 14.6" Dynamic AMOLED 2X me 120Hz, rezistencë ndaj ujit dhe pluhurit IP68 dhe procesor Snapdragon 8 Gen 2 for Galaxy. Përfshin lapsin S-Pen me vonesë ultra të ulët.',
    category_id: 2,
    category_name: 'Telefonë & Smart',
    category_slug: 'telefone-smart',
    condition_grade: 'A',
    condition_details: 'Klasa A. Përdorur vetëm për lexim dokumentesh, bateria 99%.',
    images: [
      'https://images.unsplash.com/photo-1585792180666-f75a7c518801?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'
    ],
    cost_price: 290.00,
    starting_price: 110.00,
    current_price: 510.00,
    reserve_price: 490.00,
    buy_now_price: 690.00,
    min_bid_increment: 10,
    min_next_bid: 520.00,
    auction_start: new Date(now - 19 * hour).toISOString(),
    auction_end: new Date(now + 3 * day + 8 * hour).toISOString(),
    original_end_time: new Date(now + 3 * day + 8 * hour).toISOString(),
    anti_snip_minutes: 2,
    anti_snip_extension: 3,
    anti_snip_count: 0,
    views_count: 83,
    current_winner_id: 4,
    winner_name: 'Dardan G.',
    total_bids: 16,
    reserve_met: true,
    status: 'active',
    created_at: new Date(now - 19 * hour).toISOString()
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
  const limit = params.limit || 24;
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
  totalAuctions: 24,
  activeAuctions: 24,
  soldAuctions: 6,
  totalBids: 385,
  totalUsers: 92,
  totalOrders: 32,
  pendingOrders: 4,
  completedOrders: 28,
  newCustomersToday: 8,
  todaySales: { revenue: 2150, orders: 4 },
  weekSales: { revenue: 11420, orders: 18 },
  monthSales: { revenue: 34850, orders: 58 },
  totalRevenue: 34850,
  grossProfit: 14820,
  netProfit: 8990,
  unreadAlerts: 3
};

export const DEMO_FINANCIALS: FinancialData = {
  initialInvestment: 31000,
  exchangeRate: 100,
  totalRevenue: 34850,
  cogs: 20030,
  grossProfit: 14820,
  totalExpenses: 5830,
  netProfit: 8990,
  profitMarginPct: 25.79,
  lockedCapitalWarehouse: 26800,
  retailValueWarehouse: 44500,
  unsoldProductsCount: 24,
  breakEvenProgress: 88.5,
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
  { date: '16 Nën', published: 6, sold: 5, revenue: 2980, profit: 1340 }
];

export const DEMO_SALES_ANALYTICS: SalesAnalytics = {
  topProducts: [
    { id: 1, title: 'Apple iPhone 15 Pro Max 256GB', sku: 'ANK-APL-15PM', category_name: 'Telefonë & Smart', units_sold: 6, total_revenue: 5340, total_profit: 2640 },
    { id: 12, title: 'ASUS ROG Zephyrus G14', sku: 'ANK-ASU-G14', category_name: 'Laptopë & IT', units_sold: 4, total_revenue: 4760, total_profit: 2280 },
    { id: 2, title: 'Sony PlayStation 5 Slim 1TB', sku: 'ANK-SNY-PS5S', category_name: 'Elektronikë & TV', units_sold: 8, total_revenue: 3992, total_profit: 2072 }
  ],
  topCategories: [
    { id: 2, name: 'Telefonë & Smart', total_products: 5, total_sales: 12, total_revenue: 9800, total_bids_placed: 92 },
    { id: 3, name: 'Laptopë & IT', total_products: 3, total_sales: 8, total_revenue: 7850, total_bids_placed: 68 },
    { id: 1, name: 'Elektronikë & TV', total_products: 4, total_sales: 9, total_revenue: 6200, total_bids_placed: 74 },
    { id: 5, name: 'Vegla Pune & Makineri', total_products: 3, total_sales: 5, total_revenue: 2950, total_bids_placed: 45 }
  ],
  averageOrderValue: 485.50,
  totalSoldUnits: 34,
  traffic: {
    totalViews: 1940,
    totalBids: 385,
    totalOrders: 32,
    conversionRateViewsToSale: 1.65,
    conversionRateBidsToSale: 8.31
  },
  deadStock: []
};

export const DEMO_INVENTORY: InventorySummary = {
  totalProducts: 48,
  publishedProducts: 24,
  soldProducts: 10,
  warehouseProducts: 24,
  lockedCost: 26800,
  retailValuation: 44500,
  categoryStock: [
    { id: 2, name: 'Telefonë & Smart', total_items: 12, active_items: 5, sold_items: 4, capital_locked: 8900 },
    { id: 1, name: 'Elektronikë & TV', total_items: 10, active_items: 4, sold_items: 3, capital_locked: 6400 },
    { id: 3, name: 'Laptopë & IT', total_items: 8, active_items: 3, sold_items: 2, capital_locked: 5800 },
    { id: 4, name: 'Pajisje Shtëpiake', total_items: 8, active_items: 4, sold_items: 1, capital_locked: 4200 },
    { id: 5, name: 'Vegla Pune & Makineri', total_items: 6, active_items: 3, sold_items: 0, capital_locked: 3200 },
    { id: 6, name: 'Pjesë Automjetesh', total_items: 4, active_items: 3, sold_items: 0, capital_locked: 2300 }
  ]
};

export const DEMO_NOTIFICATIONS: AdminNotification[] = [
  { id: 1, type: 'product_sold', title: 'Artikull i Shitur', message: 'Apple iPhone 15 Pro Max u shit me opsionin Bli Tani për 890 €', severity: 'success', is_read: 0, created_at: new Date(now - 15 * 60 * 1000).toISOString() },
  { id: 2, type: 'auction_ended', title: 'Ankandi Përfundoi', message: 'Sony PS5 Slim përfundoi me çmimin fitues 410 €', severity: 'info', is_read: 0, created_at: new Date(now - 1 * hour).toISOString() },
  { id: 3, type: 'high_views_no_bids', title: 'Shikueshmëri e Lartë', message: 'ASUS ROG Zephyrus G14 ka arritur 132 shikime', severity: 'warning', is_read: 0, created_at: new Date(now - 3 * hour).toISOString() }
];

export const DEMO_LOGS: ActivityLog[] = [
  { id: 1, action: 'BUY_NOW_EXECUTE', entity_type: 'orders', entity_id: 1, details: 'Blerje e menjëhershme: iPhone 15 Pro Max', ip_address: '192.168.1.1', user_name: 'Agron Morina', user_email: 'agron.m@gmail.com', created_at: new Date(now - 15 * 60 * 1000).toISOString() },
  { id: 2, action: 'BID_PLACED', entity_type: 'auctions', entity_id: 9, details: 'Ofertë 740 € nga Dardan G. për Samsung S24 Ultra', ip_address: '192.168.1.4', user_name: 'Dardan Gashi', user_email: 'dardan.g@gmail.com', created_at: new Date(now - 45 * 60 * 1000).toISOString() },
  { id: 3, action: 'BID_PLACED', entity_type: 'auctions', entity_id: 12, details: 'Ofertë 890 € për ASUS ROG Zephyrus G14', ip_address: '192.168.1.3', user_name: 'Blerina Krasniqi', user_email: 'blerina.k@gmail.com', created_at: new Date(now - 2 * hour).toISOString() },
  { id: 4, action: 'ADMIN_LOGIN', entity_type: 'auth', details: 'Kyçje në sistem nga paneli administrativ', ip_address: '127.0.0.1', user_name: 'Administratori Kryesor', user_email: 'admin@ankandet.al', created_at: new Date(now - 3 * hour).toISOString() }
];
