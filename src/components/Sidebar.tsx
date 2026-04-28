import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habitaciones', icon: BedDouble, label: 'Habitaciones' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/ingresos', icon: DollarSign, label: 'Ingresos' },
  { to: '/configuracion', icon: Settings, label: 'Configuración' },
];

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { config } = useAppStore();
  
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          {!collapsed && (
            <h1 className="text-lg font-bold text-primary dark:text-primary-light">
              {config.nombre}
            </h1>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
  );
};