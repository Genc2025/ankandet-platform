import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

export type Currency = 'EUR' | 'ALL';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rate: number; // e.g. 1 EUR = 100 ALL
  setRate: (r: number) => void;
  convert: (amountInEur: number) => number;
  formatPrice: (amountInEur: number, options?: { showBoth?: boolean }) => string;
  formatBoth: (amountInEur: number) => { primary: string; secondary: string };
  formatEur: (amount: number) => string;
  formatLek: (amountInEur: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('ankandet_currency');
    return (saved === 'ALL' || saved === 'EUR') ? saved : 'EUR';
  });

  const [rate, setRateState] = useState<number>(100.00);

  // Fetch live exchange rate from backend
  useEffect(() => {
    api.getExchangeRate()
      .then((res) => {
        if (res && res.rate && res.rate > 0) {
          setRateState(res.rate);
        }
      })
      .catch(() => {
        // Fallback to default 100.00
      });
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('ankandet_currency', c);
  };

  const setRate = (newRate: number) => {
    setRateState(newRate);
  };

  const convert = (amountInEur: number): number => {
    return amountInEur * rate;
  };

  const formatEur = (amount: number): string => {
    return '€' + (amount || 0).toFixed(2);
  };

  const formatLek = (amountInEur: number): string => {
    const lekValue = Math.round((amountInEur || 0) * rate);
    return new Intl.NumberFormat('sq-AL', { maximumFractionDigits: 0 }).format(lekValue) + ' L';
  };

  const formatBoth = (amountInEur: number): { primary: string; secondary: string } => {
    if (currency === 'ALL') {
      return {
        primary: formatLek(amountInEur),
        secondary: `~${formatEur(amountInEur)}`
      };
    }
    return {
      primary: formatEur(amountInEur),
      secondary: `~${formatLek(amountInEur)}`
    };
  };

  const formatPrice = (amountInEur: number, options: { showBoth?: boolean } = {}): string => {
    const { primary, secondary } = formatBoth(amountInEur);
    if (options.showBoth) {
      return `${primary} (${secondary})`;
    }
    return primary;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rate,
        setRate,
        convert,
        formatPrice,
        formatBoth,
        formatEur,
        formatLek
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
