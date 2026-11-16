import { 
  User, Product, Category, Bid, Order, ActivityLog, AdminMetrics, 
  Expense, FinancialData, DailyChartPoint, SalesAnalytics, InventorySummary, AdminNotification 
} from './types';
import { 
  DEMO_CATEGORIES, DEMO_PRODUCTS, filterDemoAuctions, 
  DEMO_ADMIN_USER, DEMO_BUYER_USER, DEMO_USERS, DEMO_ORDERS, 
  DEMO_EXPENSES, DEMO_ADMIN_METRICS, DEMO_FINANCIALS, 
  DEMO_DAILY_CHART, DEMO_SALES_ANALYTICS, DEMO_INVENTORY, 
  DEMO_NOTIFICATIONS, DEMO_LOGS 
} from './mockData';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('ankandet_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('ankandet_token', token);
  } else {
    localStorage.removeItem('ankandet_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Ndodhi një gabim gjatë komunikimit me serverin.');
  }

  return data as T;
}

// In-memory demo states for static deployment (GitHub Pages)
let demoExpenses = [...DEMO_EXPENSES];
let demoNotifications = [...DEMO_NOTIFICATIONS];
let demoProducts = [...DEMO_PRODUCTS];

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    try {
      return await request<{ message: string; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    } catch {
      // Fallback auth on GitHub Pages
      const isAdmin = credentials.email.toLowerCase().includes('admin');
      const user: User = isAdmin ? DEMO_ADMIN_USER : { ...DEMO_BUYER_USER, email: credentials.email };
      const token = 'demo_token_' + (isAdmin ? 'admin' : 'buyer');
      setAuthToken(token);
      localStorage.setItem('ankandet_user_info', JSON.stringify(user));
      return {
        message: 'Kyçja u realizua me sukses!',
        token,
        user
      };
    }
  },

  register: async (data: { email: string; password: string; full_name: string; phone?: string; city?: string; address?: string }) => {
    try {
      return await request<{ message: string; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const user: User = {
        id: Date.now(),
        email: data.email,
        full_name: data.full_name,
        phone: data.phone || '',
        city: data.city || 'Prishtinë',
        address: data.address || '',
        role: 'buyer',
        status: 'active',
        created_at: new Date().toISOString()
      };
      const token = 'demo_token_buyer_' + user.id;
      setAuthToken(token);
      localStorage.setItem('ankandet_user_info', JSON.stringify(user));
      return {
        message: 'Regjistrimi u krye me sukses!',
        token,
        user
      };
    }
  },

  getMe: async () => {
    try {
      return await request<{ user: User; stats: { active_bids: number; won_auctions: number; watchlist_count: number } }>('/auth/me');
    } catch {
      const saved = localStorage.getItem('ankandet_user_info');
      const user: User = saved ? JSON.parse(saved) : DEMO_ADMIN_USER;
      return {
        user,
        stats: {
          active_bids: 3,
          won_auctions: 1,
          watchlist_count: 5
        }
      };
    }
  },

  updateProfile: async (profile: Partial<User> & { password?: string }) => {
    try {
      return await request<{ message: string; user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
    } catch {
      const saved = localStorage.getItem('ankandet_user_info');
      const current: User = saved ? JSON.parse(saved) : DEMO_ADMIN_USER;
      const updated = { ...current, ...profile };
      localStorage.setItem('ankandet_user_info', JSON.stringify(updated));
      return {
        message: 'Profili u përditësua me sukses!',
        user: updated
      };
    }
  },

  getCities: async () => {
    try {
      return await request<{ cities: string[] }>('/auth/cities');
    } catch {
      return {
        cities: ['Prishtinë', 'Prizren', 'Pejë', 'Gjilan', 'Ferizaj', 'Mitrovicë', 'Gjakovë', 'Fushë Kosovë']
      };
    }
  },

  // Auctions
  getAuctions: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    condition?: string;
    status?: string;
    search?: string;
    sort?: string;
    buy_now?: string;
  } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') query.append(key, String(val));
    });
    try {
      return await request<{ data: Product[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/auctions?${query.toString()}`);
    } catch {
      return filterDemoAuctions(params);
    }
  },

  getCategories: async () => {
    try {
      return await request<{ categories: Category[] }>('/auctions/categories');
    } catch {
      return { categories: DEMO_CATEGORIES };
    }
  },

  getExchangeRate: async () => {
    try {
      return await request<{ rate: number; currency: string; baseCurrency: string }>('/auctions/exchange-rate');
    } catch {
      return { rate: 1, currency: 'EUR', baseCurrency: 'EUR' };
    }
  },

  getAuctionById: async (id: string | number) => {
    try {
      return await request<{ product: Product; bidHistory: Bid[]; relatedProducts?: Product[] }>(`/auctions/${id}`);
    } catch {
      const prod = demoProducts.find(p => String(p.id) === String(id)) || demoProducts[0];
      const bids: Bid[] = [
        { id: 1, amount: prod.current_price - 10, bid_type: 'manual', is_winning: 0, bidder_name: 'Agron M.', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 2, amount: prod.current_price, bid_type: 'manual', is_winning: 1, bidder_name: 'Blerina K.', created_at: new Date(Date.now() - 1200000).toISOString() }
      ];
      return {
        product: prod,
        bidHistory: bids,
        relatedProducts: demoProducts.filter(p => p.id !== prod.id).slice(0, 3)
      };
    }
  },

  placeBid: async (productId: number, amount: number, isProxy = false) => {
    try {
      return await request<{
        message: string;
        currentPrice: number;
        winnerId: number;
        winnerName: string;
        totalBids: number;
        antiSnipExtended: boolean;
        newEndTime: string;
        product: Product;
      }>(`/auctions/${productId}/bid`, {
        method: 'POST',
        body: JSON.stringify({ amount, isProxy })
      });
    } catch {
      const prod = demoProducts.find(p => p.id === productId) || demoProducts[0];
      prod.current_price = amount;
      prod.total_bids = (prod.total_bids || 0) + 1;
      return {
        message: 'Oferta juaj u pranua me sukses!',
        currentPrice: amount,
        winnerId: 999,
        winnerName: 'Ju (Blerës)',
        totalBids: prod.total_bids,
        antiSnipExtended: false,
        newEndTime: prod.auction_end,
        product: prod
      };
    }
  },

  buyNow: async (productId: number, shippingDetails: Record<string, any>) => {
    try {
      return await request<{ message: string; orderId: number; orderNumber: string; finalPrice: number }>(`/auctions/${productId}/buy-now`, {
        method: 'POST',
        body: JSON.stringify(shippingDetails)
      });
    } catch {
      return {
        message: 'Blerja e menjëhershme u krye me sukses!',
        orderId: 101,
        orderNumber: 'ORD-DEMO-2026',
        finalPrice: 890
      };
    }
  },

  toggleWatchlist: async (productId: number) => {
    try {
      return await request<{ watched: boolean; message: string }>(`/auctions/${productId}/watchlist`, {
        method: 'POST'
      });
    } catch {
      return { watched: true, message: 'U shtua në listën tuaj të vëzhgimit!' };
    }
  },

  getMyBids: async () => {
    try {
      return await request<{ bids: (Product & { my_proxy_bid?: number; my_highest_bid?: number; is_winning: boolean })[] }>('/auctions/my/bids');
    } catch {
      return {
        bids: [
          { ...demoProducts[0], my_highest_bid: demoProducts[0].current_price, is_winning: true },
          { ...demoProducts[1], my_highest_bid: demoProducts[1].current_price - 10, is_winning: false }
        ]
      };
    }
  },

  getMyWatchlist: async () => {
    try {
      return await request<{ watchlist: Product[] }>('/auctions/my/watchlist');
    } catch {
      return { watchlist: [demoProducts[0], demoProducts[2]] };
    }
  },

  // Orders
  getOrders: async (params: { page?: number; limit?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') query.append(key, String(val));
    });
    try {
      return await request<{ orders: Order[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/orders?${query.toString()}`);
    } catch {
      return {
        orders: DEMO_ORDERS,
        pagination: { total: DEMO_ORDERS.length, page: 1, limit: 50, totalPages: 1 }
      };
    }
  },

  getOrderById: async (id: number) => {
    try {
      return await request<{ order: Order }>(`/orders/${id}`);
    } catch {
      return { order: DEMO_ORDERS.find(o => o.id === id) || DEMO_ORDERS[0] };
    }
  },

  updateOrderStatus: async (id: number, data: { order_status?: string; payment_status?: string; tracking_number?: string; notes?: string }) => {
    try {
      return await request<{ message: string }>(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch {
      return { message: 'Statusi i porosisë u përditësua me sukses!' };
    }
  },

  updateOrderReturn: async (id: number, data: { return_status: string; refund_amount?: number; notes?: string }) => {
    try {
      return await request<{ message: string }>(`/admin/orders/${id}/return`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch {
      return { message: 'Kërkesa e kthimit u përditësua!' };
    }
  },

  // Admin & BI Suite
  getAdminStats: async () => {
    try {
      return await request<{
        metrics: AdminMetrics;
        conditionStats: { condition_grade: string; count: number }[];
        recentLogs: ActivityLog[];
      }>('/admin/stats');
    } catch {
      return {
        metrics: DEMO_ADMIN_METRICS,
        conditionStats: [
          { condition_grade: 'A', count: 18 },
          { condition_grade: 'B', count: 6 },
          { condition_grade: 'C', count: 0 }
        ],
        recentLogs: DEMO_LOGS
      };
    }
  },

  getFinancials: async () => {
    try {
      return await request<FinancialData>('/admin/financials');
    } catch {
      return DEMO_FINANCIALS;
    }
  },

  updateInitialInvestment: async (amount: number) => {
    try {
      return await request<{ message: string; initialInvestment: number }>('/admin/financials/initial-investment', {
        method: 'PUT',
        body: JSON.stringify({ amount })
      });
    } catch {
      DEMO_FINANCIALS.initialInvestment = amount;
      return { message: 'Investimi fillestar u përditësua.', initialInvestment: amount };
    }
  },

  updateExchangeRate: async (rate: number) => {
    try {
      return await request<{ message: string; exchangeRate: number }>('/admin/financials/exchange-rate', {
        method: 'PUT',
        body: JSON.stringify({ rate })
      });
    } catch {
      DEMO_FINANCIALS.exchangeRate = rate;
      return { message: 'Kursi i këmbimit u përditësua.', exchangeRate: rate };
    }
  },

  getExpenses: async () => {
    try {
      return await request<{ expenses: Expense[] }>('/admin/expenses');
    } catch {
      return { expenses: demoExpenses };
    }
  },

  createExpense: async (data: { category: string; title: string; amount: number; expense_date?: string; notes?: string }) => {
    try {
      return await request<{ message: string; id: number }>('/admin/expenses', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const newExp: Expense = {
        id: Date.now(),
        category: (data.category as any) || 'tjeter',
        title: data.title,
        amount: Number(data.amount),
        expense_date: data.expense_date || new Date().toISOString().split('T')[0],
        notes: data.notes,
        created_at: new Date().toISOString()
      };
      demoExpenses.unshift(newExp);
      return { message: 'Shpenzimi u shtua me sukses!', id: newExp.id };
    }
  },

  deleteExpense: async (id: number) => {
    try {
      return await request<{ message: string }>(`/admin/expenses/${id}`, {
        method: 'DELETE'
      });
    } catch {
      demoExpenses = demoExpenses.filter(e => e.id !== id);
      return { message: 'Shpenzimi u fshi.' };
    }
  },

  getDailyChart: async (days = 14) => {
    try {
      return await request<{ chart: DailyChartPoint[] }>(`/admin/analytics/daily-chart?days=${days}`);
    } catch {
      return { chart: DEMO_DAILY_CHART };
    }
  },

  getSalesAnalytics: async () => {
    try {
      return await request<SalesAnalytics>('/admin/analytics/sales');
    } catch {
      return DEMO_SALES_ANALYTICS;
    }
  },

  getInventorySummary: async () => {
    try {
      return await request<InventorySummary>('/admin/inventory/summary');
    } catch {
      return DEMO_INVENTORY;
    }
  },

  getAdminNotifications: async () => {
    try {
      return await request<{ notifications: AdminNotification[]; unreadCount: number }>('/admin/notifications');
    } catch {
      return { notifications: demoNotifications, unreadCount: demoNotifications.filter(n => n.is_read === 0).length };
    }
  },

  markNotificationRead: async (id: number) => {
    try {
      return await request<{ success: boolean }>(`/admin/notifications/${id}/read`, {
        method: 'PUT'
      });
    } catch {
      demoNotifications = demoNotifications.map(n => n.id === id ? { ...n, is_read: 1 } : n);
      return { success: true };
    }
  },

  markAllNotificationsRead: async () => {
    try {
      return await request<{ success: boolean }>('/admin/notifications/mark-all-read', {
        method: 'POST'
      });
    } catch {
      demoNotifications = demoNotifications.map(n => ({ ...n, is_read: 1 }));
      return { success: true };
    }
  },

  getAdminProducts: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, String(v)); });
    try {
      return await request<{ products: Product[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/admin/products?${query.toString()}`);
    } catch {
      return {
        products: demoProducts,
        pagination: { total: demoProducts.length, page: 1, limit: 50, totalPages: 1 }
      };
    }
  },

  createProduct: async (data: Partial<Product> & { duration_days?: number }) => {
    try {
      return await request<{ message: string; productId: number }>('/admin/products', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const newProd: Product = {
        id: Date.now(),
        title: data.title || 'Artikull i Ri',
        slug: 'artikull-i-ri-' + Date.now(),
        sku: data.sku || 'ANK-NEW-' + Math.floor(Math.random() * 1000),
        description: data.description || '',
        category_id: data.category_id || 1,
        category_name: 'Elektronikë & TV',
        condition_grade: data.condition_grade || 'A',
        condition_details: data.condition_details || '',
        images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80'],
        cost_price: Number(data.cost_price || 0),
        starting_price: Number(data.starting_price || 10),
        current_price: Number(data.starting_price || 10),
        reserve_price: Number(data.reserve_price || 0),
        buy_now_price: data.buy_now_price ? Number(data.buy_now_price) : null,
        min_bid_increment: 5,
        min_next_bid: Number(data.starting_price || 10) + 5,
        auction_start: new Date().toISOString(),
        auction_end: new Date(Date.now() + (data.duration_days || 3) * 86400000).toISOString(),
        original_end_time: new Date(Date.now() + (data.duration_days || 3) * 86400000).toISOString(),
        anti_snip_minutes: 2,
        anti_snip_extension: 3,
        anti_snip_count: 0,
        views_count: 0,
        total_bids: 0,
        reserve_met: false,
        status: 'active',
        created_at: new Date().toISOString()
      };
      demoProducts.unshift(newProd);
      return { message: 'Artikulli u krijua me sukses!', productId: newProd.id };
    }
  },

  updateProduct: async (id: number, data: Partial<Product> & { extend_hours?: number }) => {
    try {
      return await request<{ message: string }>(`/admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch {
      demoProducts = demoProducts.map(p => p.id === id ? { ...p, ...data } : p);
      return { message: 'Artikulli u përditësua!' };
    }
  },

  deleteProduct: async (id: number) => {
    try {
      return await request<{ message: string }>(`/admin/products/${id}`, {
        method: 'DELETE'
      });
    } catch {
      demoProducts = demoProducts.filter(p => p.id !== id);
      return { message: 'Artikulli u fshi.' };
    }
  },

  endProductEarly: async (id: number) => {
    try {
      return await request<{ message: string }>(`/admin/products/${id}/end-early`, {
        method: 'POST'
      });
    } catch {
      demoProducts = demoProducts.map(p => p.id === id ? { ...p, status: 'ended' } : p);
      return { message: 'Ankandi u mbyll me sukses.' };
    }
  },

  getAdminUsers: async () => {
    try {
      return await request<{ users: User[] }>('/admin/users');
    } catch {
      return { users: DEMO_USERS };
    }
  },

  updateUserStatus: async (id: number, data: { status?: string; role?: string }) => {
    try {
      return await request<{ message: string }>(`/admin/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch {
      return { message: 'Statusi i përdoruesit u përditësua!' };
    }
  },

  uploadCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      return await request<{ message: string; result: any }>('/admin/import/csv', {
        method: 'POST',
        body: formData
      });
    } catch {
      return { message: 'Importimi nga CSV u simulua me sukses (Demo)!', result: { imported: 12, errors: 0 } };
    }
  },

  generateBulkTest: async (count = 9000) => {
    try {
      return await request<{ message: string; result: any }>('/admin/import/generate-bulk-test', {
        method: 'POST',
        body: JSON.stringify({ count })
      });
    } catch {
      return { message: `Gjenerimi masiv i ${count} artikujve u simulua me sukses!`, result: { count } };
    }
  },

  getImportHistory: async () => {
    try {
      return await request<{ history: any[] }>('/admin/import/history');
    } catch {
      return { history: [] };
    }
  },

  getAdminLogs: async (limit = 50) => {
    try {
      return await request<{ logs: ActivityLog[] }>(`/admin/logs?limit=${limit}`);
    } catch {
      return { logs: DEMO_LOGS };
    }
  }
};
