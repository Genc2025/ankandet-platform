import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import * as xlsx from 'xlsx';
import db, { logActivity } from './db.js';

/**
 * Generate URL-friendly slug
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
}

/**
 * Generate unique SKU
 */
export function generateSKU(prefix = 'ANK') {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${rand}`;
}

/**
 * Ensure category exists by name, returns category_id
 */
function getOrCreateCategory(categoryName, cache = new Map()) {
  if (!categoryName) return null;
  const trimmed = categoryName.trim();
  if (cache.has(trimmed.toLowerCase())) {
    return cache.get(trimmed.toLowerCase());
  }

  let row = db.prepare('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)').get(trimmed);
  if (!row) {
    const slug = generateSlug(trimmed);
    const info = db.prepare('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)')
      .run(trimmed, slug, `Kategoria ${trimmed}`);
    row = { id: info.lastInsertRowid };
  }

  cache.set(trimmed.toLowerCase(), row.id);
  return row.id;
}

/**
 * Stream/Batch Process CSV File for 9,000+ records with maximum throughput
 */
export async function importProductsFromCSV(filePath, originalFilename = 'import.csv', options = {}) {
  const startTime = Date.now();
  const categoryCache = new Map();
  const errors = [];
  let totalRows = 0;
  let successfulRows = 0;
  let failedRows = 0;

  const batchSize = options.batchSize || 500;
  let currentBatch = [];

  const insertProductStmt = db.prepare(`
    INSERT INTO products (
      title, slug, sku, description, category_id,
      condition_grade, condition_details, images,
      cost_price, starting_price, current_price, reserve_price, buy_now_price,
      min_bid_increment, auction_start, auction_end, original_end_time,
      anti_snip_minutes, anti_snip_extension, status
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const insertBatch = db.transaction((rows) => {
    for (const item of rows) {
      try {
        insertProductStmt.run(
          item.title,
          item.slug,
          item.sku,
          item.description,
          item.category_id,
          item.condition_grade,
          item.condition_details,
          item.images,
          item.cost_price,
          item.starting_price,
          item.starting_price,
          item.reserve_price,
          item.buy_now_price,
          item.min_bid_increment,
          item.auction_start,
          item.auction_end,
          item.auction_end,
          item.anti_snip_minutes,
          item.anti_snip_extension,
          item.status
        );
        successfulRows++;
      } catch (err) {
        failedRows++;
        if (errors.length < 50) {
          errors.push(`Rreshti me SKU ${item.sku || 'N/A'}: ${err.message}`);
        }
      }
    }
  });

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath).pipe(csvParser());

    stream.on('data', (row) => {
      totalRows++;

      try {
        const title = row['Titulli'] || row['title'] || row['Title'] || row['Emri'] || `Produkt #${totalRows}`;
        const rawSku = row['SKU'] || row['sku'] || generateSKU();
        const description = row['Pershkrimi'] || row['description'] || row['Përshkrimi'] || '';
        const categoryName = row['Kategoria'] || row['category'] || 'Të përgjithshme';
        const categoryId = getOrCreateCategory(categoryName, categoryCache);

        let conditionGrade = (row['Gjendja'] || row['condition'] || row['Grade'] || 'A').toUpperCase().trim();
        if (!['A', 'B', 'C'].includes(conditionGrade)) {
          conditionGrade = 'B';
        }

        const conditionDetails = row['Detaje_Gjendje'] || row['condition_details'] || '';
        const rawImages = row['Fotot'] || row['images'] || row['Foto'] || '';
        let imageList = [];
        if (rawImages) {
          imageList = rawImages.split(';').map(url => url.trim()).filter(Boolean);
        }
        if (imageList.length === 0) {
          imageList = ['/images/placeholder.svg'];
        }

        const startingPrice = Math.max(1, parseFloat(row['Cmimi_Fillestar'] || row['starting_price'] || '10.00') || 10.00);
        const costPrice = Math.max(0.5, parseFloat(row['Kostoja'] || row['cost_price']) || (startingPrice * 0.55));
        const reservePrice = Math.max(0, parseFloat(row['Cmimi_Rezerve'] || row['reserve_price'] || '0.00') || 0.00);
        const rawBuyNow = row['Bli_Menjehere'] || row['buy_now_price'];
        const buyNowPrice = rawBuyNow && parseFloat(rawBuyNow) > 0 ? parseFloat(rawBuyNow) : null;
        
        const durationDays = parseInt(row['Ditet_Ankandit'] || row['duration_days'] || '3', 10);
        const now = new Date();
        const endTime = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const antiSnipMin = parseInt(row['Anti_Snip_Minuta'] || '2', 10);
        const antiSnipExt = parseInt(row['Anti_Snip_Zgjatje'] || '3', 10);

        currentBatch.push({
          title,
          slug: generateSlug(title),
          sku: rawSku,
          description,
          category_id: categoryId,
          condition_grade: conditionGrade,
          condition_details: conditionDetails,
          images: JSON.stringify(imageList),
          cost_price: parseFloat(costPrice.toFixed(2)),
          starting_price: startingPrice,
          reserve_price: reservePrice,
          buy_now_price: buyNowPrice,
          min_bid_increment: startingPrice < 50 ? 1 : (startingPrice < 200 ? 2 : 5),
          auction_start: now.toISOString(),
          auction_end: endTime.toISOString(),
          anti_snip_minutes: antiSnipMin,
          anti_snip_extension: antiSnipExt,
          status: 'active'
        });

        if (currentBatch.length >= batchSize) {
          insertBatch(currentBatch);
          currentBatch = [];
        }
      } catch (parseErr) {
        failedRows++;
        if (errors.length < 50) {
          errors.push(`Gabim në përpunimin e rreshtit ${totalRows}: ${parseErr.message}`);
        }
      }
    });

    stream.on('end', () => {
      if (currentBatch.length > 0) {
        insertBatch(currentBatch);
        currentBatch = [];
      }

      const elapsedMs = Date.now() - startTime;
      const status = failedRows === 0 ? 'completed' : (successfulRows > 0 ? 'completed_with_errors' : 'failed');

      // Record in csv_imports table
      db.prepare(`
        INSERT INTO csv_imports (filename, total_rows, successful_rows, failed_rows, status, error_log)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        originalFilename,
        totalRows,
        successfulRows,
        failedRows,
        status,
        JSON.stringify(errors)
      );

      logActivity(null, 'MASS_IMPORT', 'csv_import', null, {
        filename: originalFilename,
        total: totalRows,
        success: successfulRows,
        failed: failedRows,
        duration_ms: elapsedMs
      });

      resolve({
        success: true,
        filename: originalFilename,
        totalRows,
        successfulRows,
        failedRows,
        durationMs: elapsedMs,
        durationSeconds: (elapsedMs / 1000).toFixed(2),
        errors: errors.slice(0, 20)
      });
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Generate a Sample CSV content for users to download
 */
export function generateSampleCSV(count = 10) {
  const headers = [
    'Titulli',
    'SKU',
    'Kategoria',
    'Gjendja',
    'Pershkrimi',
    'Cmimi_Fillestar',
    'Cmimi_Rezerve',
    'Bli_Menjehere',
    'Ditet_Ankandit',
    'Fotot',
    'Anti_Snip_Minuta',
    'Anti_Snip_Zgjatje'
  ];

  const sampleCategories = ['Elektronikë', 'Automjete & Pjesë', 'Pajisje Shtëpiake', 'IT & Telefonë', 'Vegla Pune'];
  const sampleConditions = ['A', 'B', 'C'];
  const rows = [];

  for (let i = 1; i <= count; i++) {
    const cat = sampleCategories[i % sampleCategories.length];
    const cond = sampleConditions[i % sampleConditions.length];
    const startPrice = (10 + (i * 5)).toFixed(2);
    const reservePrice = (parseFloat(startPrice) * 1.5).toFixed(2);
    const buyNowPrice = (parseFloat(startPrice) * 2.5).toFixed(2);

    rows.push([
      `"Artikull Test Ankandi #${i} - ${cat}"`,
      `"ANK-${10000 + i}"`,
      `"${cat}"`,
      `"${cond}"`,
      `"Përshkrim i hollësishëm për artikullin #${i}. Testuar dhe funksional."`,
      startPrice,
      reservePrice,
      buyNowPrice,
      '5',
      `"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f;https://images.unsplash.com/photo-1505740420928-5e560c06d30e"`,
      '2',
      '3'
    ].join(','));
  }

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Bulk generate 9,000 realistic products for commercial scale test
 */
export function generateBulkDatasetCSV(targetPath, count = 9000) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const headers = [
    'Titulli',
    'SKU',
    'Kategoria',
    'Gjendja',
    'Pershkrimi',
    'Cmimi_Fillestar',
    'Cmimi_Rezerve',
    'Bli_Menjehere',
    'Ditet_Ankandit',
    'Fotot',
    'Anti_Snip_Minuta',
    'Anti_Snip_Zgjatje'
  ];

  const categories = [
    'Elektronikë & TV',
    'Telefonë & Tabletë',
    'Laptopë & PC',
    'Pajisje Shtëpiake',
    'Vegla Pune & Industriale',
    'Pjesë Këmbimi Automjetesh',
    'Aksesorë & Orë',
    'Pajisje Audio & Muzikë'
  ];

  const itemsPerCat = {
    'Elektronikë & TV': ['Samsung Smart TV 55 inç', 'Sony Bravia 65 inç 4K', 'LG OLED TV 50 inç', 'Apple TV 4K', 'Soundbar JBL Bar 500'],
    'Telefonë & Tabletë': ['iPhone 15 Pro 128GB', 'Samsung Galaxy S24 Ultra', 'iPad Air M2', 'Xiaomi 14 Pro', 'Google Pixel 8 Pro'],
    'Laptopë & PC': ['MacBook Pro 16 M3 Max', 'Lenovo ThinkPad X1 Carbon', 'Dell XPS 15 inç', 'HP Spectre x360', 'Asus ROG Gaming Laptop'],
    'Pajisje Shtëpiake': ['Kondicioner Inverter 12000BTU', 'Fritezë me Ajër Philips XXL', 'Aparat Kafeje DeLonghi', 'Fshesë Robot Roborock S8'],
    'Vegla Pune & Industriale': ['Set Trapan Bosch Professional 18V', 'Prerëse Këndore Makita', 'Gjenerator Rryme Honda 3KW', 'Set Çelësash Kroma'],
    'Pjesë Këmbimi Automjetesh': ['Fellne Alumini 18 inç BMW', 'Fenerë LED Audi A6', 'Set Disk & Pllaka Frenimi Brembo', 'Timon Sportiv M-Package'],
    'Aksesorë & Orë': ['Orë Dore Seiko Automatic', 'Syze Dielli Ray-Ban Aviator', 'Kuletë Lëkure Montblanc', 'Çantë Shpine Samsonite'],
    'Pajisje Audio & Muzikë': ['Kufje Sony WH-1000XM5', 'Kufje Apple AirPods Pro 2', 'Boks Marshall Stanmore III', 'Mikrofon Shure SM7B']
  };

  const images = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f'
  ];

  const prefix = Date.now().toString().slice(-6);
  const lines = [headers.join(',')];

  for (let i = 1; i <= count; i++) {
    const cat = categories[i % categories.length];
    const catItems = itemsPerCat[cat];
    const baseTitle = catItems[i % catItems.length];
    const title = `"${baseTitle} #${i}"`;
    const sku = `"ANK-KOS-${prefix}-${100000 + i}"`;
    const category = `"${cat}"`;
    const grade = i % 5 === 0 ? 'C' : (i % 3 === 0 ? 'B' : 'A');
    const desc = `"Artikull origjinal i importuar nga ankandet e pajisjeve në Kosovë. Kontrolluar teknikisht, gjendja fizike: Klasa ${grade}."`;
    
    const base = 20 + ((i * 17) % 350);
    const startPrice = base.toFixed(2);
    const reservePrice = (base * 1.3).toFixed(2);
    const buyNowPrice = (base * 2.1).toFixed(2);
    const days = 2 + (i % 8);
    const img = `"${images[i % images.length]};${images[(i + 1) % images.length]}"`;

    lines.push([
      title,
      sku,
      category,
      `"${grade}"`,
      desc,
      startPrice,
      reservePrice,
      buyNowPrice,
      days,
      img,
      2,
      3
    ].join(','));
  }

  fs.writeFileSync(targetPath, lines.join('\n'), 'utf8');
  return targetPath;
}
