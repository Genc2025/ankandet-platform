export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  city?: string;
  address?: string;
  role: 'buyer' | 'admin';
  status: 'active' | 'suspended';
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  active_count?: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  sku: string;
  description: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  condition_grade: 'A' | 'B' | 'C';
  condition_details?: string;
  images: string[];
  cost_price: number;
  starting_price: number;
  current_price: number;
  reserve_price: number;
  buy_now_price?: number | null;
  min_bid_increment: number;
  min_next_bid: number;
  auction_start: string;
  auction_end: string;
  original_end_time: string;
  anti_snip_minutes: number;
  anti_snip_extension: number;
  anti_snip_count: number;
  status: 'active' | 'ended' | 'sold' | 'cancelled';
  current_winner_id?: number | null;
  winner_name?: string | null;
  total_bids: number;
  views_count: number;
  is_watched?: boolean;
  user_proxy?: number | null;
  is_user_winning?: boolean;
  reserve_met?: boolean;
  created_at: string;
}

export interface Bid {
  id: number;
  amount: number;
  bid_type: 'manual' | 'proxy' | 'buy_now';
  is_winning: number;
  created_at: string;
  bidder_name?: string;
  city?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  product_id: number;
  product_title?: string;
  product_sku?: string;
  product_images?: string[];
  condition_grade?: 'A' | 'B' | 'C';
  buyer_email?: string;
  buyer_name?: string;
  cost_price?: number;
  final_price: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: 'cash_on_delivery' | 'bank_transfer' | 'card';
  payment_status: 'pending' | 'paid' | 'refunded';
  order_status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  return_status?: 'none' | 'requested' | 'approved' | 'refunded';
  refund_amount?: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_city: string;
  shipping_address: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: number;
  category: 'dogana' | 'transport' | 'marketing' | 'operim' | 'paketim' | 'tjeter';
  title: string;
  amount: number;
  expense_date: string;
  notes?: string;
  created_at: string;
}

export interface FinancialData {
  initialInvestment: number;
  exchangeRate?: number;
  totalRevenue: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPct: number;
  lockedCapitalWarehouse: number;
  retailValueWarehouse: number;
  unsoldProductsCount: number;
  breakEvenProgress: number;
  expensesByCategory: { category: string; total: number; count: number }[];
}

export interface DailyChartPoint {
  date: string;
  published: number;
  sold: number;
  revenue: number;
  profit: number;
}

export interface SalesAnalytics {
  topProducts: {
    id: number;
    title: string;
    sku: string;
    images?: string;
    category_name?: string;
    units_sold: number;
    total_revenue: number;
    total_profit: number;
  }[];
  topCategories: {
    id: number;
    name: string;
    total_products: number;
    total_sales: number;
    total_revenue: number;
    total_bids_placed: number;
  }[];
  averageOrderValue: number;
  totalSoldUnits: number;
  traffic: {
    totalViews: number;
    totalBids: number;
    totalOrders: number;
    conversionRateViewsToSale: number;
    conversionRateBidsToSale: number;
  };
  deadStock: Product[];
}

export interface InventorySummary {
  totalProducts: number;
  publishedProducts: number;
  soldProducts: number;
  warehouseProducts: number;
  lockedCost: number;
  retailValuation: number;
  categoryStock: {
    id: number;
    name: string;
    total_items: number;
    active_items: number;
    sold_items: number;
    capital_locked: number;
  }[];
}

export interface AdminNotification {
  id: number;
  type: 'product_sold' | 'auction_ended' | 'order_unpaid' | 'high_views_no_bids' | 'low_stock' | 'suspicious_activity';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  entity_type?: string;
  entity_id?: number;
  is_read: number;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  details?: string;
  ip_address?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface AdminMetrics {
  totalAuctions: number;
  activeAuctions: number;
  soldAuctions: number;
  totalBids: number;
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  newCustomersToday: number;
  todaySales: { revenue: number; orders: number };
  weekSales: { revenue: number; orders: number };
  monthSales: { revenue: number; orders: number };
  totalRevenue: number;
  grossProfit: number;
  netProfit: number;
  unreadAlerts: number;
}
