import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface FinanceAuthPromptProps {
  children: React.ReactNode;
}

export const FinanceAuthPrompt = ({ children }: FinanceAuthPromptProps) => {
  const { config } = useAppStore();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [verified, setVerified] = useState(false);

  if (!config.contrasenaAdmin) {
    return <>{children}</>;
  }

  if (verified) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === config.contrasenaAdmin) {
      setVerified(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Acceso Restringido
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm">
              Ingresa la contraseña de administrador para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
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
                  placeholder="Contraseña de administrador"
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  autoFocus
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center p-3 rounded-lg">
                Contraseña incorrecta
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
            >
              Acceder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
