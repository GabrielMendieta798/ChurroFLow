import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Receipt, Wallet, Package,
  Boxes, BookOpen, Truck, BarChart3, LogOut, ChevronRight, Users, Tags, Factory,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pos', label: 'Punto de Venta', icon: ShoppingCart },
  { to: '/ventas', label: 'Ventas', icon: Receipt },
  { to: '/caja', label: 'Caja', icon: Wallet },
  { to: '/produccion', label: 'Producción', icon: Factory },
  { to: '/compras', label: 'Compras', icon: Truck },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/listas-precio', label: 'Listas de Precio', icon: Tags },
  { to: '/stock', label: 'Stock', icon: BarChart3 },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/insumos', label: 'Insumos', icon: Boxes },
  { to: '/recetas', label: 'Recetas', icon: BookOpen },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-white text-xl font-bold">Oh My Churro</h1>
          <p className="text-gray-400 text-xs mt-1">Sistema de Gestión</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.nombre?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.nombre}</p>
              <p className="text-gray-400 text-xs">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full">
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
