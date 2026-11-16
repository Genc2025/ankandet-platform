import React, { useState, useEffect } from 'react';
import { 
  X, Clock, Gavel, ShieldCheck, Heart, Zap, Truck, AlertTriangle, 
  CheckCircle, ArrowRight, ShoppingCart, UserCheck, Info 
} from 'lucide-react';
import { Product, Bid, User } from '../types';
import { api } from '../api';
import { playSound } from '../socket';
import confetti from 'canvas-confetti';

interface AuctionModalProps {
  product: Product;
  user: User | null;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onBuyNowClick: (product: Product) => void;
  onBidSuccess: () => void;
  onToggleWatchlist: (productId: number) => void;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  product,
  user,
  onClose,
  onOpenAuth,
  onBuyNowClick,
  onBidSuccess,
  onToggleWatchlist
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [bidAmount, setBidAmount] = useState<number>(product.min_next_bid || product.current_price + 2);
  const [isProxy, setIsProxy] = useState<boolean>(true); // Default to proxy bidding as standard modern practice
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Time left calculation
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
      const isUrgent = diff <= 5 * 60 * 1000;

      setTimeLeft({ days, hours, minutes, seconds, isEnded: false, isUrgent });
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [product.auction_end, product.status]);

  // Load live bid history
  const loadHistory = async () => {
    try {
      const res = await api.getAuctionById(product.id);
      setBidHistory(res.bidHistory || []);
    } catch (e) {
      // Ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [product.id, product.current_price, product.total_bids]);

  // Update default bid amount when price changes
  useEffect(() => {
    const min = product.total_bids === 0 ? product.starting_price : product.current_price + product.min_bid_increment;
    setBidAmount(min);
  }, [product.current_price, product.total_bids, product.min_bid_increment]);

  const handlePlaceBid = async () => {
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

      onBidSuccess();
      loadHistory();
    } catch (err: any) {
      setErrorMsg(err.message || 'Dështoi vendosja e ofertës.');
      playSound('outbid');
    } finally {
      setLoading(false);
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'];

  const conditionBadges = {
    A: { label: 'Klasa A (Si e re / Paketim origjinal)', bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30' },
    B: { label: 'Klasa B (E përdorur në gjendje të mirë)', bg: 'bg-blue-500/10 text-blue-800 border-blue-500/30' },
    C: { label: 'Klasa C (Shenja përdorimi / Testuar)', bg: 'bg-amber-500/10 text-amber-900 border-amber-500/30' }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
              SKU: {product.sku}
            </span>
            <span className="text-xs text-slate-500">
              Kategoria: <strong>{product.category_name || 'Të përgjithshme'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(product.id)}
              className={`p-2 rounded-xl transition-colors ${
                product.is_watched ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${product.is_watched ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Photos & Details */}
          <div className="lg:col-span-7 space-y-5">
            {/* Main Active Photo */}
            <div className="relative aspect-4/3 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
              <img
                src={images[activeImageIdx]}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {/* Anti-Sniping active indicator on photo */}
              {product.anti_snip_count > 0 && (
                <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce">
                  <Zap className="w-4 h-4 fill-current" />
                  Anti-Sniping aktiv: Zgjatur +{product.anti_snip_count * 3} minuta!
                </div>
              )}
            </div>

            {/* Thumbnail list */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIdx === idx ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Condition grade specification */}
            <div className={`p-4 rounded-2xl border ${conditionBadges[product.condition_grade]?.bg || 'bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  {conditionBadges[product.condition_grade]?.label}
                </h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {product.condition_details || 'Inspektuar teknikisht nga ekipi i ekspertëve. Funksionim 100% i verifikuar.'}
              </p>
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-900">Përshkrimi i Artikullit</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description || 'Nuk ka përshkrim shtesë për këtë artikull.'}
              </p>
            </div>

            {/* Kosovo shipping guarantee */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
              <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Transporti në Kosovë (Postë e Shpejtë)</p>
                <p>Dorëzim brenda 24-48 orëve në të gjitha komunat e Kosovës. Tarifa fikse <strong>€3.00</strong>. Pagesë me para në dorë pasi ta kontrolloni pakon.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Bidding Console */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {product.title}
              </h2>

              {/* Countdown timer card */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                timeLeft.isEnded
                  ? 'bg-slate-100 border-slate-200 text-slate-600'
                  : timeLeft.isUrgent
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50/60 border-amber-200/80 text-amber-950'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${timeLeft.isUrgent ? 'text-rose-600 animate-spin' : 'text-amber-600'}`} />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Koha e Mbetur</p>
                    <p className="text-base font-black font-mono">
                      {timeLeft.isEnded ? 'Ankandi ka përfunduar' : (
                        `${timeLeft.days > 0 ? `${timeLeft.days} ditë ` : ''}${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Oferta Gjithsej</span>
                  <span className="text-base font-bold text-slate-800">{product.total_bids}</span>
                </div>
              </div>

              {/* Price card */}
              <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-lg space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Çmimi Aktual më i Lartë</p>
                    <p className="text-3xl font-black text-white">
                      €{product.current_price.toFixed(2)}
                    </p>
                  </div>
                  {product.winner_name && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Ofertuesi Kryesor</p>
                      <p className="text-xs font-mono font-bold text-amber-400">{product.winner_name}</p>
                    </div>
                  )}
                </div>

                {/* Reserve price status */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  {product.reserve_price > 0 ? (
                    product.current_price >= product.reserve_price ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Çmimi rezervë u arrit! Artikulli do të shitet.
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Çmimi rezervë nuk është arritur ende.
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400">Ky artikull shitet pa çmim rezervë (çdo ofertë vlen).</span>
                  )}
                </div>

                {/* User's own proxy bid status */}
                {product.user_proxy && (
                  <div className="bg-slate-800/80 p-2.5 rounded-xl text-xs text-slate-300 flex items-center justify-between">
                    <span>Oferta juaj maksimale (Proxy):</span>
                    <strong className="text-amber-400 font-mono">€{product.user_proxy.toFixed(2)}</strong>
                  </div>
                )}
              </div>

              {/* Bidding box if active */}
              {product.status === 'active' && !timeLeft.isEnded ? (
                <div className="space-y-4 pt-2">
                  {/* Preset increment quick buttons */}
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1.5">Zgjedhje e shpejtë e vlerës:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 5, 10, 25].map((inc) => {
                        const val = product.current_price + inc;
                        return (
                          <button
                            key={inc}
                            type="button"
                            onClick={() => setBidAmount(val)}
                            className="py-1.5 px-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
                          >
                            +€{inc} (€{val.toFixed(0)})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Bid Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Shuma e Ofertës Tuaj (€ EUR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
                      <input
                        type="number"
                        step="1"
                        min={product.min_next_bid}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Oferta minimale e lejuar: <strong>€{product.min_next_bid.toFixed(2)}</strong>
                    </p>
                  </div>

                  {/* Proxy Bidding Checkbox Option */}
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isProxy}
                        onChange={(e) => setIsProxy(e.target.checked)}
                        className="mt-1 w-4 h-4 text-amber-600 rounded-sm border-slate-300 focus:ring-amber-500"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-600 fill-current" />
                          Ofertim Automatik (Proxy Bidding)
                        </span>
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          Sistemi ofertom për ju automatikisht hap pas hapi deri në shumën maksimale, vetëm aq sa duhet për të mbetur fitues.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Notifications / Alerts */}
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* Submit Bid Button */}
                  <button
                    onClick={handlePlaceBid}
                    disabled={loading || bidAmount < product.min_next_bid}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Gavel className="w-4 h-4" />
                    {loading ? 'Duke dërguar ofertën...' : (
                      isProxy ? `Konfirmo Ofertën Maksimale: €${bidAmount.toFixed(2)}` : `Vendos Ofertën: €${bidAmount.toFixed(2)}`
                    )}
                  </button>

                  {/* Buy Now alternative button if present */}
                  {product.buy_now_price && product.buy_now_price > 0 && (
                    <button
                      onClick={() => onBuyNowClick(product)}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4 text-amber-400" />
                      Bli Menjëherë me Çmim Fiks: €{product.buy_now_price.toFixed(2)}
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-100 rounded-2xl text-center text-sm font-semibold text-slate-600">
                  Ky ankand ka përfunduar.
                </div>
              )}

              {/* Bid History Accordion / List */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <h4 className="font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span>Historia e Ofertave ({bidHistory.length})</span>
                  <span className="text-[11px] font-normal text-slate-400">Anonimizuar për siguri</span>
                </h4>

                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {loadingHistory ? (
                    <p className="text-slate-400 text-center py-2">Duke ngarkuar ofertat...</p>
                  ) : bidHistory.length === 0 ? (
                    <p className="text-slate-400 text-center py-2">Nuk ka asnjë ofertë ende. Bëhu i pari!</p>
                  ) : (
                    bidHistory.map((bid, i) => (
                      <div 
                        key={bid.id || i}
                        className={`flex items-center justify-between p-2 rounded-xl border ${
                          bid.is_winning 
                            ? 'bg-amber-500/10 border-amber-500/30 font-bold text-slate-900' 
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-mono">
                            {i + 1}
                          </span>
                          <span>{bid.bidder_name}</span>
                          {bid.is_winning === 1 && (
                            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-semibold">
                              Kryesues
                            </span>
                          )}
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold">€{bid.amount.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(bid.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
