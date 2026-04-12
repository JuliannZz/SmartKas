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
        <StatCard
          title="Total Produk"
          value={loading ? '—' : summary.totalProducts}
          icon={Package}
          iconBg="bg-orange-100"
          iconColor="text-orange-500"
          subtitle="Jumlah seluruh produk"
        />

        <StatCard
          title="Nilai Inventori"
          value={loading ? '—' : formatRupiah(summary.inventoryValue)}
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-500"
          subtitle="Total nilai stok"
        />

        <StatCard
          title="Stok Rendah"
          value={loading ? '—' : summary.lowStock}
          icon={BarChart3}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          subtitle="Perlu restok"
        />
      </div>

      {/* Product Table */}
      <ProductTable />
    </div>
  );
};

export default Product;
