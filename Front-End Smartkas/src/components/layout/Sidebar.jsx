import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Wallet,
  ShoppingCart,
  LogOut,
  X,
} from 'lucide-react';
import authService from '../../services/authService';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Produk', icon: Package, path: '/products' },
  { name: 'Stok', icon: Warehouse, path: '/stock' },
  { name: 'Transaksi', icon: ShoppingCart, path: '/pos' },
  { name: 'Laporan', icon: Wallet, path: '/finance' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-gradient-to-b from-orange-600 to-orange-700 z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-white text-xl font-bold tracking-tight">Smartkas</h1>
            <p className="text-orange-200 text-xs mt-0.5">Kelola bisnis Anda</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white lg:block transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 mt-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-white text-orange-600 shadow-md'
                      : 'text-white/90 hover:bg-white/15 hover:text-white'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/90 hover:bg-white/15 hover:text-white transition-all duration-200 w-full"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
