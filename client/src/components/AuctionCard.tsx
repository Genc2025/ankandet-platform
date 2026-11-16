import React, { useEffect, useState } from 'react';
import { Clock, Gavel, Heart, Zap, ShieldCheck, Tag, ShoppingCart, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface AuctionCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onToggleWatchlist: (productId: number) => void;
  onQuickBuyNow: (product: Product) => void;
  isExpanded?: boolean;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({
  product,
  onSelect,
  onToggleWatchlist,
  onQuickBuyNow,
  isExpanded = false
}) => {
  const { formatBoth } = useCurrency();
  const currentPriceFormatted = formatBoth(product.current_price);
  const buyNowFormatted = product.buy_now_price ? formatBoth(product.buy_now_price) : null;
  const targetMax = product.buy_now_price || (product.reserve_price ? product.reserve_price * 1.2 : product.current_price * 1.5);
  const progressPercent = Math.min(100, Math.max(15, Math.round((product.current_price / targetMax) * 100)));
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
    isUrgent: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false, isUrgent: false });

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
      const isUrgent = diff <= 5 * 60 * 1000; // Less than 5 minutes

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false, isUrgent });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [product.auction_end, product.status]);

  const conditionBadges = {
    A: { label: 'Klasa A (Si e re)', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    B: { label: 'Klasa B (E shkëlqyer)', bg: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
    C: { label: 'Klasa C (Përdorur)', bg: 'bg-amber-500/10 text-amber-800 border-amber-500/20' }
  };

  const cond = conditionBadges[product.condition_grade] || conditionBadges.A;
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f';

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent triggering if clicked an interactive button inside
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    onSelect(product);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
        isExpanded
          ? 'border-amber-500 ring-4 ring-amber-400/90 shadow-2xl scale-[1.03] -translate-y-1 z-10'
          : 'border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xl hover:-translate-y-0.5'
      }`}
      title={isExpanded ? 'Kliko mbi produkt për ta zvogëluar / mbyllur' : 'Kliko mbi produkt për ta rritur / shfaqur detajet'}
    >
      {/* Top Expansion Indicator Pill */}
      {isExpanded && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider py-1.5 px-3 text-center flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer select-none"
          title="Kliko për ta zvogëluar këtë produkt"
        >
          <ChevronUp className="w-3.5 h-3.5 animate-pulse" />
          <span>Hapur • Kliko Prap për Zvogëlim ✕</span>
        </div>
      )}

      {/* Top Image area */}
      <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f';
          }}
        />

        {/* Watchlist heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-colors cursor-pointer z-10 ${
            product.is_watched
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-black/30 text-white hover:bg-black/50'
          }`}
          title={product.is_watched ? 'Hiq nga lista e preferuar' : 'Shto në listën e preferuar'}
        >
          <Heart className={`w-4 h-4 ${product.is_watched ? 'fill-current' : ''}`} />
        </button>

        {/* Condition Grade & Hot badges */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          <span className={`text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border backdrop-blur-md ${cond.bg}`}>
            {cond.label}
          </span>
          {product.category_name && (
            <span className="text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-slate-900/70 text-slate-200 backdrop-blur-md">
              {product.category_name}
            </span>
          )}
          {product.total_bids >= 3 && (
            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs flex items-center gap-1 backdrop-blur-md w-fit">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current animate-pulse" />
              Nxehtë ({product.total_bids})
            </span>
          )}
        </div>

        {/* Floating Timer Badge at bottom of image */}
        <div className={`absolute bottom-1.5 inset-x-1.5 sm:bottom-2 sm:inset-x-2 rounded-lg sm:rounded-xl px-2 py-1 sm:py-1.5 flex items-center justify-between text-[10px] sm:text-xs backdrop-blur-md font-medium ${
          timeLeft.isEnded
            ? 'bg-slate-900/80 text-slate-300'
            : timeLeft.isUrgent
            ? 'bg-rose-600/90 text-white animate-pulse'
            : 'bg-slate-950/75 text-white'
        }`}>
          <div className="flex items-center gap-1 sm:gap-1.5 font-mono">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            {timeLeft.isEnded ? (
              <span>Përfunduar</span>
            ) : (
              <span>
                {timeLeft.days > 0 && `${timeLeft.days}d `}
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            )}
          </div>
          {product.anti_snip_count > 0 && (
            <span className="text-[9px] sm:text-[10px] text-amber-300 flex items-center gap-0.5 font-semibold">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              +{product.anti_snip_count * 3}m
            </span>
          )}
        </div>
      </div>

      {/* Content info */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-mono mb-0.5 sm:mb-1">
            <span>SKU: {product.sku}</span>
            <span>{product.total_bids} oferta</span>
          </div>

          <h3 
            className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>
        </div>

        {/* Price status */}
        <div className="pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-baseline justify-between gap-1">
            <div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">Çmimi Aktual</p>
              <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                  {currentPriceFormatted.primary}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-mono font-medium">
                  {currentPriceFormatted.secondary}
                </span>
              </div>
            </div>

            {buyNowFormatted && (
              <div className="text-right">
                <p className="text-[9px] sm:text-[10px] text-slate-400">Bli Menjëherë</p>
                <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {buyNowFormatted.primary}
                </p>
              </div>
            )}
          </div>

          {/* Reserve price indicator */}
          <div className="mt-1 sm:mt-2 flex items-center justify-between text-[10px] sm:text-[11px]">
            {product.reserve_price > 0 ? (
              product.current_price >= product.reserve_price ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  ✓ Rezerva u arrit
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-medium text-[9px] sm:text-[11px]">
                  Rezerva s'u arrit
                </span>
              )
            ) : (
              <span className="text-slate-400 dark:text-slate-500">Pa rezervë</span>
            )}

            {product.is_user_winning && (
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[9px] sm:text-[10px]">
                Po fitoni!
              </span>
            )}
          </div>

          {/* Progress bar towards completion/reserve */}
          <div className="mt-1.5 sm:mt-2.5">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-mono mb-0.5 sm:mb-1">
              <span>Ofertimi aktiv</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-1 sm:h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1.5 sm:gap-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className={`w-full py-1.5 sm:py-2 px-2 sm:px-3 font-bold rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-xs cursor-pointer ${
              isExpanded
                ? 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-750'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
            }`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Mbyll</span>
              </>
            ) : (
              <>
                <Gavel className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Oferto</span>
              </>
            )}
          </button>

          {product.buy_now_price && product.buy_now_price > 0 && product.status === 'active' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickBuyNow(product);
              }}
              className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-750 text-white font-semibold rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>Bli</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className="w-full py-1.5 sm:py-2 px-2 sm:px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? 'Hapur' : 'Detaje'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
