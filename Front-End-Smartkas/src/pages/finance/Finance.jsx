import { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
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
  AreaChart,
  Area,
} from 'recharts';
import StatCard from '../../components/dashboard/StatCard';
import financeService from '../../services/financeService';

const Finance = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await financeService.getReport(period);
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await financeService.exportPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'laporan-keuangan.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengexport PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await financeService.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'laporan-keuangan.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengexport Excel');
    }
  };



  const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(num || 0);
  const formatCurrency = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
    return value;
  };

  const statCards = [
    {
      title: 'Total Pendapatan',
      value: `Rp ${formatCurrency(report?.totalRevenue ?? 33200000)}`,
      subtitle: '+12.5% dari bulan lalu',
      icon: Wallet,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
      trend: true,
      trendUp: true,
    },
    {
      title: 'Total Pengeluaran',
      value: `Rp ${formatCurrency(report?.totalExpense ?? 19300000)}`,
      subtitle: '+8.2% dari bulan lalu',
      icon: TrendingDown,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      trend: true,
      trendUp: false,
    },
    {
      title: 'Laba Bersih',
      value: `Rp ${formatCurrency(report?.netProfit ?? 13900000)}`,
      subtitle: '+18.3% dari bulan lalu',
      icon: TrendingUp,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
      trend: true,
      trendUp: true,
    },
    {
      title: 'Margin Laba',
      value: `${report?.profitMargin ?? 41.9}%`,
      subtitle: 'Margin sehat',
      icon: DollarSign,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3">
          <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.value > 100
                ? `Rp ${formatRupiah(entry.value)}`
                : `${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
          >
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors"
          >
            <FileText size={16} className="text-red-500" />
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors"
          >
            <FileSpreadsheet size={16} className="text-emerald-500" />
            Export Excel
          </button>
        </div>
      </div>

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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expense Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 animate-fade-in">
          <h3 className="text-base font-bold text-slate-800 mb-6">
            Pendapatan vs Pengeluaran
          </h3>
          {loading ? (
            <div className="skeleton h-64 w-full"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report?.revenueData || []} barGap={4}>
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
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                  iconType="square"
                  iconSize={10}
                />
                <Bar
                  dataKey="pendapatan"
                  name="Pendapatan"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                />
                <Bar
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Profit Margin Trend */}
        <div className="bg-white rounded-2xl shadow-md p-6 animate-fade-in">
          <h3 className="text-base font-bold text-slate-800 mb-6">
            Tren Margin Laba
          </h3>
          {loading ? (
            <div className="skeleton h-64 w-full"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={report?.profitTrend || []}>
                <defs>
                  <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="margin"
                  name="Margin"
                  stroke="#f97316"
                  strokeWidth={3}
                  fill="url(#colorMargin)"
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-2xl shadow-md p-6 animate-fade-in">
        <h3 className="text-base font-bold text-slate-800 mb-5">
          Ringkasan Keuangan Bulanan
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-12 w-full"></div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Bulan', 'Pendapatan', 'Pengeluaran', 'Laba', 'Margin'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-4 py-3"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {(report?.revenueData || []).map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                      {row.month}
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-600 font-medium">
                      Rp {formatRupiah(row.pendapatan)}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-500 font-medium">
                      Rp {formatRupiah(row.pengeluaran)}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">
                      Rp {formatRupiah(row.profit)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        {row.pendapatan
                          ? ((row.profit / row.pendapatan) * 100).toFixed(1)
                          : 0}
                        %
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
