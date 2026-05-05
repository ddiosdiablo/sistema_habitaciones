import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './pages/Dashboard';
import { Habitaciones } from './pages/Habitaciones';
import { Clientes } from './pages/Clientes';
import { Ingresos } from './pages/Ingresos';
import { Configuracion } from './pages/Configuracion';
import { HistorialRecibos } from './pages/HistorialRecibos';
import { Login } from './pages/Login';
import { useAppStore } from './store/appStore';

export const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkMode, isLoading, isAuthenticated, loadFromSupabase, config, login } = useAppStore();

  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !config?.usuarioAdmin) {
      login('', '');
    }
  }, [isLoading, isAuthenticated, config?.usuarioAdmin, login]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && config?.usuarioAdmin) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <TopBar
          sidebarCollapsed={sidebarCollapsed}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main
          className={`pt-16 min-h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56'
          }`}
        >
          <div className="p-3 sm:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/habitaciones" element={<Habitaciones />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/ingresos" element={<Ingresos />} />
              <Route path="/recibos" element={<HistorialRecibos />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
