import { useState, useEffect } from 'react';
import {
  Package,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard from '../../components/dashboard/StatCard';
import api from '../../services/api';

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6'];

const Stock = () => {
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes] = await Promise.all([
        api.get('/dashboard/stock-stats').catch(() => ({ data: {} })),
        api.get('/products').catch(() => ({ data: { data: [] } }))
      ]);

      const stats = statsRes.data || {};
      const products = productsRes.data?.data || [];

      const lowStock = products.filter((p) => (p.stock || 0) <= (p.minStock || 10));
      setLowStockProducts(lowStock);

      setStockData({
        totalStock: stats.totalStock || 0,
        stockIn: stats.stockIn || 0,
        stockOut: stats.stockOut || 0,
        warnings: stats.warnings || lowStock.length,
        stockMovement: stats.stockMovement || [],
        categoryDistribution: stats.categoryDistribution || [],
        products,
      });
    } catch {
      setStockData({
        totalStock: 0,
        stockIn: 0,
        stockOut: 0,
        warnings: 0,
        stockMovement: [],
        categoryDistribution: [],
        products: [],
      });
      setLowStockProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Stok',
      value: stockData?.totalStock?.toString() || '0',
      subtitle: 'Item di gudang',
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Stok Masuk',
      value: stockData?.stockIn?.toString() || '0',
      subtitle: 'Minggu ini',
      icon: ArrowUpRight,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Stok Keluar',
      value: stockData?.stockOut?.toString() || '0',
      subtitle: 'Minggu ini',
      icon: ArrowDownRight,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Peringatan',
      value: stockData?.warnings?.toString() || '0',
      subtitle: 'Stok rendah',
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3">
          <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ name, percent }) => {
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

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
          : statCards.map((card, idx) => <StatCard key={idx} {...card} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Movement Bar Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6 animate-fade-in">
          <h3 className="text-base font-bold text-slate-800 mb-6">
            Pergerakan Stok Bulanan
          </h3>
          {loading ? (
            <div className="skeleton h-64 w-full"></div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stockData?.stockMovement || []} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                  iconType="square"
                  iconSize={10}
                />
                <Bar
                  dataKey="masuk"
                  name="Stok Masuk"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                />
                <Bar
                  dataKey="keluar"
                  name="Stok Keluar"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white rounded-2xl shadow-md p-6 animate-fade-in">
          <h3 className="text-base font-bold text-slate-800 mb-6">
            Distribusi Stok per Kategori
          </h3>
          {loading ? (
            <div className="skeleton h-64 w-full"></div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stockData?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderCustomLabel}
                  labelLine={true}
                >
                  {(stockData?.categoryDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-2xl shadow-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" />
            <h3 className="text-base font-bold text-slate-800">
              Produk Stok Rendah
            </h3>
          </div>
          <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">
            {lowStockProducts.length} Produk
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14 w-full"></div>
            ))}
          </div>
        ) : lowStockProducts.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            Semua stok dalam kondisi aman
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-4 py-3">
                    Produk
                  </th>
                  <th className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-4 py-3">
                    Kategori
                  </th>
                  <th className="text-center text-xs font-bold text-orange-500 uppercase tracking-wider px-4 py-3">
                    Stok Saat Ini
                  </th>
                  <th className="text-center text-xs font-bold text-orange-500 uppercase tracking-wider px-4 py-3">
                    Stok Minimum
                  </th>
                  <th className="text-center text-xs font-bold text-orange-500 uppercase tracking-wider px-4 py-3">
                    Selisih
                  </th>
                  <th className="text-center text-xs font-bold text-orange-500 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product, idx) => {
                  const diff = (product.stock || 0) - (product.minStock || 10);
                  const percentage = Math.round(
                    ((product.stock || 0) / (product.minStock || 10)) * 100
                  );
                  return (
                    <tr
                      key={product.id || idx}
                      className="border-b border-slate-50 hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                        {product.name}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-bold text-red-500">
                        {product.stock}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-slate-600">
                        {product.minStock || 10}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-bold text-red-500">
                        {diff}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor:
                                  percentage < 30
                                    ? '#ef4444'
                                    : percentage < 60
                                    ? '#f59e0b'
                                    : '#22c55e',
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;
