import db, { logActivity, createAdminNotification } from './db.js';

/**
 * Commercial Bid Increment Table
 * Standard ladder based on current auction price
 */
export function getMinBidIncrement(currentPrice) {
  if (currentPrice < 50) return 1.00;
  if (currentPrice < 200) return 2.00;
  if (currentPrice < 500) return 5.00;
  if (currentPrice < 1000) return 10.00;
  if (currentPrice < 5000) return 25.00;
  return 50.00;
}

/**
 * Format Kosovo Currency
 */
export function formatEUR(amount) {
  return new Intl.NumberFormat('sq-XK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Check and apply Anti-Sniping extension if bid is placed in final minutes
 */
export function checkAntiSniping(product) {
  const now = Date.now();
  const endTime = new Date(product.auction_end).getTime();
  const msRemaining = endTime - now;
  const snipWindowMs = (product.anti_snip_minutes || 2) * 60 * 1000;
  const extensionMs = (product.anti_snip_extension || 3) * 60 * 1000;

  if (msRemaining <= snipWindowMs && msRemaining > 0) {
    // Extend end time from either current end or now
    const newEndTime = new Date(endTime + extensionMs);
    const newEndTimeISO = newEndTime.toISOString();

    db.prepare(`
      UPDATE products 
      SET auction_end = ?, 
          anti_snip_count = anti_snip_count + 1 
      WHERE id = ?
    `).run(newEndTimeISO, product.id);

    logActivity(null, 'AUCTION_EXTENDED', 'product', product.id, {
      previous_end: product.auction_end,
      new_end: newEndTimeISO,
      extended_by_minutes: product.anti_snip_extension,
      reason: 'Anti-Sniping triggered by late bid'
    });

    return {
      extended: true,
      newEndTime: newEndTimeISO,
      extensionMinutes: product.anti_snip_extension,
      count: (product.anti_snip_count || 0) + 1
    };
  }

  return { extended: false, newEndTime: product.auction_end };
}

/**
 * Core Proxy Bidding Engine
 * Handles both manual bids and automated proxy bids
 */
export function placeBid({ productId, userId, amount, isProxy = false, ip = null, broadcastFn = null }) {
  // Wrap entire bidding logic in SQLite transaction for atomicity and concurrency safety
  const executeBid = db.transaction(() => {
    // 1. Fetch current product state
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      throw new Error('Produkti nuk u gjet.');
    }

    if (product.status !== 'active') {
      throw new Error('Ky ankand nuk është më aktiv.');
    }

    const now = Date.now();
    const endTime = new Date(product.auction_end).getTime();
    if (now >= endTime) {
      // Mark as ended
      db.prepare("UPDATE products SET status = 'ended' WHERE id = ?").run(productId);
      throw new Error('Ankandi ka përfunduar.');
    }

    const bidder = db.prepare('SELECT id, full_name, role FROM users WHERE id = ?').get(userId);
    if (!bidder) {
      throw new Error('Përdoruesi nuk ekziston.');
    }

    const minIncrement = getMinBidIncrement(product.current_price);
    const minRequired = product.total_bids === 0 
      ? product.starting_price 
      : product.current_price + minIncrement;

    if (amount < minRequired) {
      throw new Error(`Oferta duhet të jetë të paktën €${minRequired.toFixed(2)} (Rritja minimale: €${minIncrement.toFixed(2)})`);
    }

    // 2. Upsert Proxy Bid for this user
    // If user bids, their amount becomes their max proxy limit
    const existingProxy = db.prepare(`
      SELECT * FROM proxy_bids WHERE product_id = ? AND user_id = ?
    `).get(productId, userId);

    if (existingProxy) {
      if (amount <= existingProxy.max_amount && product.current_winner_id === userId) {
        throw new Error(`Ju tashmë keni një ofertë maksimale prej €${existingProxy.max_amount.toFixed(2)} dhe jeni fitues aktual.`);
      }
      db.prepare(`
        UPDATE proxy_bids 
        SET max_amount = ?, is_active = 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(amount, existingProxy.id);
    } else {
      db.prepare(`
        INSERT INTO proxy_bids (product_id, user_id, max_amount) 
        VALUES (?, ?, ?)
      `).run(productId, userId, amount);
    }

    // 3. Evaluate All Active Proxy Bids for this Product
    const allProxies = db.prepare(`
      SELECT pb.*, u.full_name 
      FROM proxy_bids pb
      JOIN users u ON pb.user_id = u.id
      WHERE pb.product_id = ? AND pb.is_active = 1
      ORDER BY pb.max_amount DESC, pb.created_at ASC
    `).all(productId);

    let newWinningPrice = product.current_price;
    let newWinnerId = null;
    let winningProxy = null;
    let outbidUserId = null;

    if (allProxies.length === 1) {
      // Only one bidder
      winningProxy = allProxies[0];
      newWinnerId = winningProxy.user_id;

      if (product.total_bids === 0) {
        // First bid starts at starting price, or reserve price if reserve is set and user proxy covers it
        if (product.reserve_price > 0 && winningProxy.max_amount >= product.reserve_price) {
          newWinningPrice = Math.max(product.starting_price, product.reserve_price);
        } else {
          newWinningPrice = product.starting_price;
        }
      } else {
        newWinningPrice = Math.min(minRequired, winningProxy.max_amount);
      }
    } else if (allProxies.length >= 2) {
      const top1 = allProxies[0];
      const top2 = allProxies[1];

      winningProxy = top1;
      newWinnerId = top1.user_id;

      if (top1.user_id !== product.current_winner_id) {
        outbidUserId = product.current_winner_id;
      }

      // Check if top1 and top2 have equal max amount:
      // Earlier created proxy wins at that exact amount
      if (top1.max_amount === top2.max_amount) {
        newWinningPrice = top1.max_amount;
      } else {
        // top1 has higher max than top2
        const inc = getMinBidIncrement(top2.max_amount);
        let calculatedPrice = top2.max_amount + inc;
        
        // Cannot exceed top1's max
        if (calculatedPrice > top1.max_amount) {
          calculatedPrice = top1.max_amount;
        }

        // If reserve price exists and top1 covers it, ensure price reaches reserve if competitive
        if (product.reserve_price > 0 && top1.max_amount >= product.reserve_price && calculatedPrice < product.reserve_price) {
          calculatedPrice = product.reserve_price;
        }

        newWinningPrice = calculatedPrice;
      }
    }

    // Ensure new winning price never drops below current price or min required
    if (newWinningPrice < product.current_price && product.total_bids > 0) {
      newWinningPrice = product.current_price;
    }

    // 4. Record Bid in ledger
    const bidType = isProxy ? 'proxy' : 'manual';
    const bidResult = db.prepare(`
      INSERT INTO bids (product_id, user_id, amount, max_proxy_amount, bid_type, is_winning)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(productId, userId, newWinningPrice, amount, bidType);

    // Unmark previous winning bids for this product
    db.prepare(`
      UPDATE bids SET is_winning = 0 WHERE product_id = ? AND id != ?
    `).run(productId, bidResult.lastInsertRowid);

    // 5. Anti-sniping check
    const snipResult = checkAntiSniping(product);
    const updatedEndTime = snipResult.newEndTime;

    // 6. Update product table
    db.prepare(`
      UPDATE products 
      SET current_price = ?,
          current_winner_id = ?,
          total_bids = total_bids + 1,
          min_bid_increment = ?
      WHERE id = ?
    `).run(newWinningPrice, newWinnerId, getMinBidIncrement(newWinningPrice), productId);

    // 7. Activity Log
    logActivity(userId, 'BID_PLACED', 'product', productId, {
      amount: newWinningPrice,
      user_max_proxy: amount,
      is_proxy: isProxy,
      winner_id: newWinnerId,
      reserve_met: product.reserve_price > 0 ? (newWinningPrice >= product.reserve_price) : true
    }, ip);

    // Fraud / Suspicious rapid-bidding check
    try {
      const recentCount = db.prepare(`
        SELECT COUNT(*) as count FROM bids 
        WHERE product_id = ? AND user_id = ? AND created_at >= datetime('now', '-1 minute')
      `).get(productId, userId).count;

      if (recentCount >= 6) {
        createAdminNotification({
          type: 'suspicious_activity',
          title: 'Aktivitet i dyshimtë: Ofertime të shpeshta!',
          message: `Klienti #${userId} (${bidder.full_name}) ka kryer ${recentCount} oferta brenda 1 minute në artikullin #${productId} (${product.title}).`,
          severity: 'danger',
          entityType: 'user',
          entityId: userId,
          broadcastFn
        });
      }
    } catch (e) {}

    // Fetch updated product with winner details
    const updatedProduct = db.prepare(`
      SELECT p.*, u.full_name as winner_name, c.name as category_name
      FROM products p
      LEFT JOIN users u ON p.current_winner_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(productId);

    return {
      success: true,
      bidId: bidResult.lastInsertRowid,
      currentPrice: newWinningPrice,
      winnerId: newWinnerId,
      winnerName: updatedProduct.winner_name,
      totalBids: updatedProduct.total_bids,
      antiSnipExtended: snipResult.extended,
      newEndTime: updatedEndTime,
      outbidUserId,
      reserveMet: updatedProduct.reserve_price > 0 ? (newWinningPrice >= updatedProduct.reserve_price) : true,
      product: updatedProduct
    };
  });

  const result = executeBid();

  // Broadcast WebSocket notification
  if (broadcastFn) {
    broadcastFn('BID_UPDATE', {
      productId: result.product.id,
      currentPrice: result.currentPrice,
      winnerId: result.winnerId,
      winnerName: result.winnerName,
      totalBids: result.totalBids,
      antiSnipExtended: result.antiSnipExtended,
      newEndTime: result.newEndTime,
      reserveMet: result.reserveMet
    });

    if (result.outbidUserId) {
      broadcastFn('OUTBID_ALERT', {
        userId: result.outbidUserId,
        productId: result.product.id,
        productTitle: result.product.title,
        newPrice: result.currentPrice
      });
    }

    if (result.antiSnipExtended) {
      broadcastFn('SNIPING_ALERT', {
        productId: result.product.id,
        productTitle: result.product.title,
        newEndTime: result.newEndTime,
        message: 'Ankandi u zgjat automatikisht për shkak të ofertës në minutat e fundit!'
      });
    }
  }

  return result;
}

/**
 * Buy Now ("Bli Menjëherë")
 * Immediately concludes the auction and creates order
 */
export function executeBuyNow({ productId, userId, shippingDetails = {}, ip = null, broadcastFn = null }) {
  const buyNowTx = db.transaction(() => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      throw new Error('Produkti nuk u gjet.');
    }

    if (product.status !== 'active') {
      throw new Error('Ky produkt nuk është në ankand aktiv.');
    }

    if (!product.buy_now_price || product.buy_now_price <= 0) {
      throw new Error('Ky produkt nuk e ka opsionin "Bli Menjëherë".');
    }

    const buyer = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!buyer) {
      throw new Error('Blerësi nuk ekziston.');
    }

    const finalPrice = product.buy_now_price;
    const shippingFee = 3.00; // Kosovë flat rate standard
    const totalAmount = finalPrice + shippingFee;
    const orderNumber = `ANK-${Date.now()}-${product.id}`;

    // Mark product as sold
    db.prepare(`
      UPDATE products 
      SET status = 'sold',
          current_price = ?,
          current_winner_id = ?,
          total_bids = total_bids + 1
      WHERE id = ?
    `).run(finalPrice, userId, productId);

    // Record Buy Now bid
    db.prepare(`
      INSERT INTO bids (product_id, user_id, amount, bid_type, is_winning)
      VALUES (?, ?, ?, 'buy_now', 1)
    `).run(productId, userId, finalPrice);

    // Create Order
    const orderStmt = db.prepare(`
      INSERT INTO orders (
        order_number, user_id, product_id, cost_price, final_price, shipping_fee, total_amount,
        payment_method, payment_status, order_status,
        shipping_name, shipping_phone, shipping_city, shipping_address, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const costPrice = product.cost_price || 0.00;
    const orderResult = orderStmt.run(
      orderNumber,
      userId,
      productId,
      costPrice,
      finalPrice,
      shippingFee,
      totalAmount,
      shippingDetails.payment_method || 'cash_on_delivery',
      'pending',
      'processing',
      shippingDetails.shipping_name || buyer.full_name,
      shippingDetails.shipping_phone || buyer.phone || '044000000',
      shippingDetails.shipping_city || buyer.city || 'Prishtinë',
      shippingDetails.shipping_address || buyer.address || 'Rruga Kryesore',
      shippingDetails.notes || 'Blerje e menjëhershme me çmim fiks'
    );

    // Create Admin notification for sale
    createAdminNotification({
      type: 'product_sold',
      title: 'Artikull i Shitur me "Bli Menjëherë"!',
      message: `"${product.title}" u ble për €${finalPrice.toFixed(2)}. Fitimi bruto: €${(finalPrice - costPrice).toFixed(2)}.`,
      severity: 'success',
      entityType: 'order',
      entityId: orderResult.lastInsertRowid,
      broadcastFn
    });

    // Activity log
    logActivity(userId, 'BUY_NOW', 'order', orderResult.lastInsertRowid, {
      product_id: productId,
      order_number: orderNumber,
      amount: totalAmount
    }, ip);

    return {
      success: true,
      orderId: orderResult.lastInsertRowid,
      orderNumber,
      productTitle: product.title,
      finalPrice,
      totalAmount
    };
  });

  const result = buyNowTx();

  if (broadcastFn) {
    broadcastFn('AUCTION_SOLD', {
      productId,
      buyNow: true,
      winnerId: userId,
      orderNumber: result.orderNumber
    });
  }

  return result;
}

/**
 * Background Timer Engine
 * Runs periodically to resolve expired auctions, award winners, and generate orders
 */
export function processExpiredAuctions(broadcastFn = null) {
  try {
    const nowIso = new Date().toISOString();
    const expiredProducts = db.prepare(`
      SELECT * FROM products 
      WHERE status = 'active' AND auction_end <= ?
    `).all(nowIso);

    for (const product of expiredProducts) {
      const resolveTx = db.transaction(() => {
        if (product.total_bids > 0 && product.current_winner_id) {
          // Check reserve price
          if (product.reserve_price > 0 && product.current_price < product.reserve_price) {
            // Reserve NOT met
            db.prepare("UPDATE products SET status = 'ended' WHERE id = ?").run(product.id);

            logActivity(null, 'AUCTION_ENDED_RESERVE_NOT_MET', 'product', product.id, {
              final_price: product.current_price,
              reserve_price: product.reserve_price,
              winner_id: product.current_winner_id
            });

            createAdminNotification({
              type: 'auction_ended',
              title: 'Ankandi përfundoi pa shitje (Rezerva nuk u arrit)',
              message: `Ankandi për "${product.title}" arriti €${product.current_price.toFixed(2)}, nën rezervën prej €${product.reserve_price.toFixed(2)}.`,
              severity: 'warning',
              entityType: 'product',
              entityId: product.id,
              broadcastFn
            });

            if (broadcastFn) {
              broadcastFn('AUCTION_ENDED', {
                productId: product.id,
                reserveMet: false,
                reason: 'Çmimi rezervë nuk u arrit'
              });
            }
          } else {
            // Winner awarded!
            db.prepare("UPDATE products SET status = 'sold' WHERE id = ?").run(product.id);

            const winner = db.prepare('SELECT * FROM users WHERE id = ?').get(product.current_winner_id);
            const orderNumber = `ANK-FIT-${Date.now()}-${product.id}`;
            const shippingFee = 3.00;
            const totalAmount = product.current_price + shippingFee;
            const costPrice = product.cost_price || 0.00;

            const orderResult = db.prepare(`
              INSERT INTO orders (
                order_number, user_id, product_id, cost_price, final_price, shipping_fee, total_amount,
                payment_method, payment_status, order_status,
                shipping_name, shipping_phone, shipping_city, shipping_address, notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'cash_on_delivery', 'pending', 'processing', ?, ?, ?, ?, 'Fitues i ankandit')
            `).run(
              orderNumber,
              product.current_winner_id,
              product.id,
              costPrice,
              product.current_price,
              shippingFee,
              totalAmount,
              winner ? winner.full_name : 'Klient Fitues',
              winner ? (winner.phone || '044000000') : '044000000',
              winner ? (winner.city || 'Prishtinë') : 'Prishtinë',
              winner ? (winner.address || 'Qendër') : 'Kosovë'
            );

            createAdminNotification({
              type: 'product_sold',
              title: 'Ankand i fituar me sukses!',
              message: `"${product.title}" u fitua për €${product.current_price.toFixed(2)} nga ${winner ? winner.full_name : 'Klient'}. Fitimi bruto: €${(product.current_price - costPrice).toFixed(2)}.`,
              severity: 'success',
              entityType: 'order',
              entityId: orderResult.lastInsertRowid,
              broadcastFn
            });

            logActivity(product.current_winner_id, 'AUCTION_WON', 'order', orderResult.lastInsertRowid, {
              product_id: product.id,
              final_price: product.current_price,
              order_number: orderNumber
            });

            if (broadcastFn) {
              broadcastFn('AUCTION_ENDED', {
                productId: product.id,
                reserveMet: true,
                winnerId: product.current_winner_id,
                winnerName: winner ? winner.full_name : 'Klient',
                finalPrice: product.current_price,
                orderNumber
              });
            }
          }
        } else {
          // No bids placed
          db.prepare("UPDATE products SET status = 'ended' WHERE id = ?").run(product.id);

          logActivity(null, 'AUCTION_ENDED_NO_BIDS', 'product', product.id, {
            starting_price: product.starting_price
          });

          if (broadcastFn) {
            broadcastFn('AUCTION_ENDED', {
              productId: product.id,
              reserveMet: false,
              hasBids: false
            });
          }
        }
      });

      resolveTx();
    }
  } catch (err) {
    console.error('Error processing expired auctions:', err);
  }
}
