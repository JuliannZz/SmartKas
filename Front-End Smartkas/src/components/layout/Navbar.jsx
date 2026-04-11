import { Bell, User } from 'lucide-react';
import { Menu } from 'lucide-react';
import authService from '../../services/authService';

const Navbar = ({ title, subtitle, onMenuToggle }) => {
  const user = authService.getCurrentUser();

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 py-4 bg-white border-b border-slate-200/60">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-slate-600 hover:text-slate-800 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user?.name || 'Admin'}
            </p>
            <p className="text-xs text-slate-500">
              {user?.role || 'Pemilik Toko'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
