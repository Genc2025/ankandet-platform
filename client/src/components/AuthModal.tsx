import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { api, setAuthToken } from '../api';
import { User as UserType } from '../types';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

const KOSOVO_CITIES = [
  'Prishtinë', 'Prizren', 'Pejë', 'Ferizaj', 'Gjilan', 'Gjakovë', 'Mitrovicë',
  'Vushtrri', 'Podujevë', 'Fushë Kosovë', 'Suharekë', 'Rahovec', 'Malishevë',
  'Drenas', 'Lipjan', 'Deçan', 'Klinë', 'Skenderaj', 'Istog'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Prishtinë');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const res = await api.login({ email, password });
        setAuthToken(res.token);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register({
          email,
          password,
          full_name: fullName,
          phone,
          city,
          address
        });
        setAuthToken(res.token);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ndodhi një gabim.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role: 'admin' | 'buyer') => {
    if (role === 'admin') {
      setEmail('admin@ankandet.al');
      setPassword('Admin123!');
      setMode('login');
    } else {
      setEmail('agron.m@gmail.com');
      setPassword('Klienti123!');
      setMode('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 cursor-pointer ${
              mode === 'login' ? 'border-amber-500 text-amber-900 dark:text-amber-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Kyçu në Llogari
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 cursor-pointer ${
              mode === 'register' ? 'border-amber-500 text-amber-900 dark:text-amber-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Krijo Llogari të Re
          </button>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Emri dhe Mbiemri</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="p.sh. Agron Morina"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Adresa</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shembull@email.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fjalëkalimi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Të paktën 6 karaktere"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefoni</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+383 44..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Komuna në Kosovë</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                  >
                    {KOSOVO_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Adresa e Banimit</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Lagjja, Rruga, Numri i banesës"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Duke procesuar...' : (mode === 'login' ? 'Kyçu Tani' : 'Krijo Llogarinë')}
          </button>

          {/* Quick Demo Credentials Autofill */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] text-slate-400 font-semibold mb-2 text-center">
              Llogari Testuese të Gatshme:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickDemo('buyer')}
                className="py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-left font-medium cursor-pointer"
              >
                👤 Klient Test (Agron)
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin')}
                className="py-1.5 px-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg text-purple-800 dark:text-purple-300 text-left font-medium cursor-pointer"
              >
                ⚡ Administrator Kryesor
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
