import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Building2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export const Login = () => {
  const { config, login, isAuthenticated } = useAppStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      setIsLoading(false);
      if (success) {
        navigate('/', { replace: true });
      } else {
        setError(true);
        setPassword('');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-900/15 to-blue-900/5" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-blue-900/15 to-blue-900/5" />
      <div className="absolute top-1/3 -left-20 w-48 h-48 rounded-full bg-gradient-to-br from-blue-900/10 to-transparent" />
      <div className="absolute bottom-1/3 -right-20 w-48 h-48 rounded-full bg-gradient-to-bl from-blue-900/10 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full border border-blue-900/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] h-[24rem] rounded-full border border-blue-900/5" />

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-blue-900">
              {config.nombre || 'Gestor de Habitaciones'}
            </h1>
            <p className="text-neutral-500 mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(false);
                  }}
                  placeholder="Ingresa tu usuario"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-900 focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900/30 focus:bg-white transition-all"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Ingresa tu contraseña"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-900 focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900/30 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm text-center p-3 rounded-xl border border-red-100">
                Usuario o contraseña incorrectos
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {!config.usuarioAdmin && (
            <p className="text-xs text-neutral-400 text-center">
              Configura tu usuario en la página de Configuración
            </p>
          )}
        </div>

        <p className="text-xs text-neutral-400 text-center mt-6">
          &copy; {new Date().getFullYear()} {config.nombre || 'HabitaGest'}. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
