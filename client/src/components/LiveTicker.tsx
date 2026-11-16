import React, { useEffect, useState } from 'react';
import { Flame, MapPin, Zap, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { realtime } from '../socket';
import { useCurrency } from '../context/CurrencyContext';

interface TickerItem {
  id: string;
  type: 'bid' | 'snip' | 'win' | 'hot';
  city: string;
  text: string;
  timeAgo: string;
}

const DEFAULT_ITEMS: TickerItem[] = [
  { id: '1', type: 'bid', city: 'Prishtinë', text: 'Agron M. ofroi 45 € për "Bosch Professional GBH"', timeAgo: 'para 25 sek' },
  { id: '2', type: 'snip', city: 'Prizren', text: 'Anti-Sniping zgjati ankandin +3 min për "iPhone 13"', timeAgo: 'para 1 min' },
  { id: '3', type: 'win', city: 'Ferizaj', text: 'Blerës bleu menjëherë "Set Veglash Stanley 120 copë"', timeAgo: 'para 2 min' },
  { id: '4', type: 'hot', city: 'Pejë', text: '12 oferta të reja në kategorinë "Elektronikë & TV"', timeAgo: 'para 3 min' },
  { id: '5', type: 'bid', city: 'Gjilan', text: 'Ofertimi automatik (Proxy) mbronte çmimin në 38 €', timeAgo: 'para 4 min' },
  { id: '6', type: 'win', city: 'Mitrovicë', text: 'Pakoja u dërgua me sukses me postë të shpejtë', timeAgo: 'para 5 min' },
];

export const LiveTicker: React.FC = () => {
  const [items, setItems] = useState<TickerItem[]>(DEFAULT_ITEMS);
  const { formatPrice } = useCurrency();

  // Listen for live socket bid updates and prepend to ticker
  useEffect(() => {
    const unsub = realtime.subscribe((event) => {
      if (event.type === 'BID_UPDATE') {
        const { winnerName, currentPrice, antiSnipExtended } = event.payload;
        const newItem: TickerItem = {
          id: String(Date.now()),
          type: antiSnipExtended ? 'snip' : 'bid',
          city: 'Kosovë',
          text: `${winnerName || 'Ofertues'} ofroi ${formatPrice(currentPrice)} ${antiSnipExtended ? '(Anti-Snip +3m)' : ''}`,
          timeAgo: 'sapo'
        };
        setItems(prev => [newItem, ...prev.slice(0, 7)]);
      }
    });

    return () => unsub();
  }, [formatPrice]);

  return (
    <div className="w-full max-w-full overflow-hidden bg-slate-900/95 dark:bg-slate-950/90 text-slate-300 border-b border-slate-800 text-xs py-2 shadow-inner backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center gap-2 sm:gap-3 overflow-hidden">
        {/* Fixed Live Label */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Live</span>
        </div>

        {/* Continuous Smooth Auto-scrolling Ticker Track */}
        <div className="flex-1 min-w-0 overflow-hidden relative select-none">
          <div className="animate-ticker flex items-center gap-8 whitespace-nowrap text-[11px]">
            {[...items, ...items].map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="inline-flex items-center gap-1.5 shrink-0 text-slate-300">
                {item.type === 'bid' && <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                {item.type === 'snip' && <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />}
                {item.type === 'win' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                {item.type === 'hot' && <Flame className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}

                <span className="font-bold text-amber-300">[{item.city}]</span>
                <span>{item.text}</span>
                <span className="text-slate-500 font-mono text-[10px]">({item.timeAgo})</span>
                <span className="text-slate-700 ml-4">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kosovo Fast Delivery Badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 shrink-0 pl-3 border-l border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Posta në Kosovë 24–48h</span>
        </div>
      </div>
    </div>
  );
};
