import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import Product from '../pages/product/Product';
import Stock from '../pages/stock/Stock';
import POS from '../pages/transaction/POS';
import Finance from '../pages/finance/Finance';

const DashboardLayout = () => <MainLayout title="Dashboard" subtitle="Selamat datang kembali" />;
const ProductLayout = () => <MainLayout title="Produk" subtitle="Selamat datang kembali" />;
const StockLayout = () => <MainLayout title="Stok" subtitle="Selamat datang kembali" />;
const POSLayout = () => <MainLayout title="Kasir" subtitle="Point of Sale" />;
const FinanceLayout = () => <MainLayout title="Keuangan" subtitle="Laporan keuangan" />;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes - Dashboard */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Protected Routes - Products */}
      <Route
        element={
          <ProtectedRoute>
            <ProductLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/products" element={<Product />} />
      </Route>

      {/* Protected Routes - Stock */}
      <Route
        element={
          <ProtectedRoute>
            <StockLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/stock" element={<Stock />} />
      </Route>

      {/* Protected Routes - POS */}
      <Route
        element={
          <ProtectedRoute>
            <POSLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/pos" element={<POS />} />
      </Route>

      {/* Protected Routes - Finance */}
      <Route
        element={
          <ProtectedRoute>
            <FinanceLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/finance" element={<Finance />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
