import React, { useState, useEffect } from 'react';
import { 
  Gavel, Filter, ShieldCheck, Zap, Truck, ShoppingBag, 
  Sparkles, CheckCircle, AlertTriangle, ArrowUpDown, RefreshCw, X, 
  Flame, Clock, Star, Layers, LayoutGrid, Grid3X3, List,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { Product, Category, User } from './types';
import { api, setAuthToken } from './api';
import { realtime, playSound } from './socket';

import { Navbar } from './components/Navbar';
import { LiveTicker } from './components/LiveTicker';
import { HeroBanner } from './components/HeroBanner';
import { ExpandableProductGrid } from './components/ExpandableProductGrid';
import { BuyNowModal } from './components/BuyNowModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'marketplace' | 'dashboard' | 'admin'>('marketplace');
  const [dashboardTab, setDashboardTab] = useState<string>('bids');

  // Market filters & data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [onlyBuyNow, setOnlyBuyNow] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('ending_soon');
  const [activeSection, setActiveSection] = useState<'all' | 'ending_soon' | 'newest' | 'buy_now' | 'popular'>('all');
  const [watchlistCount, setWatchlistCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'list'>('grid');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const pageSize = 48;

  // Global Inline Expansion State
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

  // Debounce search term to avoid query spamming and race conditions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle Spotlight lot click with smooth scroll to grid
  const handleSpotlightSelect = (product: Product) => {
    setExpandedProductId(product.id);
    setTimeout(() => {
      const anchor = document.getElementById('marketplace-grid-anchor');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  // Active Modals
  const [quickBuyProduct, setQuickBuyProduct] = useState<Product | null>(null);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'register' }>({
    open: false,
    mode: 'login'
  });

  // Real-time toast alert banner
  const [toastAlert, setToastAlert] = useState<{ message: string; type: 'info' | 'warn' | 'success' } | null>(null);

  // Check URL query param for direct shared product expansion (e.g. ?product=5)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('product');
    if (pId) {
      const parsed = parseInt(pId, 10);
      if (!isNaN(parsed)) {
        setExpandedProductId(parsed);
      }
    }
  }, []);

  // Initial user session load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.getMe();
        setUser(res.user);
        setWatchlistCount(res.stats.watchlist_count || 0);
        realtime.identifyUser(res.user.id);
      } catch (e) {
        setUser(null);
      }
    }
    checkAuth();
  }, []);

  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.getCategories();
        setCategories(res.categories || []);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    }
    fetchCategories();
  }, []);

  // Load products when filters or page change
  const fetchProducts = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await api.getAuctions({
        search: debouncedSearch,
        category: selectedCategory,
        condition: selectedCondition,
        buy_now: onlyBuyNow ? '1' : '',
        sort: sortBy,
        page: targetPage,
        limit: pageSize
      });
      setProducts(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalProducts(res.pagination.total || 0);
        setPage(res.pagination.page || targetPage);
      }
    } catch (e) {
      console.error('Failed to load auctions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [debouncedSearch, selectedCategory, selectedCondition, onlyBuyNow, sortBy, page]);

  // WebSocket Live Real-Time Events
  useEffect(() => {
    const unsubscribe = realtime.subscribe((event) => {
      if (event.type === 'BID_UPDATE') {
        const { productId, currentPrice, winnerId, winnerName, totalBids, antiSnipExtended, newEndTime, reserveMet } = event.payload;

        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === productId) {
              return {
                ...p,
                current_price: currentPrice,
                current_winner_id: winnerId,
                winner_name: winnerName,
                total_bids: totalBids,
                auction_end: newEndTime || p.auction_end,
                anti_snip_count: antiSnipExtended ? p.anti_snip_count + 1 : p.anti_snip_count,
                reserve_met: reserveMet
              };
            }
            return p;
          })
        );
      } else if (event.type === 'OUTBID_ALERT') {
        playSound('outbid');
        showToast(`⚠️ Jeni tejkaluar në ankandin: "${event.payload.productTitle}"! Oferta e re: €${event.payload.newPrice}`, 'warn');
      } else if (event.type === 'SNIPING_ALERT') {
        playSound('extended');
        showToast(`⏳ ${event.payload.message} (${event.payload.productTitle})`, 'info');
      } else if (event.type === 'AUCTION_SOLD') {
        fetchProducts();
      }
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'info' | 'warn' | 'success' = 'info') => {
    setToastAlert({ message, type });
    setTimeout(() => {
      setToastAlert((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  const handleToggleWatchlist = async (productId: number) => {
    if (!user) {
      setAuthModal({ open: true, mode: 'login' });
      return;
    }

    try {
      const res = await api.toggleWatchlist(productId);
      setProducts((prev) =>
        prev.map((p) => p.id === productId ? { ...p, is_watched: res.watched } : p)
      );

      setWatchlistCount((count) => res.watched ? count + 1 : Math.max(0, count - 1));
      showToast(res.message, 'success');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setCurrentView('marketplace');
    showToast('Keni dalë me sukses nga llogaria.', 'info');
  };

  // Section switcher
  const handleSectionChange = (section: 'all' | 'ending_soon' | 'newest' | 'buy_now' | 'popular') => {
    setActiveSection(section);
    setPage(1);
    if (section === 'all') {
      setSortBy('ending_soon');
      setOnlyBuyNow(false);
    } else if (section === 'ending_soon') {
      setSortBy('ending_soon');
      setOnlyBuyNow(false);
    } else if (section === 'newest') {
      setSortBy('newest');
      setOnlyBuyNow(false);
    } else if (section === 'buy_now') {
      setOnlyBuyNow(true);
    } else if (section === 'popular') {
      setSortBy('bids_high');
      setOnlyBuyNow(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-white transition-colors duration-200">
      {/* Real-time Floating Toast Alert */}
      {toastAlert && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs font-bold max-w-md ${
            toastAlert.type === 'warn' 
              ? 'bg-amber-500 text-slate-950 border-amber-600' 
              : toastAlert.type === 'success' 
              ? 'bg-emerald-600 text-white border-emerald-700' 
              : 'bg-slate-900 dark:bg-slate-800 text-white border-slate-800 dark:border-slate-700'
          }`}>
            <span>{toastAlert.message}</span>
            <button 
              onClick={() => setToastAlert(null)}
              className="p-1 rounded hover:bg-black/10 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        user={user}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
        onLogout={handleLogout}
        onOpenDashboard={(tab = 'bids') => {
          setDashboardTab(tab);
          setCurrentView('dashboard');
        }}
        onOpenAdmin={() => setCurrentView('admin')}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        watchlistCount={watchlistCount}
        currentView={currentView}
        onViewChange={(v: any) => setCurrentView(v)}
      />

      {/* Real-time Kosovo Bidding Ticker */}
      <LiveTicker />

      {/* Main Container Views */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {currentView === 'admin' && user?.role === 'admin' ? (
          <AdminDashboard
            onBackToMarketplace={() => setCurrentView('marketplace')}
            onRefreshAuctions={fetchProducts}
          />
        ) : currentView === 'dashboard' && user ? (
          <UserDashboard
            user={user}
            initialTab={dashboardTab}
            onSelectProduct={(p) => {
              setExpandedProductId(p.id);
              setCurrentView('marketplace');
            }}
            onUpdateUser={(updated) => setUser(updated)}
            onBackToMarketplace={() => setCurrentView('marketplace')}
            onToggleWatchlist={handleToggleWatchlist}
            onQuickBuyNow={(p) => setQuickBuyProduct(p)}
            onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
            onBidSuccess={fetchProducts}
          />
        ) : (
          <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Hero Banner with Spotlight Lot */}
            <HeroBanner 
              spotlightProduct={products[0]}
              onSelectProduct={handleSpotlightSelect}
            />

            {/* Anchor for smooth scroll when clicking spotlight lot or pagination */}
            <div id="marketplace-grid-anchor" className="scroll-mt-24" />

            {/* Quick Section Pills (Homepage, Ending Soon, New Arrivals, Buy Now, Featured) */}
            <div className="w-full max-w-full overflow-x-auto pb-1 scrollbar-none flex items-center gap-2">
              <button
                onClick={() => handleSectionChange('all')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeSection === 'all'
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-400 dark:text-amber-300" />
                <span>Të Gjitha Ankandet</span>
              </button>

              <button
                onClick={() => handleSectionChange('ending_soon')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeSection === 'ending_soon'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>Përfundojnë Së Shpejti</span>
              </button>

              <button
                onClick={() => handleSectionChange('newest')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeSection === 'newest'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Të Rejat e Fundit</span>
              </button>

              <button
                onClick={() => handleSectionChange('buy_now')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeSection === 'buy_now'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>Vetëm Bli Menjëherë</span>
              </button>

              <button
                onClick={() => handleSectionChange('popular')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeSection === 'popular'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-current" />
                <span>Më të Kërkuarat</span>
              </button>
            </div>

            {/* Category Filter Carousel / Pills */}
            <div className="w-full max-w-full overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === '' 
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md' 
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Të Gjitha Kategoritë
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === cat.slug 
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.active_count !== undefined && cat.active_count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {cat.active_count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Filter and Sorting Toolbar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" />
                  Gjendja:
                </span>

                <button
                  onClick={() => { setSelectedCondition(''); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    selectedCondition === '' ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Të gjitha
                </button>

                <button
                  onClick={() => { setSelectedCondition('A'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    selectedCondition === 'A' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  Klasa A (Si e re)
                </button>

                <button
                  onClick={() => { setSelectedCondition('B'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    selectedCondition === 'B' ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                  }`}
                >
                  Klasa B (E përdorur mirë)
                </button>

                <button
                  onClick={() => { setSelectedCondition('C'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    selectedCondition === 'C' ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                  }`}
                >
                  Klasa C (Shenja përdorimi)
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

                {/* Buy now toggle */}
                <button
                  onClick={() => { setOnlyBuyNow(!onlyBuyNow); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    onlyBuyNow ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Vetëm Bli Menjëherë
                </button>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Renditja:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="ending_soon">Përfundon më së Shpejti</option>
                  <option value="price_low">Çmimi: Më i Ulëti</option>
                  <option value="price_high">Çmimi: Më i Larti</option>
                  <option value="bids_high">Më Shumë Oferta</option>
                  <option value="newest">Më të Rejat</option>
                </select>
              </div>
            </div>

            {/* Auction Product Grid with Global Inline Expansion */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Ankande të Hapura ({totalProducts > 0 ? totalProducts.toLocaleString() : products.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Duke shfaqur {products.length} artikuj në faqen {page} nga {totalPages.toLocaleString()} • Kliko çdo kartë për ta rritur / zvogëluar
                  </p>
                </div>

                {/* View Switcher: 4-kolona, 6-kolona kompakte, listë */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs self-start sm:self-auto">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Pamje standarde (4 kolona)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Standard</span>
                  </button>

                  <button
                    onClick={() => setViewMode('compact')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'compact'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Pamje kompakte (6 kolona)"
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Kompakt</span>
                  </button>

                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Pamje listë"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Listë</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Duke ngarkuar artikujt e ankandit...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-16 text-center space-y-3">
                  <Gavel className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Nuk u gjet asnjë ankand me këto filtra</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Provoni të ndryshoni kategorinë ose kërkimin tuaj.</p>
                  <button
                    onClick={() => { 
                      setSelectedCategory(''); 
                      setSelectedCondition(''); 
                      setOnlyBuyNow(false); 
                      setSearchTerm(''); 
                      setActiveSection('all');
                      setSortBy('ending_soon');
                      setPage(1);
                    }}
                    className="px-4 py-2 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Pastro të Gjitha Filtrat
                  </button>
                </div>
              ) : (
                <>
                  <ExpandableProductGrid
                    products={products}
                    user={user}
                    onToggleWatchlist={handleToggleWatchlist}
                    onQuickBuyNow={(p) => setQuickBuyProduct(p)}
                    onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
                    onBidSuccess={fetchProducts}
                    expandedProductId={expandedProductId}
                    onExpandedChange={setExpandedProductId}
                    gridClassName={
                      viewMode === 'compact'
                        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3.5'
                        : viewMode === 'list'
                        ? 'grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'
                        : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5'
                    }
                  />

                  {/* Dynamic Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-full overflow-hidden">
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
                        Duke shfaqur faqe <strong className="text-slate-900 dark:text-white font-mono">{page}</strong> nga <strong className="text-slate-900 dark:text-white font-mono">{totalPages.toLocaleString()}</strong> ({totalProducts.toLocaleString()} artikuj gjithsej)
                      </div>

                      {/* Mobile Pagination Controls (< 640px) */}
                      <div className="flex sm:hidden items-center justify-between w-full max-w-full gap-2 select-none">
                        <button
                          onClick={() => {
                            if (page > 1) {
                              setPage(page - 1);
                              document.getElementById('marketplace-grid-anchor')?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          disabled={page <= 1}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs active:scale-95"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Prapa</span>
                        </button>

                        <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 font-mono text-center shrink-0">
                          {page} / {totalPages.toLocaleString()}
                        </div>

                        <button
                          onClick={() => {
                            if (page < totalPages) {
                              setPage(page + 1);
                              document.getElementById('marketplace-grid-anchor')?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          disabled={page >= totalPages}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs active:scale-95"
                        >
                          <span>Para</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Desktop Pagination Controls (>= 640px) */}
                      <div className="hidden sm:flex items-center gap-1.5 select-none">
                        {/* First page */}
                        <button
                          onClick={() => {
                            if (page > 1) {
                              setPage(1);
                              document.getElementById('marketplace-grid-anchor')?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          disabled={page <= 1}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Faqja e parë"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>

                        {/* Previous page */}
                        <button
                          onClick={() => {
                            if (page > 1) {
                              setPage(page - 1);
                              document.getElementById('marketplace-grid-anchor')?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          disabled={page <= 1}
                          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Prapa</span>
                        </button>

                        {/* Dynamic page numbers */}
                        {(() => {
                          const buttons = [];
                          const start = Math.max(1, page - 2);
                          const end = Math.min(totalPages, page + 2);

                          if (start > 1) {
                            buttons.push(
                              <button
                                key={1}
                                onClick={() => {
                                  setPage(1);
                                  document.getElementById('marketplace-grid-anchor')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-8 h-8 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                1
                              </button>
                            );
                            if (start > 2) {
                              buttons.push(<span key="dots-start" className="text-slate-400 text-xs px-1">...</span>);
                            }
                          }

                          for (let p = start; p <= end; p++) {
                            buttons.push(
                              <button
                                key={p}
                                onClick={() => {
                                  setPage(p);
                                  document.getElementById('marketplace-grid-anchor')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  p === page
                                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                {p}
                              </button>
                            );
                          }

                          if (end < totalPages) {
                            if (end < totalPages - 1) {
                              buttons.push(<span key="dots-end" className="text-slate-400 text-xs px-1">...</span>);
                            }
                            buttons.push(
                              <button
                                key={totalPages}
                                onClick={() => {
                                  setPage(totalPages);
                                  document.getElementById('marketplace-grid-anchor')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-8 h-8 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                {totalPages}
                              </button>
                            );
                          }

                          return buttons;
                        })()}

                        {/* Next page */}
                        <button
                          onClick={() => {
                            if (page < totalPages) {
                              setPage(page + 1);
                              document.getElementById('marketplace-grid-anchor')?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          disabled={page >= totalPages}
                          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Para</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Last page */}
                        <button
                          onClick={() => {
                            if (page < totalPages) {
                              setPage(totalPages);
                              document.getElementById('marketplace-grid-anchor')?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          disabled={page >= totalPages}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          title="Faqja e fundit"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Buy Now Modal (Checkout & Kosovo delivery address) */}
      {quickBuyProduct && (
        <BuyNowModal
          product={quickBuyProduct}
          user={user}
          onClose={() => setQuickBuyProduct(null)}
          onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
          onSuccess={(orderNumber) => {
            setQuickBuyProduct(null);
            fetchProducts();
            showToast(`Urime! Porosia juaj #${orderNumber} u krijua me sukses dhe po përgatitet për dërgim në Kosovë!`, 'success');
          }}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onSuccess={(newUser) => {
            setUser(newUser);
            realtime.identifyUser(newUser.id);
            fetchProducts();
            showToast(`Mirësevini, ${newUser.full_name}!`, 'success');
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Gavel className="w-4 h-4" />
              </div>
              <span className="text-base font-black text-white">ANKANDET.KS</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Platforma e parë e ankandeve profesionale në Kosovë me rregulla të qarta, proksi ofertim, mbrojtje nga sniping dhe dërgesë në 24-48 orë me postë.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Kategoritë Kryesore</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Elektronikë & TV</li>
              <li>Telefonë & Smart</li>
              <li>Vegla Pune & Makineri</li>
              <li>Pajisje Shtëpiake</li>
              <li>Pjesë Automjetesh</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Siguria & Garancia</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Mbrojtja e Ofertuesit</li>
              <li>Klasifikimi A/B/C i Verifikuar</li>
              <li>Postë me Para në Dorë</li>
              <li>Verifikimi i Produkteve</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Kontakti & Ndihma</h4>
            <p className="text-slate-400">Prishtinë, Kosovë</p>
            <p className="text-slate-400 font-mono mt-1">+383 44 000 000</p>
            <p className="text-slate-400 font-mono">info@ankandet.ks</p>
            <p className="text-amber-400 mt-2 font-medium">E Hënë – E Shtunë: 08:00 – 20:00</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-800 text-center text-slate-500">
          © {new Date().getFullYear()} Ankandet.ks. Të gjitha të drejtat të rezervuara. Platformë e hapur tregtare për Kosovë.
        </div>
      </footer>
    </div>
  );
}

export default App;
