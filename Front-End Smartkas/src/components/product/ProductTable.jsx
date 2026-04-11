import { useState, useEffect } from 'react';
import { Pencil, Trash2, Search, Plus, Download } from 'lucide-react';
import productService from '../../services/productService';

const categories = ['Semua', 'Sembako', 'Protein', 'Minuman', 'Snack', 'Bumbu', 'Toiletries'];

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Sembako',
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    minStock: 10,
    unit: 'Pcs',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll();
      setProducts(response.data || []);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data produk');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
      } else {
        await productService.create(formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (err) {
      alert('Gagal menyimpan produk');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku || '',
      name: product.name || '',
      description: product.description || '',
      category: product.category || 'Sembako',
      buyPrice: product.buyPrice || 0,
      sellPrice: product.sellPrice || 0,
      stock: product.stock || 0,
      minStock: product.minStock || 10,
      unit: product.unit || 'Pcs',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await productService.delete(id);
        fetchProducts();
      } catch (err) {
        alert('Gagal menghapus produk');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      category: 'Sembako',
      buyPrice: 0,
      sellPrice: 0,
      stock: 0,
      minStock: 10,
      unit: 'Pcs',
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetForm();
    const nextSku = `PRD-${String(products.length + 1).padStart(3, '0')}`;
    setFormData((prev) => ({ ...prev, sku: nextSku }));
    setShowModal(true);
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === 'Semua' || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const formatRupiah = (num) =>
    new Intl.NumberFormat('id-ID').format(num || 0);

  const getStockStatus = (stock, minStock) => {
    if (stock <= (minStock || 10) * 0.3)
      return { label: 'Rendah', color: 'text-red-500 bg-red-50' };
    if (stock <= (minStock || 10))
      return { label: 'Normal', color: 'text-emerald-600 bg-emerald-50' };
    return { label: 'Normal', color: 'text-emerald-600 bg-emerald-50' };
  };

  const getMargin = (buy, sell) => {
    if (!buy || buy === 0) return '0%';
    return `+${(((sell - buy) / buy) * 100).toFixed(1)}%`;
  };

  return (
    <div>
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari produk (nama atau SKU)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer">
            <option>Semua</option>
            <option>Terbaru</option>
            <option>Stok Rendah</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-200 transition-all"
          >
            <Plus size={16} />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeCategory === cat
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-14 w-full mb-3"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-6 py-4">
                    SKU
                  </th>
                  <th className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-6 py-4">
                    Produk
                  </th>
                  <th className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-6 py-4">
                    Kategori
                  </th>
                  <th className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-6 py-4">
                    Harga Beli
                  </th>
                  <th className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-6 py-4">
                    Harga Jual
                  </th>
                  <th className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-6 py-4">
                    Margin
                  </th>
                  <th className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-6 py-4">
                    Stok
                  </th>
                  <th className="text-left text-xs font-bold text-orange-500 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-center text-xs font-bold text-orange-500 uppercase tracking-wider px-6 py-4">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, idx) => {
                  const status = getStockStatus(product.stock, product.minStock);
                  return (
                    <tr
                      key={product.id || idx}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                            <span className="text-orange-500 text-xs font-bold">
                              {(product.name || '?')[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="text-xs text-slate-400 truncate max-w-[200px]">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        Rp {formatRupiah(product.buyPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        Rp {formatRupiah(product.sellPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-500">
                        {getMargin(product.buyPrice, product.sellPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm font-bold text-slate-800">
                            {product.stock} {product.unit || 'pcs'}
                          </span>
                          <p className="text-xs text-slate-400">
                            Min {product.minStock || 10}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-orange-600">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 cursor-pointer"
                  >
                    {categories
                      .filter((c) => c !== 'Semua')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Minyak Goreng 1L"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">
                  Deskripsi
                </label>
                <textarea
                  placeholder="Deskripsi produk (opsional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">
                    Harga Beli *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={formData.buyPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buyPrice: Number(e.target.value),
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">
                    Harga Jual *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={formData.sellPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sellPrice: Number(e.target.value),
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">
                    Stok Awal *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">
                    Stok Minimum *
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStock: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">
                    Satuan *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 cursor-pointer"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Liter">Liter</option>
                    <option value="Pack">Pack</option>
                    <option value="Dus">Dus</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-200 transition-all"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
