import { useState, useEffect } from 'react';
import { Package, DollarSign, BarChart3 } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import ProductTable from '../../components/product/ProductTable';
import productService from '../../services/productService';

const Product = () => {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    inventoryValue: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await productService.getAll();
      const products = response.data || [];
      const total = products.length;
      const value = products.reduce(
        (sum, p) => sum + (p.sellPrice || 0) * (p.stock || 0),
        0
      );
      const low = products.filter(
        (p) => (p.stock || 0) <= (p.minStock || 10)
      ).length;
      setSummary({ totalProducts: total, inventoryValue: value, lowStock: low });
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num) => {
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)}jt`;
    if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)}rb`;
    return `Rp ${num}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-md p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-4 translate-x-4"></div>
          <p className="text-sm text-orange-100 font-medium">Total Produk</p>
          <h3 className="text-3xl font-bold mt-1">
            {loading ? '—' : summary.totalProducts}
          </h3>
          <Package
            size={28}
            className="absolute top-5 right-5 text-white/40"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 relative">
          <p className="text-sm text-slate-500 font-medium">Nilai Inventori</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">
            {loading ? '—' : formatRupiah(summary.inventoryValue)}
          </h3>
          <DollarSign
            size={28}
            className="absolute top-5 right-5 text-orange-400"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 relative border-l-4 border-red-400">
          <p className="text-sm text-slate-500 font-medium">Stok Rendah</p>
          <h3 className="text-2xl font-bold text-red-500 mt-1">
            {loading ? '—' : summary.lowStock}
          </h3>
          <BarChart3
            size={28}
            className="absolute top-5 right-5 text-red-300"
          />
        </div>
      </div>

      {/* Product Table */}
      <ProductTable />
    </div>
  );
};

export default Product;
