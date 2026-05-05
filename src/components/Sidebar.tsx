import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  DollarSign,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habitaciones', icon: BedDouble, label: 'Habitaciones' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/ingresos', icon: DollarSign, label: 'Ingresos' },
  { to: '/recibos', icon: FileText, label: 'Recibos' },
  { to: '/configuracion', icon: Settings, label: 'Configuración' },
];

export const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) => {
  const { config } = useAppStore();
  
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 z-50
          lg:left-0 lg:z-40
          ${mobileOpen ? 'left-0 z-50' : '-left-56 lg:left-0'}
          ${collapsed ? 'lg:w-16' : 'lg:w-56'}
          w-56
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
            {!collapsed && (
              <h1 className="text-lg font-bold text-primary dark:text-primary-light">
                {config.nombre}
              </h1>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={onToggle}
                className="hidden lg:block p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
              <button
                onClick={onMobileClose}
                className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:text-primary-light font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`
                }
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
