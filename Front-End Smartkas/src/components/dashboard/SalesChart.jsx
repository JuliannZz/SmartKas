import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const SalesChart = ({ salesData, profitData, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6">
          <div className="skeleton h-6 w-48 mb-6"></div>
          <div className="skeleton h-64 w-full"></div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="skeleton h-6 w-40 mb-6"></div>
          <div className="skeleton h-64 w-full"></div>
        </div>
      </div>
    );
  }

  const defaultSalesData = [
    { month: 'Jan', penjualan: 1500000, pembelian: 800000 },
    { month: 'Feb', penjualan: 2000000, pembelian: 1000000 },
    { month: 'Mar', penjualan: 1800000, pembelian: 900000 },
    { month: 'Apr', penjualan: 2800000, pembelian: 1200000 },
    { month: 'Mei', penjualan: 2500000, pembelian: 1100000 },
    { month: 'Jun', penjualan: 3200000, pembelian: 1500000 },
  ];

  const defaultProfitData = [
    { month: 'Jan', profit: 700000 },
    { month: 'Feb', profit: 1400000 },
    { month: 'Mar', profit: 900000 },
    { month: 'Apr', profit: 1000000 },
    { month: 'Mei', profit: 1200000 },
    { month: 'Jun', profit: 1700000 },
  ];

  const chartSalesData = salesData || defaultSalesData;
  const chartProfitData = profitData || defaultProfitData;

  const formatCurrency = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
    return value;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3">
          <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: Rp {entry.value?.toLocaleString('id-ID')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
      {/* Sales & Purchase Bar Chart */}
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-base font-bold text-slate-800 mb-6">
          Grafik Penjualan & Pembelian
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartSalesData} barGap={4}>
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
              dataKey="penjualan"
              name="Penjualan"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="pembelian"
              name="Pembelian"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Trend Line Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-base font-bold text-slate-800 mb-6">
          Tren Keuntungan
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartProfitData}>
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
            <Line
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
