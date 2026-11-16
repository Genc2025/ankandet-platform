import { 
  User, Product, Category, Bid, Order, ActivityLog, AdminMetrics, 
  Expense, FinancialData, DailyChartPoint, SalesAnalytics, InventorySummary, AdminNotification 
} from './types';

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

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (data: { email: string; password: string; full_name: string; phone?: string; city?: string; address?: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () =>
    request<{ user: User; stats: { active_bids: number; won_auctions: number; watchlist_count: number } }>('/auth/me'),

  updateProfile: (profile: Partial<User> & { password?: string }) =>
    request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    }),

  getCities: () =>
    request<{ cities: string[] }>('/auth/cities'),

  // Auctions
  getAuctions: (params: {
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
    return request<{ data: Product[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/auctions?${query.toString()}`);
  },

  getCategories: () =>
    request<{ categories: Category[] }>('/auctions/categories'),

  getExchangeRate: () =>
    request<{ rate: number; currency: string; baseCurrency: string }>('/auctions/exchange-rate'),

  getAuctionById: (id: string | number) =>
    request<{ product: Product; bidHistory: Bid[]; relatedProducts?: Product[] }>(`/auctions/${id}`),

  placeBid: (productId: number, amount: number, isProxy = false) =>
    request<{
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
    }),

  buyNow: (productId: number, shippingDetails: Record<string, any>) =>
    request<{ message: string; orderId: number; orderNumber: string; finalPrice: number }>(`/auctions/${productId}/buy-now`, {
      method: 'POST',
      body: JSON.stringify(shippingDetails)
    }),

  toggleWatchlist: (productId: number) =>
    request<{ watched: boolean; message: string }>(`/auctions/${productId}/watchlist`, {
      method: 'POST'
    }),

  getMyBids: () =>
    request<{ bids: (Product & { my_proxy_bid?: number; my_highest_bid?: number; is_winning: boolean })[] }>('/auctions/my/bids'),

  getMyWatchlist: () =>
    request<{ watchlist: Product[] }>('/auctions/my/watchlist'),

  // Orders
  getOrders: (params: { page?: number; limit?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) query.append(key, String(val));
    });
    return request<{ orders: Order[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/orders?${query.toString()}`);
  },

  getOrderById: (id: number) =>
    request<{ order: Order }>(`/orders/${id}`),

  updateOrderStatus: (id: number, data: { order_status?: string; payment_status?: string; tracking_number?: string; notes?: string }) =>
    request<{ message: string }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  updateOrderReturn: (id: number, data: { return_status: string; refund_amount?: number; notes?: string }) =>
    request<{ message: string }>(`/admin/orders/${id}/return`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Admin & BI Suite
  getAdminStats: () =>
    request<{
      metrics: AdminMetrics;
      conditionStats: { condition_grade: string; count: number }[];
      recentLogs: ActivityLog[];
    }>('/admin/stats'),

  getFinancials: () =>
    request<FinancialData>('/admin/financials'),

  updateInitialInvestment: (amount: number) =>
    request<{ message: string; initialInvestment: number }>('/admin/financials/initial-investment', {
      method: 'PUT',
      body: JSON.stringify({ amount })
    }),

  updateExchangeRate: (rate: number) =>
    request<{ message: string; exchangeRate: number }>('/admin/financials/exchange-rate', {
      method: 'PUT',
      body: JSON.stringify({ rate })
    }),

  getExpenses: () =>
    request<{ expenses: Expense[] }>('/admin/expenses'),

  createExpense: (data: { category: string; title: string; amount: number; expense_date?: string; notes?: string }) =>
    request<{ message: string; id: number }>('/admin/expenses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deleteExpense: (id: number) =>
    request<{ message: string }>(`/admin/expenses/${id}`, {
      method: 'DELETE'
    }),

  getDailyChart: (days = 14) =>
    request<{ chart: DailyChartPoint[] }>(`/admin/analytics/daily-chart?days=${days}`),

  getSalesAnalytics: () =>
    request<SalesAnalytics>('/admin/analytics/sales'),

  getInventorySummary: () =>
    request<InventorySummary>('/admin/inventory/summary'),

  getAdminNotifications: () =>
    request<{ notifications: AdminNotification[]; unreadCount: number }>('/admin/notifications'),

  markNotificationRead: (id: number) =>
    request<{ success: boolean }>(`/admin/notifications/${id}/read`, {
      method: 'PUT'
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/admin/notifications/mark-all-read', {
      method: 'POST'
    }),

  getAdminProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, String(v)); });
    return request<{ products: Product[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(`/admin/products?${query.toString()}`);
  },

  createProduct: (data: Partial<Product> & { duration_days?: number }) =>
    request<{ message: string; productId: number }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateProduct: (id: number, data: Partial<Product> & { extend_hours?: number }) =>
    request<{ message: string }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteProduct: (id: number) =>
    request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE'
    }),

  endProductEarly: (id: number) =>
    request<{ message: string }>(`/admin/products/${id}/end-early`, {
      method: 'POST'
    }),

  getAdminUsers: () =>
    request<{ users: User[] }>('/admin/users'),

  updateUserStatus: (id: number, data: { status?: string; role?: string }) =>
    request<{ message: string }>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ message: string; result: any }>('/admin/import/csv', {
      method: 'POST',
      body: formData
    });
  },

  generateBulkTest: (count = 9000) =>
    request<{ message: string; result: any }>('/admin/import/generate-bulk-test', {
      method: 'POST',
      body: JSON.stringify({ count })
    }),

  getImportHistory: () =>
    request<{ history: any[] }>('/admin/import/history'),

  getAdminLogs: (limit = 50) =>
    request<{ logs: ActivityLog[] }>(`/admin/logs?limit=${limit}`)
};
