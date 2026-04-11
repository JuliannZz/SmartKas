import { ShoppingCart, AlertTriangle } from 'lucide-react';

const RecentTransactions = ({ transactions, stockAlerts, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6">
          <div className="skeleton h-6 w-48 mb-4"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-14 w-full mb-3"></div>
          ))}
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="skeleton h-6 w-40 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 w-full mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  const defaultTransactions = [
    { id: 1, product: 'Minyak Goreng 1L', qty: '10 item', time: '10 menit lalu', amount: 150000, type: 'in' },
    { id: 2, product: 'Beras Premium 5kg', qty: '2 item', time: '25 menit lalu', amount: 350000, type: 'in' },
    { id: 3, product: 'Gula Pasir 1kg', qty: '30 item', time: '1 jam lalu', amount: 200000, type: 'out' },
    { id: 4, product: 'Telur 1kg', qty: '15 item', time: '2 jam lalu', amount: 420000, type: 'in' },
  ];

  const defaultStockAlerts = [
    { id: 1, product: 'Minyak Goreng 1L', stock: 5, minStock: 20, unit: 'pcs' },
    { id: 2, product: 'Tepung Terigu 1kg', stock: 8, minStock: 15, unit: 'pcs' },
    { id: 3, product: 'Kopi Bubuk 100g', stock: 3, minStock: 10, unit: 'pcs' },
  ];

  const displayTransactions = transactions || defaultTransactions;
  const displayAlerts = stockAlerts || defaultStockAlerts;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
      {/* Recent Transactions */}
      <div className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800">
            Transaksi Terbaru
          </h3>
          <button className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors">
            Lihat Semua
          </button>
        </div>

        <div className="space-y-3">
          {displayTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{tx.product}</p>
                  <p className="text-xs text-slate-400">
                    {tx.qty} · {tx.time}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-bold ${
                  tx.type === 'in' ? 'text-emerald-500' : 'text-slate-700'
                }`}
              >
                {tx.type === 'in' ? '+' : ''}Rp {formatRupiah(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Warnings */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800">
            Peringatan Stok
          </h3>
          <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">
            {displayAlerts.length} Produk
          </span>
        </div>

        <div className="space-y-3">
          {displayAlerts.map((item) => {
            const percentage = Math.round((item.stock / item.minStock) * 100);
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-100 hover:border-orange-200 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{item.product}</p>
                    <AlertTriangle size={14} className="text-amber-500" />
                  </div>
                  <span className="text-xs text-slate-400">Min {item.minStock} {item.unit}</span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-slate-500">Stok {item.stock} {item.unit}</p>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: percentage < 30 ? '#ef4444' : percentage < 60 ? '#f59e0b' : '#22c55e',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;
