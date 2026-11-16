import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, TrendingUp, Package, DollarSign, Bell, 
  ShoppingBag, Users, FileText, Database, Plus, Trash2, Edit3, 
  X, CheckCircle, AlertTriangle, Download, RefreshCw, Clock, 
  ArrowRight, Zap, ShieldCheck, PieChart, BarChart2, Eye, 
  RotateCcw, AlertCircle, ArrowUpRight, ArrowDownRight, Tag, Coins
} from 'lucide-react';
import { api } from '../api';
import { 
  Product, Order, User, ActivityLog, AdminMetrics, Category,
  Expense, FinancialData, DailyChartPoint, SalesAnalytics, 
  InventorySummary, AdminNotification 
} from '../types';

interface AdminDashboardProps {
  onBackToMarketplace: () => void;
  onRefreshAuctions: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToMarketplace,
  onRefreshAuctions
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'analytics' | 'inventory' | 'financials' | 'notifications' | 'operations' | 'import'
  >('overview');

  // Core Data
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [financials, setFinancials] = useState<FinancialData | null>(null);
  const [dailyChart, setDailyChart] = useState<DailyChartPoint[]>([]);
  const [chartDays, setChartDays] = useState<number>(14);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Form States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editStatusOrder, setEditStatusOrder] = useState<Order | null>(null);
  const [returnOrderModal, setReturnOrderModal] = useState<Order | null>(null);
  const [addExpenseModal, setAddExpenseModal] = useState(false);
  const [editInvestmentModal, setEditInvestmentModal] = useState(false);
  const [newInvestmentInput, setNewInvestmentInput] = useState<string>('31000');
  const [exchangeRateInput, setExchangeRateInput] = useState<string>('100.00');
  const [rateSuccessMsg, setRateSuccessMsg] = useState<string | null>(null);

  // New Expense form
  const [expCategory, setExpCategory] = useState<'dogana' | 'transport' | 'marketing' | 'operim' | 'paketim' | 'tjeter'>('operim');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // Return modal form
  const [returnStatus, setReturnStatus] = useState<string>('approved');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [returnNotes, setReturnNotes] = useState<string>('');

  // Create Product Form
  const [newTitle, setNewTitle] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCatId, setNewCatId] = useState<number | ''>('');
  const [newGrade, setNewGrade] = useState<'A' | 'B' | 'C'>('A');
  const [newGradeDetails, setNewGradeDetails] = useState('');
  const [newCostPrice, setNewCostPrice] = useState<number>(15);
  const [newStartPrice, setNewStartPrice] = useState<number>(25);
  const [newReservePrice, setNewReservePrice] = useState<number>(0);
  const [newBuyNowPrice, setNewBuyNowPrice] = useState<number | ''>('');
  const [newDurationDays, setNewDurationDays] = useState<number>(3);
  const [newImages, setNewImages] = useState<string>('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f');

  // CSV Import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResultMsg, setImportResultMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [statsRes, finRes, chartRes] = await Promise.all([
          api.getAdminStats(),
          api.getFinancials(),
          api.getDailyChart(chartDays)
        ]);
        setMetrics(statsRes.metrics);
        setRecentLogs(statsRes.recentLogs || []);
        setFinancials(finRes);
        if (finRes.exchangeRate) setExchangeRateInput(String(finRes.exchangeRate));
        setDailyChart(chartRes.chart || []);
      } else if (activeTab === 'analytics') {
        const [salesRes, chartRes] = await Promise.all([
          api.getSalesAnalytics(),
          api.getDailyChart(chartDays)
        ]);
        setSalesAnalytics(salesRes);
        setDailyChart(chartRes.chart || []);
      } else if (activeTab === 'inventory') {
        const invRes = await api.getInventorySummary();
        setInventory(invRes);
      } else if (activeTab === 'financials') {
        const [finRes, expRes] = await Promise.all([
          api.getFinancials(),
          api.getExpenses()
        ]);
        setFinancials(finRes);
        if (finRes.exchangeRate) setExchangeRateInput(String(finRes.exchangeRate));
        setExpenses(expRes.expenses || []);
      } else if (activeTab === 'notifications') {
        const notifRes = await api.getAdminNotifications();
        setNotifications(notifRes.notifications || []);
        setUnreadNotifCount(notifRes.unreadCount || 0);
      } else if (activeTab === 'operations') {
        const [prodRes, orderRes, userRes, catRes, logRes] = await Promise.all([
          api.getAdminProducts({ search: productSearch, status: statusFilter, limit: 50 }),
          api.getOrders({ limit: 50 }),
          api.getAdminUsers(),
          api.getCategories(),
          api.getAdminLogs(30)
        ]);
        setProducts(prodRes.products || []);
        setOrders(orderRes.orders || []);
        setUsers(userRes.users || []);
        setCategories(catRes.categories || []);
        setRecentLogs(logRes.logs || []);
      } else if (activeTab === 'import') {
        const histRes = await api.getImportHistory();
        setImportHistory(histRes.history || []);
      }

      // Check unread count on background
      const nRes = await api.getAdminNotifications();
      setUnreadNotifCount(nRes.unreadCount || 0);
    } catch (e) {
      console.error('Admin loading error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, chartDays, statusFilter]);

  // Handle Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imgs = newImages.split(';').map(u => u.trim()).filter(Boolean);
      await api.createProduct({
        title: newTitle,
        sku: newSku,
        description: newDesc,
        category_id: newCatId ? Number(newCatId) : undefined,
        condition_grade: newGrade,
        condition_details: newGradeDetails,
        cost_price: newCostPrice,
        starting_price: newStartPrice,
        reserve_price: newReservePrice,
        buy_now_price: newBuyNowPrice ? Number(newBuyNowPrice) : null,
        duration_days: newDurationDays,
        images: imgs
      });

      setCreateModalOpen(false);
      resetProductForm();
      loadData();
      onRefreshAuctions();
    } catch (err: any) {
      alert('Gabim: ' + err.message);
    }
  };

  // Handle Update Product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await api.updateProduct(editingProduct.id, {
        title: editingProduct.title,
        description: editingProduct.description,
        cost_price: editingProduct.cost_price,
        reserve_price: editingProduct.reserve_price,
        buy_now_price: editingProduct.buy_now_price,
        status: editingProduct.status
      });

      setEditingProduct(null);
      loadData();
      onRefreshAuctions();
    } catch (err: any) {
      alert('Gabim: ' + err.message);
    }
  };

  // Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense({
        category: expCategory,
        title: expTitle,
        amount: parseFloat(expAmount) || 0,
        notes: expNotes
      });
      setAddExpenseModal(false);
      setExpTitle('');
      setExpAmount('');
      setExpNotes('');
      loadData();
    } catch (err: any) {
      alert('Gabim: ' + err.message);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm('Fshini këtë shpenzim?')) return;
    try {
      await api.deleteExpense(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Update Initial Capital
  const handleSaveInitialInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateInitialInvestment(parseFloat(newInvestmentInput) || 0);
      setEditInvestmentModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Update Exchange Rate (EUR -> ALL)
  const handleSaveExchangeRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rateNum = parseFloat(exchangeRateInput);
      if (isNaN(rateNum) || rateNum <= 0) {
        alert('Ju lutem jepni një kurs këmbimi të vlefshëm.');
        return;
      }
      const res = await api.updateExchangeRate(rateNum);
      setRateSuccessMsg(`Kursi u ruajt me sukses: 1 € = ${res.exchangeRate} L`);
      setTimeout(() => setRateSuccessMsg(null), 3500);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Return & Refund
  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderModal) return;
    try {
      await api.updateOrderReturn(returnOrderModal.id, {
        return_status: returnStatus,
        refund_amount: parseFloat(refundAmount) || 0,
        notes: returnNotes
      });
      setReturnOrderModal(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Notifications
  const handleMarkNotifRead = async (id: number) => {
    await api.markNotificationRead(id);
    loadData();
  };

  const handleMarkAllNotifsRead = async () => {
    await api.markAllNotificationsRead();
    loadData();
  };

  // Bulk test generator
  const handleBulkTestGenerate = async () => {
    if (!window.confirm('Kjo do të gjenerojë dhe importojë 9,000 artikuj testues në bazën e të dhënave menjëherë për të testuar shpejtësinë. Të vazhdohet?')) return;
    setImportLoading(true);
    setImportResultMsg('Duke gjeneruar dhe importuar 9,000 artikuj me batch streaming në SQLite...');

    try {
      const res = await api.generateBulkTest(9000);
      setImportResultMsg(res.message);
      loadData();
      onRefreshAuctions();
    } catch (err: any) {
      setImportResultMsg('Gabim: ' + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  const resetProductForm = () => {
    setNewTitle('');
    setNewSku('');
    setNewDesc('');
    setNewCatId('');
    setNewGrade('A');
    setNewGradeDetails('');
    setNewCostPrice(15);
    setNewStartPrice(25);
    setNewReservePrice(0);
    setNewBuyNowPrice('');
    setNewDurationDays(3);
    setNewImages('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f');
  };

  // Calculate chart max bounds for scaling
  const maxPublished = Math.max(...dailyChart.map(d => d.published), 1);
  const maxSold = Math.max(...dailyChart.map(d => d.sold), 1);
  const maxBarValue = Math.max(maxPublished, maxSold, 4);
  const maxRevenue = Math.max(...dailyChart.map(d => d.revenue), 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-4 h-4" />
            Paneli i Kontrollit & Menaxhimit të Biznesit (ERP / BI)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Admin Intelligence Suite</h1>
          <p className="text-xs text-slate-400">Përcjellje në kohë reale e shitjeve, fitimit neto, stokut, financave dhe rrezikut</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Excel Export Button */}
          <a
            href="/api/admin/reports/export-excel"
            download
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            title="Eksporto të gjitha shitjet, inventarin dhe bilancin në Excel"
          >
            <Download className="w-4 h-4" />
            Eksporto Raport Excel (.xlsx)
          </a>

          {/* SQLite Backup */}
          <a
            href="/api/admin/backup"
            download
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Kopje e paprekur e bazës SQLite"
          >
            <Database className="w-4 h-4 text-purple-400" />
            Backup (.db)
          </a>

          <button
            onClick={onBackToMarketplace}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors"
          >
            Faqja e Ankandeve
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white rounded-2xl p-2 shadow-xs border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-amber-600" />
          1. Paneli Kryesor (Overview)
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'analytics' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-blue-600" />
          2. Analitika e Shitjeve
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'inventory' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4 text-purple-600" />
          3. Kontrolli i Stokut
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'financials' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          4. Kontrolli Financiar
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`relative py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'notifications' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4 text-rose-500" />
          5. Njoftimet Automatike
          {unreadNotifCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {unreadNotifCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('operations')}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'operations' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          6. Menaxhimi & Veprimet
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'import' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-600" />
          Importi 9,000 Artikuj
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 1. PANELI KRYESOR (BUSINESS OVERVIEW & INTERACTIVE DAILY CHART)       */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && metrics && financials && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase">Shitjet Ditore</span>
              <p className="text-2xl font-black text-slate-900">€{metrics.todaySales.revenue.toFixed(2)}</p>
              <span className="text-[11px] text-slate-500">{metrics.todaySales.orders} porosi sot</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase">Shitjet Javore (7 Ditë)</span>
              <p className="text-2xl font-black text-blue-600">€{metrics.weekSales.revenue.toFixed(2)}</p>
              <span className="text-[11px] text-slate-500">{metrics.weekSales.orders} porosi realizuar</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase">Shitjet Mujore (30 Ditë)</span>
              <p className="text-2xl font-black text-indigo-600">€{metrics.monthSales.revenue.toFixed(2)}</p>
              <span className="text-[11px] text-slate-500">{metrics.monthSales.orders} artikuj të shitur</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-slate-400 text-xs font-semibold uppercase">Të Ardhurat Totale</span>
              <p className="text-2xl font-black text-slate-900">€{financials.totalRevenue.toFixed(2)}</p>
              <span className="text-[11px] text-emerald-600 font-bold">Fitimi Neto: €{financials.netProfit.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">Fitimi Bruto (Margjina)</span>
              <p className="text-xl font-black text-emerald-600 mt-1">€{financials.grossProfit.toFixed(2)}</p>
              <span className="text-[10px] text-slate-400">Të ardhura minus kosto malli</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">Shpenzime Operative</span>
              <p className="text-xl font-black text-red-600 mt-1">€{financials.totalExpenses.toFixed(2)}</p>
              <span className="text-[10px] text-slate-400">Dogana, transport, magazinë</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">Kapital i Bllokuar</span>
              <p className="text-xl font-black text-amber-600 mt-1">€{financials.lockedCapitalWarehouse.toFixed(2)}</p>
              <span className="text-[10px] text-slate-400">Në {financials.unsoldProductsCount} produkte stoku</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-[11px] font-semibold uppercase">Klientë / Blerës</span>
              <p className="text-xl font-black text-slate-900 mt-1">{metrics.totalUsers}</p>
              <span className="text-[10px] text-emerald-600 font-bold">+{metrics.newCustomersToday} regjistruar sot</span>
            </div>
          </div>

          {/* ==================================================================== */}
          {/* GRAFIKU NDËRVEPRUES DITOR (DAILY CHART)                               */}
          {/* ==================================================================== */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-amber-600" />
                  Grafiku Ditor i Performancës së Biznesit
                </h3>
                <p className="text-xs text-slate-500">
                  Paraqet çdo ditë: <strong>Produktet e Publikuara</strong>, <strong>Produktet e Shitura</strong> dhe <strong>Paratë e Realizuara (€)</strong>
                </p>
              </div>

              {/* Chart Period Toggle & Legend */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-xs bg-blue-500"></span> Publikuar
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-xs bg-emerald-500"></span> Shitur
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span> Para (€)
                  </span>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  {[7, 14, 30].map(d => (
                    <button
                      key={d}
                      onClick={() => setChartDays(d)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        chartDays === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {d} Ditë
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SVG Visual Chart */}
            <div className="h-72 w-full pt-4">
              {dailyChart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Duke kalkuluar të dhënat e grafikut...
                </div>
              ) : (
                <div className="relative h-full flex flex-col justify-between">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="border-b border-slate-900 w-full"></div>
                    <div className="border-b border-slate-900 w-full"></div>
                    <div className="border-b border-slate-900 w-full"></div>
                    <div className="border-b border-slate-900 w-full"></div>
                  </div>

                  {/* Bars & Points Row */}
                  <div className="relative z-10 flex-1 flex items-end justify-between gap-2 px-2 pb-6">
                    {dailyChart.map((pt, idx) => {
                      const pubH = Math.min(100, (pt.published / maxBarValue) * 100);
                      const soldH = Math.min(100, (pt.sold / maxBarValue) * 100);
                      const revH = Math.min(100, (pt.revenue / maxRevenue) * 100);

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-xl z-30 whitespace-nowrap pointer-events-none border border-slate-700">
                            <span className="font-bold text-amber-400">{pt.date}</span>
                            <span>Publikuar: <strong>{pt.published} produkte</strong></span>
                            <span>Shitur: <strong>{pt.sold} produkte</strong></span>
                            <span>Realizuar: <strong>€{pt.revenue.toFixed(2)}</strong></span>
                            <span>Fitim: <strong>€{pt.profit.toFixed(2)}</strong></span>
                          </div>

                          {/* Bars container */}
                          <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                            {/* Published Bar */}
                            <div 
                              style={{ height: `${Math.max(4, pubH)}%` }} 
                              className="w-1/2 max-w-[14px] bg-blue-500 rounded-t-sm transition-all group-hover:brightness-110"
                              title={`Publikuar: ${pt.published}`}
                            />
                            {/* Sold Bar */}
                            <div 
                              style={{ height: `${Math.max(4, soldH)}%` }} 
                              className="w-1/2 max-w-[14px] bg-emerald-500 rounded-t-sm transition-all group-hover:brightness-110"
                              title={`Shitur: ${pt.sold}`}
                            />
                          </div>

                          {/* Revenue circular dot indicator */}
                          {pt.revenue > 0 && (
                            <div 
                              style={{ bottom: `${Math.max(10, revH)}%` }}
                              className="absolute w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white shadow-md"
                              title={`Të ardhura: €${pt.revenue}`}
                            />
                          )}

                          {/* Date Label */}
                          <span className="text-[10px] text-slate-400 font-mono mt-2 truncate w-full text-center">
                            {pt.date.substring(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. ANALITIKA E SHITJEVE (SALES & CONVERSION INTELLIGENCE)             */}
      {/* ==================================================================== */}
      {activeTab === 'analytics' && salesAnalytics && (
        <div className="space-y-6">
          {/* Conversion Funnel Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Funneli i Konvertimit (Trafiku & Shndërrimi në Blerës)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500">Shikime Gjithsej (Vizita)</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{salesAnalytics.traffic.totalViews}</p>
                <span className="text-[10px] text-slate-400">Interesimi në katalog</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500">Oferta të Bëra</span>
                <p className="text-2xl font-black text-amber-600 mt-1">{salesAnalytics.traffic.totalBids}</p>
                <span className="text-[10px] text-slate-400">Ofertues konkurrues</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500">Porosi / Shitje Finale</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{salesAnalytics.traffic.totalOrders}</p>
                <span className="text-[10px] text-slate-400">Blerës aktivë</span>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-2xl">
                <span className="text-xs text-slate-400">Shkalla e Konvertimit</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{salesAnalytics.traffic.conversionRateViewsToSale}%</p>
                <span className="text-[10px] text-slate-400">Vizitorë që blejnë produkt</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Selling Products */}
            <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Produktet më të Shitura (Top Sellers)</span>
                <span className="text-xs text-slate-400 font-normal">Sipas të ardhurave</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
                    <tr>
                      <th className="p-2.5">Produkti</th>
                      <th className="p-2.5">Kategoria</th>
                      <th className="p-2.5">Shitur</th>
                      <th className="p-2.5">Të Ardhura</th>
                      <th className="p-2.5">Fitimi Bruto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesAnalytics.topProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="p-2.5 font-bold text-slate-900 max-w-[180px] truncate">{p.title}</td>
                        <td className="p-2.5 text-slate-500">{p.category_name || '-'}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-800">{p.units_sold}</td>
                        <td className="p-2.5 font-mono font-black text-emerald-600">€{p.total_revenue.toFixed(2)}</td>
                        <td className="p-2.5 font-mono font-bold text-blue-600">€{p.total_profit.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Categories by Demand */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Kërkesa sipas Kategorive</h3>
              <div className="space-y-2.5">
                {salesAnalytics.topCategories.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{c.name}</span>
                      <span className="text-emerald-700 font-mono">€{c.total_revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{c.total_sales} shitje</span>
                      <span>{c.total_bids_placed} oferta gjithsej</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dead Stock warning table */}
          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Artikujt që nuk po shiten (Dead Stock / 0 Oferta)
            </div>
            <p className="text-xs text-slate-500">
              Këta artikuj kanë shikime nga blerësit por nuk kanë marrë ende asnjë ofertë. Sugjerohet ulja e çmimit fillestar ose ri-promovimi.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-50/50 border-b border-amber-100 text-amber-950 font-bold">
                  <tr>
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">Titulli</th>
                    <th className="p-2.5">Kategoria</th>
                    <th className="p-2.5">Shikime</th>
                    <th className="p-2.5">Çmimi Fillestar</th>
                    <th className="p-2.5">Kostoja</th>
                    <th className="p-2.5 text-right">Veprim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesAnalytics.deadStock.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-mono">{item.sku}</td>
                      <td className="p-2.5 font-semibold max-w-[200px] truncate">{item.title}</td>
                      <td className="p-2.5 text-slate-500">{item.category_name}</td>
                      <td className="p-2.5 font-bold font-mono text-purple-700">{item.views_count}</td>
                      <td className="p-2.5 font-mono font-bold">€{item.starting_price.toFixed(2)}</td>
                      <td className="p-2.5 font-mono text-slate-500">€{item.cost_price.toFixed(2)}</td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => setEditingProduct(item)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-[10px]"
                        >
                          Ule Çmimin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. KONTROLLI I STOKUT & MAGAZINA (INVENTORY & CAPITAL)                */}
      {/* ==================================================================== */}
      {activeTab === 'inventory' && inventory && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-xs font-semibold uppercase">Artikuj Gjithsej</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{inventory.totalProducts}</p>
              <span className="text-[11px] text-slate-500">Katalogu i plotë</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-xs font-semibold uppercase">Të Publikuar në Ankand</span>
              <p className="text-3xl font-black text-blue-600 mt-1">{inventory.publishedProducts}</p>
              <span className="text-[11px] text-slate-500">Aktive me oferta</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-xs font-semibold uppercase">Të Shitur / Realizuar</span>
              <p className="text-3xl font-black text-emerald-600 mt-1">{inventory.soldProducts}</p>
              <span className="text-[11px] text-slate-500">Dorëzuar blerësve</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 text-xs font-semibold uppercase">Në Magazinë (E papublikuar)</span>
              <p className="text-3xl font-black text-amber-600 mt-1">{inventory.warehouseProducts}</p>
              <span className="text-[11px] text-slate-500">Stok rezervë</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Vlera Financiare e Stokut të Mbetur</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Kapitali i bllokuar në kosto (COGS):</span>
                  <span className="font-mono font-bold text-slate-900">€{inventory.lockedCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Vlera e parashikuar e shitjes me pakicë:</span>
                  <span className="font-mono font-bold text-emerald-600">€{inventory.retailValuation.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                  <span>Fitimi potencial nga stoku ekzistues:</span>
                  <span className="text-amber-600 font-mono">€{(inventory.retailValuation - inventory.lockedCost).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Stoku sipas Kategorive</h3>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {inventory.categoryStock.map((cs) => (
                  <div key={cs.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{cs.name}</p>
                      <span className="text-[11px] text-slate-500">
                        {cs.active_items} aktive • {cs.sold_items} shitur
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-800 block">€{cs.capital_locked.toFixed(2)}</span>
                      {cs.active_items < 2 && (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                          Stok i Ulët!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. KONTROLLI FINANCIAR & FITIMI (FINANCE & P&L)                       */}
      {/* ==================================================================== */}
      {activeTab === 'financials' && financials && (
        <div className="space-y-6">
          {/* Initial Capital & Break Even */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Investimi Fillestar i Biznesit</span>
                <p className="text-3xl font-black text-white mt-0.5">€{financials.initialInvestment.toFixed(2)}</p>
              </div>

              <button
                onClick={() => {
                  setNewInvestmentInput(String(financials.initialInvestment));
                  setEditInvestmentModal(true);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
              >
                Ndrysho Investimin Fillestar
              </button>
            </div>

            {/* Break-even progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Përparimi i Kthimit të Investimit (Break-Even):</span>
                <span className="font-bold text-amber-400">{financials.breakEvenProgress}% i realizuar</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, financials.breakEvenProgress)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Fitimi neto i akumuluar: <strong>€{financials.netProfit.toFixed(2)}</strong> nga investimi fillestar prej €{financials.initialInvestment.toFixed(2)}.
              </p>
            </div>
          </div>

          {/* Currency Exchange Rate Management (EUR -> LEK) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  Kursi i Këmbimit Valutor (Euro € në Lek L)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Përcakton raportin e konvertimit për blerësit që duan të shohin çmimet në Lek shqiptar (ALL)
                </p>
              </div>

              <form onSubmit={handleSaveExchangeRate} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700">1 € =</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={exchangeRateInput}
                  onChange={(e) => setExchangeRateInput(e.target.value)}
                  className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:bg-white focus:outline-hidden focus:border-amber-500"
                />
                <span className="text-xs font-bold text-slate-700">Lek (ALL)</span>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs"
                >
                  Ruaj Kursin
                </button>
              </form>
            </div>

            {rateSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                ✓ {rateSuccessMsg}
              </div>
            )}
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Pasqyra e Fitimit dhe Humbjes (P&L Summary)</h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                Marzha e Fitimit: {financials.profitMarginPct}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500">Të Ardhurat Totale</span>
                <p className="text-xl font-black text-slate-900 mt-1">€{financials.totalRevenue.toFixed(2)}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500">Kosto e Mallit (COGS)</span>
                <p className="text-xl font-black text-slate-700 mt-1">€{financials.cogs.toFixed(2)}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500">Shpenzime Operative</span>
                <p className="text-xl font-black text-red-600 mt-1">€{financials.totalExpenses.toFixed(2)}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-emerald-700 font-semibold">Fitimi Neto i Pastër</span>
                <p className="text-xl font-black text-emerald-700 mt-1">€{financials.netProfit.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Operating Expenses Management */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Shpenzimet Operative (Dogana, Transporti, Paketimi)</h3>
                <p className="text-xs text-slate-500">Faturat dhe shpenzimet e zbritura nga fitimi i përgjithshëm</p>
              </div>

              <button
                onClick={() => setAddExpenseModal(true)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Regjistro Shpenzim të Ri
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Kategoria</th>
                    <th className="p-3">Përshkrimi</th>
                    <th className="p-3">Shënime</th>
                    <th className="p-3 font-mono">Shuma (€)</th>
                    <th className="p-3 text-right">Veprim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="p-3 font-mono text-slate-400">{exp.expense_date}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-slate-100 text-slate-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">{exp.title}</td>
                      <td className="p-3 text-slate-500">{exp.notes || '-'}</td>
                      <td className="p-3 font-mono font-black text-red-600">€{exp.amount.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. NJOFTIMET AUTOMATIKE & ALARMI I BIZNESIT (RISK & ALERTS)          */}
      {/* ==================================================================== */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500" />
                Qendra e Njoftimeve & Alarmeve të Biznesit
              </h3>
              <p className="text-xs text-slate-500">
                Alarme automatike për produkte të shitura, porosi të papaguara, stok të ulët dhe aktivitet të dyshimtë
              </p>
            </div>

            <button
              onClick={handleMarkAllNotifsRead}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Shëno të Gjitha si të Lexuara
            </button>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-xs">Nuk keni asnjë njoftim momentalisht.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                    n.is_read ? 'bg-slate-50/70 border-slate-100 opacity-70' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`p-2 rounded-xl mt-0.5 ${
                      n.severity === 'danger' ? 'bg-red-100 text-red-600' :
                      n.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                      n.severity === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {n.severity === 'danger' ? <AlertCircle className="w-4 h-4" /> :
                       n.severity === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                       n.severity === 'success' ? <CheckCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {new Date(n.created_at).toLocaleString('sq-XK')}
                      </span>
                    </div>
                  </div>

                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkNotifRead(n.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[10px] font-bold shrink-0"
                    >
                      Lexuar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. MENAXHIMI & VEPRIMET (PRODUCTS, ORDERS, USERS, LOGS)              */}
      {/* ==================================================================== */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          {/* Products Table with Create Button */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Kërko titull ose SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border rounded-xl text-xs w-60"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border rounded-xl text-xs"
                >
                  <option value="all">Të Gjitha Statuset</option>
                  <option value="active">Aktive</option>
                  <option value="sold">Shitura</option>
                  <option value="ended">Mbyllura</option>
                </select>
              </div>

              <button
                onClick={() => { resetProductForm(); setCreateModalOpen(true); }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Krijo Ankand të Ri
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-800 font-bold">
                  <tr>
                    <th className="p-2.5">Foto/SKU</th>
                    <th className="p-2.5">Titulli</th>
                    <th className="p-2.5">Kostoja</th>
                    <th className="p-2.5">Çmimi Aktual</th>
                    <th className="p-2.5">Rezerva</th>
                    <th className="p-2.5">Bli Menjëherë</th>
                    <th className="p-2.5">Oferta</th>
                    <th className="p-2.5">Statusi</th>
                    <th className="p-2.5 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="p-2.5 font-mono text-slate-500 text-[10px]">{p.sku}</td>
                      <td className="p-2.5 font-bold text-slate-900 max-w-[180px] truncate">{p.title}</td>
                      <td className="p-2.5 font-mono text-slate-500">€{p.cost_price.toFixed(2)}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">€{p.current_price.toFixed(2)}</td>
                      <td className="p-2.5 font-mono">
                        {p.reserve_price > 0 ? `€${p.reserve_price.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-2.5 font-mono">{p.buy_now_price ? `€${p.buy_now_price.toFixed(2)}` : '-'}</td>
                      <td className="p-2.5 font-bold">{p.total_bids}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'sold' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1 hover:bg-slate-200 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Fshini këtë ankand?')) {
                                api.deleteProduct(p.id).then(() => loadData());
                              }
                            }}
                            className="p-1 hover:bg-red-100 text-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders & Returns Table */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Menaxhimi i Porosive & Kthimeve (Returns)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-800">
                  <tr>
                    <th className="p-2.5">Porosia #</th>
                    <th className="p-2.5">Blerësi</th>
                    <th className="p-2.5">Produkti</th>
                    <th className="p-2.5">Qyteti</th>
                    <th className="p-2.5">Totali</th>
                    <th className="p-2.5">Kthimi (Return)</th>
                    <th className="p-2.5">Statusi</th>
                    <th className="p-2.5 text-right">Veprim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="p-2.5 font-mono font-bold">{o.order_number}</td>
                      <td className="p-2.5">{o.shipping_name}</td>
                      <td className="p-2.5 max-w-[150px] truncate">{o.product_title}</td>
                      <td className="p-2.5 font-bold">{o.shipping_city}</td>
                      <td className="p-2.5 font-mono font-black">€{o.total_amount.toFixed(2)}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.return_status === 'approved' ? 'bg-red-100 text-red-800' :
                          o.return_status === 'refunded' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {o.return_status || 'none'}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {o.order_status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => {
                            setReturnOrderModal(o);
                            setReturnStatus(o.return_status || 'approved');
                            setRefundAmount(String(o.total_amount));
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-bold text-[10px]"
                        >
                          Menaxho Kthimin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. IMPORTI MASIV I 9,000 PRODUKTEVE                                  */}
      {/* ==================================================================== */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Ngarko Skedar CSV</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!csvFile) return;
                setImportLoading(true);
                try {
                  const res = await api.uploadCSV(csvFile);
                  setImportResultMsg(res.message);
                  loadData();
                  onRefreshAuctions();
                } catch (err: any) {
                  setImportResultMsg('Gabim: ' + err.message);
                } finally {
                  setImportLoading(false);
                }
              }} className="space-y-3">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800"
                />
                <button
                  type="submit"
                  disabled={!csvFile || importLoading}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
                >
                  {importLoading ? 'Duke importuar...' : 'Fillo Importin'}
                </button>
              </form>
            </div>

            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Gjenero & Importo 9,000 Produkte menjëherë</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Krijon me shpejtësi 9,000 artikuj me fotografi, kosto, çmime dhe kategori duke testuar motorin me performancë të lartë.
                </p>
              </div>

              <button
                onClick={handleBulkTestGenerate}
                disabled={importLoading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md"
              >
                ⚡ Ekzekuto Testin Masiv të 9,000 Produkteve
              </button>
            </div>
          </div>

          {importResultMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold">
              {importResultMsg}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODALS                                                               */}
      {/* ==================================================================== */}
      {/* Edit Initial Investment Modal */}
      {editInvestmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="font-bold text-sm text-slate-900">Investimi Fillestar i Biznesit (€)</h3>
            <form onSubmit={handleSaveInitialInvestment} className="space-y-3">
              <input
                type="number"
                step="100"
                value={newInvestmentInput}
                onChange={(e) => setNewInvestmentInput(e.target.value)}
                placeholder="p.sh. 31000"
                className="w-full px-3 py-2 border rounded-xl text-sm font-bold font-mono"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">
                  Ruaj Investimin
                </button>
                <button type="button" onClick={() => setEditInvestmentModal(false)} className="px-3 py-2 bg-slate-100 rounded-xl text-xs">
                  Anulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {addExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">Regjistro Shpenzim Operativ</h3>
              <button onClick={() => setAddExpenseModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Kategoria</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                >
                  <option value="dogana">Dogana e Kosovës</option>
                  <option value="transport">Transporti & Frahti</option>
                  <option value="marketing">Marketing & Reklama</option>
                  <option value="operim">Qira & Operim Magazine</option>
                  <option value="paketim">Paketimi & Materiale</option>
                  <option value="tjeter">Shpenzime të Tjera</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Titulli i Shpenzimit / Faturës</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="p.sh. Zhdoganimi i kontingjentit"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Shuma (€ EUR)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="150.00"
                  className="w-full px-3 py-2 border rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Shënime Shtesë</label>
                <textarea
                  rows={2}
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl resize-none"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs">
                Ruaj Shpenzimin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Return & Refund Modal */}
      {returnOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">Menaxho Kthimin e Porosisë #{returnOrderModal.order_number}</h3>
              <button onClick={() => setReturnOrderModal(null)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleProcessReturn} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Statusi i Kthimit</label>
                <select
                  value={returnStatus}
                  onChange={(e) => setReturnStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                >
                  <option value="none">Asnjë kthim (none)</option>
                  <option value="requested">Kërkesë kthimi nga klienti</option>
                  <option value="approved">Kthim i aprovuar</option>
                  <option value="refunded">Rimbursuar (Refunded)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Shuma e Rimbursimit (€)</label>
                <input
                  type="number"
                  step="0.5"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Arsyeja / Shënime</label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl resize-none"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">
                Konfirmo Statusin e Kthimit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-sm text-slate-900">Edito Çmimet & Kostot #{editingProduct.sku}</h3>
              <button onClick={() => setEditingProduct(null)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Titulli</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kostoja e Blerjes (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingProduct.cost_price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, cost_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Çmimi Rezervë (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingProduct.reserve_price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, reserve_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Çmimi Bli Menjëherë (€)</label>
                <input
                  type="number"
                  step="0.5"
                  value={editingProduct.buy_now_price || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, buy_now_price: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl text-xs">
                Ruaj Ndryshimet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border my-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base text-slate-900">Krijo Ankand të Ri</h3>
              <button onClick={() => setCreateModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Titulli i Artikullit</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="p.sh. Apple iPhone 15 Pro Max"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kosto Blerjeje (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Çmimi Fillestar (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newStartPrice}
                    onChange={(e) => setNewStartPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Çmimi Rezervë (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newReservePrice}
                    onChange={(e) => setNewReservePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Bli Menjëherë (€)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newBuyNowPrice}
                    onChange={(e) => setNewBuyNowPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Gjendja</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  >
                    <option value="A">Klasa A (Si e re me paketim)</option>
                    <option value="B">Klasa B (E përdorur mirë)</option>
                    <option value="C">Klasa C (Shenja përdorimi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">URL e Fotografive (; për të ndarë)</label>
                <input
                  type="text"
                  value={newImages}
                  onChange={(e) => setNewImages(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Përshkrimi</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl resize-none"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 font-bold rounded-xl text-slate-950">
                Publiko Ankandin
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
