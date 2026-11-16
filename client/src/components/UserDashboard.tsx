import React, { useState, useEffect } from 'react';
import { 
  Gavel, ShoppingBag, Heart, User as UserIcon, Shield, Truck, 
  CheckCircle, AlertCircle, ArrowUpRight, Clock, MapPin, Phone, Save 
} from 'lucide-react';
import { User, Product, Order } from '../types';
import { api } from '../api';
import { ExpandableProductGrid } from './ExpandableProductGrid';
import { useCurrency } from '../context/CurrencyContext';

interface UserDashboardProps {
  user: User;
  initialTab?: string;
  onSelectProduct: (product: Product) => void;
  onUpdateUser: (user: User) => void;
  onBackToMarketplace: () => void;
  onToggleWatchlist?: (productId: number) => void;
  onQuickBuyNow?: (product: Product) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onBidSuccess?: () => void;
}

const KOSOVO_CITIES = [
  'Prishtinë', 'Prizren', 'Pejë', 'Ferizaj', 'Gjilan', 'Gjakovë', 'Mitrovicë',
  'Vushtrri', 'Podujevë', 'Fushë Kosovë', 'Suharekë', 'Rahovec', 'Malishevë',
  'Drenas', 'Lipjan', 'Deçan', 'Klinë', 'Skenderaj', 'Istog'
];

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  initialTab = 'bids',
  onSelectProduct,
  onUpdateUser,
  onBackToMarketplace,
  onToggleWatchlist,
  onQuickBuyNow,
  onOpenAuth,
  onBidSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'bids' | 'orders' | 'watchlist' | 'profile'>(initialTab as any);
  const [bids, setBids] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [watchlist, setWatchlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice, formatBoth } = useCurrency();

  // Profile Form state
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState(user.city || 'Prishtinë');
  const [address, setAddress] = useState(user.address || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bids') {
        const res = await api.getMyBids();
        setBids(res.bids || []);
      } else if (activeTab === 'orders') {
        const res = await api.getOrders();
        setOrders(res.orders || []);
      } else if (activeTab === 'watchlist') {
        const res = await api.getMyWatchlist();
        setWatchlist(res.watchlist || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await api.updateProfile({
        full_name: fullName,
        phone,
        city,
        address
      });
      onUpdateUser(res.user);
      setProfileMsg('Të dhënat tuaja u ruajtën me sukses!');
    } catch (err: any) {
      setProfileMsg('Gabim: ' + err.message);
    }
  };

  const handleWatchlistToggle = async (productId: number) => {
    if (onToggleWatchlist) {
      onToggleWatchlist(productId);
    }
    // Update local state if in watchlist tab
    if (activeTab === 'watchlist') {
      setWatchlist((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">Në Përpunim</span>;
      case 'shipped':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">Nisur me Postë</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">Dorëzuar</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user.full_name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user.full_name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email} • Komuna: <strong>{user.city || 'Prishtinë'}</strong></p>
          </div>
        </div>

        <button
          onClick={onBackToMarketplace}
          className="self-start sm:self-auto px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        >
          Kthehu te Ankandet
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('bids')}
          className={`py-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'bids' ? 'border-amber-500 text-amber-900 dark:text-amber-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Gavel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Ofertat e Mia Aktive ({bids.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'orders' ? 'border-amber-500 text-amber-900 dark:text-amber-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Ankandet e Fituara & Porositë ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className={`py-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'watchlist' ? 'border-amber-500 text-amber-900 dark:text-amber-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          Lista e Preferuar ({watchlist.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'profile' ? 'border-amber-500 text-amber-900 dark:text-amber-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          Të Dhënat e Mia
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {/* BIDS TAB (Expandable Grid) */}
        {activeTab === 'bids' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kliko çdo kartë produkti për të hapur detajet e plota inline dhe për të rritur ofertën direkt këtu.
              </p>
            </div>

            {loading ? (
              <p className="text-center py-12 text-slate-400">Duke ngarkuar ofertat tuaja...</p>
            ) : bids.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                <Gavel className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Nuk keni asnjë ofertë aktive momentalisht</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Eksploroni artikujt në ankand dhe provoni sistemin e avancuar Proxy Bidding.
                </p>
                <button
                  onClick={onBackToMarketplace}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Shiko Ankandet Aktive
                </button>
              </div>
            ) : (
              <ExpandableProductGrid
                products={bids}
                user={user}
                onToggleWatchlist={handleWatchlistToggle}
                onQuickBuyNow={onQuickBuyNow || onSelectProduct}
                onOpenAuth={onOpenAuth || (() => {})}
                onBidSuccess={() => {
                  loadData();
                  onBidSuccess?.();
                }}
                gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              />
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-12 text-slate-400">Duke ngarkuar porositë tuaja...</p>
            ) : orders.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Nuk keni asnjë ankand të fituar ende</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Kur një ankand ku ju jeni ofertuesi më i lartë përfundon, ose blini me çmim fiks, porosia shfaqet këtu automatikisht.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                          Numri i Porosisë: #{order.order_number}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Data: {new Date(order.created_at).toLocaleDateString('sq-XK')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getOrderStatusBadge(order.order_status)}
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-300 font-semibold">
                          {order.payment_method === 'cash_on_delivery' ? 'Pagesë me para në dorë' : order.payment_method}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-8 flex gap-3.5">
                        <img
                          src={order.product_images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f'}
                          alt={order.product_title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                          loading="lazy"
                        />
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{order.product_title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {order.shipping_city}, {order.shipping_address}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {order.shipping_phone}
                            </span>
                          </div>
                          {order.tracking_number && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold">
                              Kodi i Gjurmimit të Postës: {order.tracking_number}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl space-y-1 text-xs border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Çmimi i fituar:</span>
                          <span className="font-semibold font-mono text-slate-900 dark:text-white">{formatPrice(order.final_price, { showBoth: true })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Transporti në Kosovë:</span>
                          <span className="font-semibold font-mono text-slate-900 dark:text-white">{formatPrice(order.shipping_fee, { showBoth: true })}</span>
                        </div>
                        <div className="pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                          <span>Totali:</span>
                          <span className="text-amber-600 dark:text-amber-400 font-mono">{formatPrice(order.total_amount, { showBoth: true })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WATCHLIST TAB (Expandable Grid) */}
        {activeTab === 'watchlist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kliko çdo kartë për të hapur detajet e plota inline, për të parë kohën e mbetur dhe për të ofertuar.
              </p>
            </div>

            {loading ? (
              <p className="text-center py-12 text-slate-400">Duke ngarkuar artikujt e preferuar...</p>
            ) : watchlist.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
                <Heart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Lista juaj e preferuar është e zbrazët</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Klikoni ikonën e zemrës në çdo produkt për ta ruajtur këtu dhe për të ndjekur lehtësisht ankandin.
                </p>
                <button
                  onClick={onBackToMarketplace}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Eksploro Ankandet
                </button>
              </div>
            ) : (
              <ExpandableProductGrid
                products={watchlist}
                user={user}
                onToggleWatchlist={handleWatchlistToggle}
                onQuickBuyNow={onQuickBuyNow || onSelectProduct}
                onOpenAuth={onOpenAuth || (() => {})}
                onBidSuccess={() => {
                  loadData();
                  onBidSuccess?.();
                }}
                gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              />
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Përditëso të Dhënat Personale</h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  profileMsg.includes('Gabim') ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {profileMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emri i Plotë</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Numri i Telefonit</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="044 / 049..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Komuna në Kosovë</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {KOSOVO_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Adresa e Shtëpisë / Biznesit</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rruga, numri i hyrjes, kati..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Ruaj Ndryshimet
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
