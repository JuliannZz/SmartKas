import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Receipt,
} from 'lucide-react';
import api from '../../services/api';
import transactionService from '../../services/transactionService';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data?.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) return;
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stock) return item;
          return { ...item, qty: newQty };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.sellPrice * item.qty, 0);
  const tax = 0;
  const total = subtotal + tax;
  const change = cashAmount - total;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      const txData = {
        items: cart.map((item) => ({
          productId: item.id,
          qty: item.qty,
          price: item.sellPrice,
        })),
        total,
        paymentMethod,
        cashAmount: paymentMethod === 'cash' ? cashAmount : total,
      };

      const response = await transactionService.create(txData);
      setLastTransaction({ ...txData, id: response?.data?.id, date: new Date() });
      setShowReceipt(true);
      setCart([]);
      setCashAmount(0);
      fetchProducts();
    } catch {
      alert('Transaksi gagal. Coba lagi.');
    } finally {
      setProcessing(false);
    }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID').format(num || 0);

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Product List */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 bg-white shadow-sm transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton h-32 rounded-2xl"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <ShoppingCart size={48} className="mb-3" />
              <p className="text-sm">Tidak ada produk ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 text-left hover:shadow-md hover:border-orange-200 transition-all ${
                    product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                    <span className="text-orange-500 font-bold text-sm">
                      {product.name?.[0] || '?'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stok: {product.stock} {product.unit || 'pcs'}
                  </p>
                  <p className="text-sm font-bold text-orange-500 mt-2">
                    Rp {formatRupiah(product.sellPrice)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-[380px] bg-white rounded-2xl shadow-md flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-orange-500" />
            <h3 className="text-base font-bold text-slate-800">Keranjang</h3>
            {cart.length > 0 && (
              <span className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full ml-auto">
                {cart.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <Receipt size={40} className="mb-2" />
              <p className="text-sm">Keranjang kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-orange-500 font-semibold">
                    Rp {formatRupiah(item.sellPrice)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors ml-1"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Section */}
        <div className="p-5 border-t border-slate-100 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-semibold text-slate-800">
              Rp {formatRupiah(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span className="text-slate-800">Total</span>
            <span className="text-orange-500">Rp {formatRupiah(total)}</span>
          </div>

          {/* Payment Method */}
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                paymentMethod === 'cash'
                  ? 'bg-orange-50 border-orange-400 text-orange-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Banknote size={16} />
              Tunai
            </button>
            <button
              onClick={() => setPaymentMethod('transfer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                paymentMethod === 'transfer'
                  ? 'bg-orange-50 border-orange-400 text-orange-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <CreditCard size={16} />
              Transfer
            </button>
          </div>

          {paymentMethod === 'cash' && cart.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">
                Uang Dibayar
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  value={cashAmount || ''}
                  onChange={(e) => setCashAmount(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                  placeholder="0"
                />
              </div>
              {cashAmount > 0 && cashAmount >= total && (
                <p className="text-xs text-emerald-500 font-semibold mt-1">
                  Kembalian: Rp {formatRupiah(change)}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={
              cart.length === 0 ||
              processing ||
              (paymentMethod === 'cash' && cashAmount < total)
            }
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-bold hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </span>
            ) : (
              `Bayar Rp ${formatRupiah(total)}`
            )}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Transaksi Berhasil!
              </h3>
              <p className="text-sm text-slate-500">
                {new Date(lastTransaction.date).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-4 space-y-2">
              {lastTransaction.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    {item.qty}x Item
                  </span>
                  <span className="font-semibold text-slate-800">
                    Rp {formatRupiah(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-200 mt-3 pt-3">
              <div className="flex justify-between text-base font-bold">
                <span className="text-slate-800">Total</span>
                <span className="text-orange-500">
                  Rp {formatRupiah(lastTransaction.total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowReceipt(false)}
              className="w-full mt-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-bold hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-200 transition-all"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
