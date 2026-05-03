import { useState, useEffect } from 'react';
import { TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import SalesChart from '../../components/dashboard/SalesChart';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [stockAlerts, setStockAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, salesRes, profitRes, txRes] = await Promise.allSettled([
        api.get('/dashboard/stats'),
        api.get('/dashboard/sales-chart'),
        api.get('/dashboard/profit-chart'),
        api.get('/dashboard/recent-transactions'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (salesRes.status === 'fulfilled') setSalesData(salesRes.value.data?.data);
      if (profitRes.status === 'fulfilled') setProfitData(profitRes.value.data?.data);
      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value.data?.transactions);
        setStockAlerts(txRes.value.data?.stockAlerts);
      }
    } catch (err) {
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}M`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
    return value.toString();
  };

  const statCards = [
    {
      title: 'Total Penjualan',
      value: stats ? `Rp ${formatCurrency(stats.totalSales)}` : 'Rp 0',
      subtitle: stats?.salesGrowth !== undefined ? `${stats.salesGrowth}% dari bulan lalu` : '',
      icon: TrendingUp,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      trend: true,
      trendUp: stats?.salesGrowth > 0,
    },
    {
      title: 'Total Produk',
      value: stats?.totalProducts?.toString() || '0',
      subtitle: stats?.totalCategories ? `${stats.totalCategories} Kategori` : '',
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Stok Menipis',
      value: stats?.lowStock?.toString() || '0',
      subtitle: 'Perlu restock',
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Laba Bersih',
      value: stats ? `Rp ${formatCurrency(stats.netProfit)}` : 'Rp 0',
      subtitle: stats?.profitGrowth !== undefined ? `${stats.profitGrowth}% dari bulan lalu (Margin ${stats.profitMargin}%)` : '',
      icon: DollarSign,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      trend: true,
      trendUp: stats?.profitGrowth > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-5">
                <div className="skeleton h-4 w-24 mb-3"></div>
                <div className="skeleton h-8 w-32 mb-2"></div>
                <div className="skeleton h-3 w-28"></div>
              </div>
            ))
          : statCards.map((card, idx) => (
              <StatCard key={idx} {...card} />
            ))}
      </div>

      {/* Charts */}
      <SalesChart
        salesData={salesData}
        profitData={profitData}
        loading={loading}
      />

      {/* Recent Transactions & Stock Alerts */}
      <RecentTransactions
        transactions={transactions}
        stockAlerts={stockAlerts}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;
