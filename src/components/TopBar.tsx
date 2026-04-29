import { Moon, Sun, Home, Menu } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface TopBarProps {
  sidebarCollapsed: boolean;
  onMenuToggle?: () => void;
}

export const TopBar = ({ sidebarCollapsed, onMenuToggle }: TopBarProps) => {
  const { darkMode, toggleDarkMode } = useAppStore();

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 z-30 transition-all duration-300
        lg:left-auto
        ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-56'}
        left-0
      `}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
          >
            <Menu size={20} />
          </button>
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <Home className="w-4 h-4 text-primary dark:text-primary-light" />
            </div>
            <div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {obtenerSaludo()}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 ml-2">
                Bienvenido
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};
