import React, { useState } from 'react';
import { Gavel, Search, Heart, User as UserIcon, Shield, ShoppingBag, LogOut, LayoutDashboard, Menu, X, Bell, Coins, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  user: User | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenDashboard: (tab?: string) => void;
  onOpenAdmin: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  watchlistCount: number;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onOpenDashboard,
  onOpenAdmin,
  searchTerm,
  onSearchChange,
  watchlistCount,
  currentView,
  onViewChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { currency, setCurrency, rate } = useCurrency();
  const { toggleTheme, isDark } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Top micro-bar for Kosovo info & Currency display */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-300 text-xs py-1.5 px-3 sm:px-4 border-b border-slate-800 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium text-[11px] sm:text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Platformë e Gjallë Ankandesh
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline">🇦🇱 Transport në Kosovë & Shqipëri</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-[11px]">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Kursi: <strong>1 € = {rate} L</strong></span>
            </div>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">Pagesë me Para në Dorë</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline font-mono text-amber-300">Mbështetja: +383 44 000 000</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div 
            onClick={() => { onViewChange('marketplace'); }}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Gavel className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">ANKANDET</span>
                <span className="text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">.KS</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider -mt-0.5">Ankande Online Kosovë</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Kërkoni sipas titullit, kategorisë ose SKU (p.sh. iPhone, Bosch, BMW, ANK-...)"
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Pastro
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Currency Switcher: EUR (€) vs LEK (L) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black shrink-0">
              <button
                type="button"
                onClick={() => setCurrency('EUR')}
                className={`px-1.5 sm:px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  currency === 'EUR'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Shfaq çmimet në Euro (€)"
              >
                €<span className="hidden sm:inline"> EUR</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrency('ALL')}
                className={`px-1.5 sm:px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  currency === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={`Shfaq çmimet në Lek shqiptar (1 € = ${rate} L)`}
              >
                L<span className="hidden sm:inline"> LEK</span>
              </button>
            </div>

            {/* Day & Night (Dark Mode) Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title={isDark ? "Kalo në modalitetin Ditë (Light Mode)" : "Kalo në modalitetin Natë (Dark Mode)"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Watchlist button */}
            <button
              onClick={() => {
                if (!user) onOpenAuth('login');
                else onOpenDashboard('watchlist');
              }}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Lista e Preferuar"
            >
              <Heart className="w-5 h-5" />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {watchlistCount}
                </span>
              )}
            </button>

            {/* User authenticated menu or Login/Register buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors text-slate-800 dark:text-slate-200 text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.full_name.substring(0, 2)}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{user.full_name}</span>
                  {user.role === 'admin' && (
                    <span className="hidden lg:inline bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      ADMIN
                    </span>
                  )}
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-slate-950/60 border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Kyçur si</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenDashboard('bids');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-2.5"
                      >
                        <Gavel className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        Ofertat e Mia Aktive
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenDashboard('orders');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-2.5"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Ankandet e Fituara & Porositë
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenDashboard('watchlist');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-2.5"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        Lista e Preferuar
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenDashboard('profile');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-800 dark:hover:text-amber-400 flex items-center gap-2.5"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        Cilësimet e Llogarisë
                      </button>

                      {user.role === 'admin' && (
                        <>
                          <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenAdmin();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-purple-700 dark:text-purple-300 font-semibold bg-purple-50/50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 flex items-center gap-2.5"
                          >
                            <LayoutDashboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            Paneli Administrativ
                          </button>
                        </>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5"
                      >
                        <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
                        Dil nga Llogaria
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Kyçu
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-colors"
                >
                  Regjistrohu
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Kërkoni produkte..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {/* Currency selector mobile */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Valuta:</span>
              <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">
                <button
                  type="button"
                  onClick={() => setCurrency('EUR')}
                  className={`px-3 py-1 rounded-md cursor-pointer ${currency === 'EUR' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  € EUR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('ALL')}
                  className={`px-3 py-1 rounded-md cursor-pointer ${currency === 'ALL' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  L LEK
                </button>
              </div>
            </div>

            {/* Day & Night toggle mobile */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Pamja (Dita / Nata):</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-amber-400 font-bold cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ditë ☀️</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span>Natë 🌙</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                onViewChange('marketplace');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Të Gjitha Ankandet
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40"
              >
                Paneli Administrativ
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
