import React, { useState } from 'react';
import { X, ShoppingBag, Truck, CheckCircle, ShieldCheck, MapPin, Phone, User as UserIcon } from 'lucide-react';
import { Product, User } from '../types';
import { api } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import confetti from 'canvas-confetti';

interface BuyNowModalProps {
  product: Product;
  user: User | null;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

const KOSOVO_CITIES = [
  'Prishtinë', 'Prizren', 'Pejë', 'Ferizaj', 'Gjilan', 'Gjakovë', 'Mitrovicë',
  'Vushtrri', 'Podujevë', 'Fushë Kosovë', 'Suharekë', 'Rahovec', 'Malishevë',
  'Drenas', 'Lipjan', 'Deçan', 'Klinë', 'Skenderaj', 'Istog', 'Kaçanik', 'Shtime'
];

export const BuyNowModal: React.FC<BuyNowModalProps> = ({
  product,
  user,
  onClose,
  onSuccess,
  onOpenAuth
}) => {
  const [shippingName, setShippingName] = useState(user?.full_name || '');
  const [shippingPhone, setShippingPhone] = useState(user?.phone || '');
  const [shippingCity, setShippingCity] = useState(user?.city || 'Prishtinë');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'bank_transfer' | 'card'>('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { formatBoth, formatPrice } = useCurrency();

  const price = product.buy_now_price || product.current_price;
  const shippingFee = 3.00; // Kosovo courier standard
  const total = price + shippingFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }

    if (!shippingName || !shippingPhone || !shippingAddress) {
      setErrorMsg('Ju lutem plotësoni të gjitha fushat e transportit.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.buyNow(product.id, {
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_city: shippingCity,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        notes
      });

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onSuccess(res.orderNumber);
    } catch (err: any) {
      setErrorMsg(err.message || 'Dështoi përfundimi i blerjes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Bli Menjëherë (Porosi e Drejtpërdrejtë)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCheckout} className="p-6 space-y-4">
          {/* Item summary */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-750 flex items-center gap-3">
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'}
              alt={product.title}
              className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">SKU: {product.sku}</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{product.title}</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Çmimi: {formatPrice(price, { showBoth: true })}</p>
            </div>
          </div>

          {/* Shipping Form for Kosovo */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Të Dhënat e Transportit në Kosovë
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emri & Mbiemri i Pranuesit</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  placeholder="p.sh. Agron Morina"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Numri i Telefonit</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    placeholder="044 / 049 / 045..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Qyteti (Komuna)</label>
                <select
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  {KOSOVO_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Adresa e Saktë e Dorëzimit</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <textarea
                  rows={2}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Rruga, lagjja, numri i ndërtesës ose orientimi..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment method selection */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Mënyra e Pagesës</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 ${
                paymentMethod === 'cash_on_delivery' 
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-900 dark:text-amber-200 font-bold' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={() => setPaymentMethod('cash_on_delivery')}
                  className="text-amber-600"
                />
                <span>Para në dorë (Cash on Delivery)</span>
              </label>

              <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 ${
                paymentMethod === 'bank_transfer' 
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-900 dark:text-amber-200 font-bold' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="text-amber-600"
                />
                <span>Transfer Bankar (BKT, TEB, NLB)</span>
              </label>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between">
              <span>Çmimi i artikullit:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(price, { showBoth: true })}</span>
            </div>
            <div className="flex justify-between">
              <span>Transporti në Kosovë (Postë e Shpejtë):</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(shippingFee, { showBoth: true })}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-black text-slate-900 dark:text-white">
              <span>Totali për Pagesë:</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">{formatPrice(total, { showBoth: true })}</span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-800">
              {errorMsg}
            </p>
          )}

          {/* Action buttons */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-50 text-white dark:text-slate-950 font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-slate-950" />
            {loading ? 'Duke procesuar porosinë...' : `Konfirmo Blerjen: ${formatPrice(total, { showBoth: true })}`}
          </button>
        </form>
      </div>
    </div>
  );
};
