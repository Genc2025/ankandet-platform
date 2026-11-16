import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Clock, Gavel, ShieldCheck, Heart, Zap, Truck, AlertTriangle, 
  CheckCircle, ArrowRight, ShoppingCart, UserCheck, Share2, Tag, 
  ChevronRight, ChevronLeft, Eye, RefreshCw, Check, Sparkles, Layers,
  ExternalLink, PackageCheck, ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronUp
} from 'lucide-react';
import { Product, Bid, User } from '../types';
import { api } from '../api';
import { playSound } from '../socket';
import { useCurrency } from '../context/CurrencyContext';
import confetti from 'canvas-confetti';

interface InlineProductDetailsProps {
  product: Product;
  user: User | null;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onBuyNowClick: (product: Product) => void;
  onBidSuccess?: () => void;
  onToggleWatchlist: (productId: number) => void;
  onSelectProduct?: (product: Product) => void;
}

// In-memory cache for fetched details to prevent duplicate requests
const detailsCache: Record<number, {
  product: Product;
  bidHistory: Bid[];
  relatedProducts: Product[];
  fetchedAt: number;
}> = {};

export const InlineProductDetails: React.FC<InlineProductDetailsProps> = ({
  product,
  user,
  onClose,
  onOpenAuth,
  onBuyNowClick,
  onBidSuccess,
  onToggleWatchlist,
  onSelectProduct
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [bidAmount, setBidAmount] = useState<number>(
    product.min_next_bid || (product.current_price + (product.min_bid_increment || 1))
  );
  const [isProxy, setIsProxy] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const { formatBoth, formatPrice, formatLek, formatEur, rate, currency } = useCurrency();

  // Time left calculation
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
    isUrgent: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false, isUrgent: false });

  // Update countdown timer
  useEffect(() => {
    function calculate() {
      const now = Date.now();
      const end = new Date(product.auction_end).getTime();
      const diff = end - now;

      if (diff <= 0 || product.status !== 'active') {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true, isUrgent: false });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const isUrgent = diff <= 5 * 60 * 1000;

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false, isUrgent });
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [product.auction_end, product.status]);

  // Update bid amount whenever product's price or total_bids changes
  useEffect(() => {
    const minNext = product.total_bids === 0
      ? product.starting_price
      : product.current_price + (product.min_bid_increment || 1);
    setBidAmount(minNext);
  }, [product.current_price, product.total_bids, product.starting_price, product.min_bid_increment]);

  // Fetch full details, bid history, and related products with in-memory caching
  useEffect(() => {
    let isMounted = true;
    const cached = detailsCache[product.id];
    const CACHE_TTL = 15000; // 15 seconds cache

    if (cached && (Date.now() - cached.fetchedAt < CACHE_TTL)) {
      setBidHistory(cached.bidHistory);
      setRelatedProducts(cached.relatedProducts);
      return;
    }

    async function fetchFullData() {
      setLoadingDetails(true);
      try {
        const res = await api.getAuctionById(product.id);
        if (isMounted) {
          setBidHistory(res.bidHistory || []);
          setRelatedProducts(res.relatedProducts || []);
          detailsCache[product.id] = {
            product: res.product,
            bidHistory: res.bidHistory || [],
            relatedProducts: res.relatedProducts || [],
            fetchedAt: Date.now()
          };
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    }

    fetchFullData();
    return () => { isMounted = false; };
  }, [product.id, product.current_price, product.total_bids]);

  // Place Bid handler
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.placeBid(product.id, bidAmount, isProxy);
      setSuccessMsg(res.message);
      playSound('bid');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Clear cache for this product so fresh data is loaded
      delete detailsCache[product.id];

      // Refresh history
      const freshData = await api.getAuctionById(product.id);
      setBidHistory(freshData.bidHistory || []);

      onBidSuccess?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Dështoi vendosja e ofertës.');
      playSound('outbid');
    } finally {
      setLoading(false);
    }
  };

  // Preset increment quick selector
  const handleIncrement = (inc: number) => {
    setBidAmount((prev) => Math.max(
      product.total_bids === 0 ? product.starting_price : product.current_price + (product.min_bid_increment || 1),
      parseFloat((prev + inc).toFixed(2))
    ));
  };

  // Share functionality
  const handleShare = async () => {
    const url = window.location.origin + '?product=' + product.id;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Shiko këtë ankand në Ankandet.ks: ${product.title} - Çmimi aktual €${product.current_price.toFixed(2)}`,
          url
        });
        return;
      } catch (err) {
        // User cancelled or unsupported, fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (err) {
      // Ignore
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'];

  const conditionBadges = {
    A: {
      label: 'Klasa A (Si e re / Paketim origjinal)',
      desc: 'Artikull në gjendje të përsosur, pa shenja përdorimi, me paketim dhe aksesorë origjinalë.',
      bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
    },
    B: {
      label: 'Klasa B (E përdorur në gjendje të shkëlqyer)',
      desc: 'Artikull i testuar plotësisht funksional, mund të ketë mikrovizë kozmetike të papërfillshme.',
      bg: 'bg-blue-500/10 text-blue-800 border-blue-500/30'
    },
    C: {
      label: 'Klasa C (Shenja përdorimi / Testuar)',
      desc: 'Artikull me shenja të dukshme përdorimi, por 100% i testuar dhe funksional.',
      bg: 'bg-amber-500/10 text-amber-900 border-amber-500/30'
    }
  };

  const cond = conditionBadges[product.condition_grade] || conditionBadges.A;
  const minRequiredBid = product.total_bids === 0
    ? product.starting_price
    : product.current_price + (product.min_bid_increment || 1);

  return (
    <div 
      className="relative w-full bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400/90 dark:border-amber-500/80 shadow-2xl p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

      {/* Click-to-shrink banner */}
      <div 
        onClick={onClose}
        className="mb-4 -mt-1 py-2 px-3 sm:px-4 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl flex items-center justify-between cursor-pointer text-xs font-bold text-amber-900 dark:text-amber-300 transition-colors select-none group"
        title="Kliko këtu për ta zvogëluar / mbyllur këtë produkt"
      >
        <span className="flex items-center gap-2">
          <ChevronUp className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
          <span>Produkti i zgjeruar • Kliko këtu ose prap mbi kartën për ta zvogëluar</span>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-xs transition-colors">
          Zvogëlo ✕
        </span>
      </div>

      {/* Header bar: SKU, Categories, Quick Badges & Close Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-mono bg-slate-900 dark:bg-slate-950 text-amber-400 px-2.5 py-1 rounded-lg font-bold">
            SKU: {product.sku}
          </span>
          {product.category_name && (
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-semibold border border-slate-200 dark:border-slate-700">
              {product.category_name}
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-lg border font-bold ${cond.bg}`}>
            {cond.label}
          </span>
          <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5" />
            Stoku: 1 copë unike në magazinë
          </span>
        </div>

        {/* Action icons: Share, Favorite, Close */}
        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            title="Ndaj këtë produkt"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">U kopjua!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ndaj</span>
              </>
            )}
          </button>

          {/* Favorite Button */}
          <button
            onClick={() => onToggleWatchlist(product.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              product.is_watched
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
            title={product.is_watched ? 'Hiq nga lista e preferuar' : 'Ruaj në listën e preferuar'}
          >
            <Heart className={`w-3.5 h-3.5 ${product.is_watched ? 'fill-current text-rose-500' : ''}`} />
            <span className="hidden sm:inline">
              {product.is_watched ? 'Në Preferenca' : 'Shto në Preferenca'}
            </span>
          </button>

          {/* Close / Collapse Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1 p-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-xs font-bold"
            title="Zvogëlo / Mbyll detajet"
          >
            <ChevronUp className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Zvogëlo</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid: Left (Images & History) / Right (Bidding, Specs, Shipping) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Gallery & Bid History */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Large Image with Click-to-Zoom */}
          <div 
            onClick={() => setIsImageZoomed(true)}
            className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 group cursor-zoom-in"
            title="Kliko mbi foto për ta zmadhuar / rritur në madhësi të plotë"
          >
            <img
              src={images[activeImageIdx]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f';
              }}
            />

            {/* Floating Enlarge Hint Badge */}
            <div className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-md pointer-events-none transition-opacity">
              <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
              <span>Rrit Foton</span>
            </div>

            {/* Countdown floating badge on image */}
            <div className={`absolute bottom-3 inset-x-3 rounded-xl p-2.5 flex items-center justify-between text-xs backdrop-blur-md font-mono ${
              timeLeft.isEnded
                ? 'bg-slate-900/90 text-slate-300'
                : timeLeft.isUrgent
                ? 'bg-rose-600/95 text-white animate-pulse'
                : 'bg-slate-950/80 text-white'
            }`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-bold">
                  {timeLeft.isEnded ? 'Ankandi ka përfunduar' : (
                    <>
                      {timeLeft.days > 0 && `${timeLeft.days}d `}
                      {String(timeLeft.hours).padStart(2, '0')}:
                      {String(timeLeft.minutes).padStart(2, '0')}:
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </>
                  )}
                </span>
              </div>

              {product.anti_snip_count > 0 && (
                <span className="text-[11px] text-amber-300 flex items-center gap-1 font-sans font-bold">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Anti-Snip: +{product.anti_snip_count * 3} min
                </span>
              )}
            </div>
          </div>

          {/* Fullscreen Lightbox Zoom Modal when Image is clicked to enlarge */}
          {isImageZoomed && (
            <div 
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in zoom-in-95 duration-200"
              onClick={() => setIsImageZoomed(false)}
            >
              <div 
                className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
                onClick={() => setIsImageZoomed(false)}
              >
                <button
                  type="button"
                  onClick={() => setIsImageZoomed(false)}
                  className="absolute -top-12 right-0 p-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/25 rounded-full transition-colors cursor-pointer"
                  title="Zvogëlo / Mbyll foton"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={images[activeImageIdx]}
                  alt={product.title}
                  className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/20 select-none"
                />
                <div className="flex items-center gap-2 text-white/90 text-xs font-semibold mt-3 bg-black/60 px-4 py-1.5 rounded-full border border-white/15">
                  <ZoomOut className="w-4 h-4 text-amber-400" />
                  <span>Kliko prap kudo mbi foto ose jashtë për ta zvogëluar ✕</span>
                </div>
              </div>
            </div>
          )}

          {/* Thumbnail Gallery Navigation */}
          {images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIdx === idx
                      ? 'border-amber-500 scale-105 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Condition Details Explanation Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Gjendja e Artikullit: {cond.label}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {product.condition_details || cond.desc}
            </p>
          </div>

          {/* Live Bid History Ledger */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Gavel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Historiku i Ofertave ({bidHistory.length})
              </h4>
              <span className="text-[11px] text-slate-400">Përditësim në kohë reale</span>
            </div>

            {loadingDetails ? (
              <div className="py-4 text-center">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-500" />
              </div>
            ) : bidHistory.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center italic">
                Nuk ka asnjë ofertë ende. Bëhu i pari që ofertoni!
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {bidHistory.map((b, i) => (
                  <div
                    key={b.id || i}
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                      i === 0 
                        ? 'bg-amber-100/70 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 font-bold text-amber-950 dark:text-amber-200' 
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{b.bidder_name || 'Blerës'}</span>
                      {b.city && (
                        <span className="text-[10px] text-slate-400">({b.city})</span>
                      )}
                      {b.bid_type === 'proxy' && (
                        <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-md">
                          Auto
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="text-right">
                        <span className="font-mono font-black text-slate-900 dark:text-white block">
                          {formatBoth(b.amount).primary}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 block -mt-0.5">
                          {formatBoth(b.amount).secondary}
                        </span>
                      </div>
                      {i === 0 && (
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">
                          Udhëheq
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Title, Prices, Bidding Console, Buy Now & Delivery Info */}
        <div className="lg:col-span-6 space-y-5">
          {/* Product Title */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {product.title}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">
              Publikuar më: {new Date(product.auction_start).toLocaleDateString('sq-XK')}
            </p>
          </div>

          {/* Price Board */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Çmimi Aktual</span>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                    {formatBoth(product.current_price).primary}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/70 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    {formatBoth(product.current_price).secondary}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                  Çmimi fillestar: <strong>{formatPrice(product.starting_price, { showBoth: true })}</strong>
                </span>
              </div>

              {product.buy_now_price && product.buy_now_price > 0 && (
                <div className="text-right border-l border-slate-200 dark:border-slate-700 pl-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">Bli Menjëherë</span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                      {formatBoth(product.buy_now_price).primary}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {formatBoth(product.buy_now_price).secondary}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Bli pa pritur mbarimin e ankandit
                  </span>
                </div>
              )}
            </div>

            {/* Reserve Price and Winning State Info */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                {product.reserve_price > 0 ? (
                  product.current_price >= product.reserve_price ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Çmimi rezervë u arrit (artikulli do të shitet!)
                    </span>
                  ) : (
                    <span className="text-amber-800 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Çmimi rezervë minimal nuk është arritur ende
                    </span>
                  )
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Pa çmim rezervë (shitet me ofertën më të lartë)</span>
                )}
              </div>

              {product.is_user_winning && (
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-xs">
                  ✓ Ju po fitoni këtë ankand!
                </span>
              )}
            </div>
          </div>

          {/* Bidding Console Form */}
          {product.status === 'active' && !timeLeft.isEnded ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-600/80 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Paneli i Ofertës së Drejtpërdrejtë
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Minimumi i lejuar: <strong className="font-mono text-slate-900 dark:text-white">{formatPrice(minRequiredBid, { showBoth: true })}</strong>
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handlePlaceBid} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      €
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min={minRequiredBid}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(parseFloat(e.target.value) || minRequiredBid)}
                      className="w-full pl-8 pr-24 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-base font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
                      ≈ {formatLek(bidAmount * rate)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Gavel className="w-4 h-4" />
                        <span>Vendos Ofertën</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Real-time currency conversion preview */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1 bg-slate-50 dark:bg-slate-800/80 py-1 rounded-lg border border-slate-100 dark:border-slate-750">
                  <span>Ekuivalenca e ofertës: <strong className="text-slate-900 dark:text-white font-bold">{currency === 'ALL' ? formatEur(bidAmount) : formatLek(bidAmount)}</strong></span>
                  <span className="text-[10px] text-slate-400">Kursi: 1 € = {rate} L</span>
                </div>

                {/* Quick Increment Preset Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Shto shpejt:</span>
                  {[1, 2, 5, 10, 25].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => handleIncrement(inc)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-300 font-bold font-mono transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      +{inc} €
                    </button>
                  ))}
                </div>

                {/* Proxy Bidding Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isProxy}
                    onChange={(e) => setIsProxy(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Aktivizo Ofertimin Automatik (Proxy Bidding)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sistemi do të ofertojë automatikisht me hapin minimal deri në tavanin tuaj, duke ju garantuar çmimin më të ulët të mundshëm.
                    </span>
                  </div>
                </label>
              </form>

              {/* Buy Now alternative button if enabled */}
              {product.buy_now_price && product.buy_now_price > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onBuyNowClick(product)}
                    className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-750 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    <span>Bli Menjëherë për {formatPrice(product.buy_now_price, { showBoth: true })}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Ky ankand ka përfunduar</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {product.status === 'sold' ? 'Artikulli është shitur me sukses.' : 'Ankandi u mbyll pa arritur çmimin rezervë.'}
              </p>
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Përshkrimi i Plotë i Produktit
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 whitespace-pre-line">
              {product.description || 'Përshkrimi i plotë i pajisjes nuk është specifikuar.'}
            </div>
          </div>

          {/* Kosovo Shipping and Courier Details */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-xs">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Dërgimi dhe Transporti në Kosovë
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Posta e Shpejtë (24–48 orë në çdo qytet dhe fshat të Kosovës).</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Kosto e transportit: <strong>{formatPrice(3.00, { showBoth: true })}</strong> flat rate.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Pagesa: <strong>Para në dorë (Cash on Delivery)</strong> pasi të hapni dhe kontrolloni pakon.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products in this Category */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Artikuj të Tjerë të Ngjashëm në këtë Kategori
            </h3>
            <span className="text-[11px] text-slate-400">Kliko për të shfletuar inline</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectProduct?.(rel)}
                className="group/rel bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-750 hover:border-amber-400 dark:hover:border-amber-500 p-2.5 cursor-pointer transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-white dark:bg-slate-800 mb-2">
                  <img
                    src={rel.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h5 className="font-bold text-[11px] text-slate-800 dark:text-slate-200 line-clamp-1 group-hover/rel:text-amber-600 dark:group-hover/rel:text-amber-400 transition-colors">
                    {rel.title}
                  </h5>
                  <p className="text-[11px] font-mono font-black text-slate-900 dark:text-white mt-0.5">
                    {formatBoth(rel.current_price).primary}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    {formatBoth(rel.current_price).secondary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Collapse Button */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Mbyll Detajet e Produktit</span>
        </button>
      </div>
    </div>
  );
};
