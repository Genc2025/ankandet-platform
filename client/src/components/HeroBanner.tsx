import React from 'react';
import { ShieldCheck, Zap, Truck, Clock, Sparkles, Flame, ArrowRight, Gavel, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface HeroBannerProps {
  spotlightProduct?: Product | null;
  onSelectProduct?: (product: Product) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ spotlightProduct, onSelectProduct }) => {
  const { formatBoth } = useCurrency();

  return (
    <div className="relative w-full max-w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 shadow-2xl border border-amber-500/20">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-amber-600/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Left Column: Headline, Description & Features */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-bold backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
              <span>Platforma #1 e Ankandeve në Kosovë</span>
            </div>

            <h1 className="text-2xl sm:text-5xl font-black tracking-tight leading-tight">
              Ankande Reale me <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">Oferta të Drejtpërdrejta</span> dhe Bli Menjëherë.
            </h1>

            <p className="text-slate-300 text-xs sm:text-base max-w-2xl leading-relaxed font-normal">
              Bli pajisje origjinale, automjete, elektronikë dhe vegla pune me çmime të jashtëzakonshme. Sistemi inteligjent me <strong>Proxy Bidding</strong>, <strong>Mbrojtje nga Sniping</strong> dhe dërgim me postë në Kosovë & Shqipëri.
            </p>

            {/* Badges */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 text-xs">
              <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 transition-colors min-w-0">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <div className="min-w-0 truncate">
                  <p className="font-bold text-white text-[10px] sm:text-[11px] truncate">Proxy Bidding</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Ofertim automatik</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 transition-colors min-w-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0 truncate">
                  <p className="font-bold text-white text-[10px] sm:text-[11px] truncate">Anti-Sniping</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Zgjatje sekonda</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 transition-colors min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
                <div className="min-w-0 truncate">
                  <p className="font-bold text-white text-[10px] sm:text-[11px] truncate">Klasa A / B / C</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Gjendje e testuar</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 transition-colors min-w-0">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
                <div className="min-w-0 truncate">
                  <p className="font-bold text-white text-[10px] sm:text-[11px] truncate">Postë në Kosovë</p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Para në dorë</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Featured Spotlight Lot (Hot Lot Card) */}
          <div className="lg:col-span-5">
            {spotlightProduct ? (
              <div 
                onClick={() => onSelectProduct?.(spotlightProduct)}
                className="group relative bg-white/10 hover:bg-white/15 backdrop-blur-xl border-2 border-amber-400/50 hover:border-amber-400 rounded-3xl p-5 transition-all duration-300 shadow-2xl hover:scale-[1.02] cursor-pointer"
              >
                {/* Floating Live Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-rose-400 fill-current" />
                    Spotlight • Ankandi i Momentit
                  </span>
                  <span className="text-[10px] text-amber-300 font-mono font-bold">
                    SKU: {spotlightProduct.sku}
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5 aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-white/15">
                    <img
                      src={spotlightProduct.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'}
                      alt={spotlightProduct.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="col-span-7 space-y-1.5">
                    <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-amber-300 transition-colors">
                      {spotlightProduct.title}
                    </h3>

                    <div className="pt-1">
                      <span className="text-[10px] text-slate-300 uppercase block font-semibold">Oferta Aktuale</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                          {formatBoth(spotlightProduct.current_price).primary}
                        </span>
                        <span className="text-[11px] text-slate-300 font-mono">
                          {formatBoth(spotlightProduct.current_price).secondary}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium pt-1 border-t border-white/10">
                      <span>{spotlightProduct.total_bids} oferta bërë</span>
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        Shiko Detajet <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full mt-3.5 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Kliko për të Hapur & Ofertuar Tani</span>
                </button>
              </div>
            ) : (
              /* Fallback explanatory box */
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Si funksionon ankandi?</span>
                  <span className="text-xs font-normal text-amber-300">Shpejt & Sigurt</span>
                </h3>

                <div className="space-y-2.5 text-xs text-slate-200">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <p><strong>Vendos Ofertën:</strong> Zgjidh manualisht ose vendos ofertë maksimale (proxy).</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <p><strong>Anti-Sniping:</strong> Ofertat në minutat e fundit shtojnë kohë shtesë për barazi.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <p><strong>Fito & Prano:</strong> Produkti ju dërgohet me korrier në gjithë territorin e Kosovës.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Trust Metric Counters Bar */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-center">
          <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/5">
            <span className="text-lg sm:text-2xl font-black text-amber-400 font-mono block">9,000+</span>
            <span className="text-[10px] sm:text-[11px] text-slate-300 font-medium">Artikuj në Magazinë</span>
          </div>

          <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/5">
            <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono block">1,280+</span>
            <span className="text-[10px] sm:text-[11px] text-slate-300 font-medium">Ofertues Aktivë Sot</span>
          </div>

          <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/5">
            <span className="text-lg sm:text-2xl font-black text-yellow-300 font-mono block">24–48h</span>
            <span className="text-[10px] sm:text-[11px] text-slate-300 font-medium">Dërgesë në Kosovë</span>
          </div>

          <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/5">
            <span className="text-lg sm:text-2xl font-black text-blue-400 font-mono block">100%</span>
            <span className="text-[10px] sm:text-[11px] text-slate-300 font-medium">Pagesë Para në Dorë</span>
          </div>
        </div>
      </div>
    </div>
  );
};
