import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { ReactNode } from 'react';

interface PasswordGateProps {
  children: ReactNode;
}

export const PasswordGate = ({ children }: PasswordGateProps) => {
  const { config } = useAppStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.contrasenaAdmin && password === config.contrasenaAdmin) {
      setUnlocked(true);
      setError(false);
    } else if (!config.contrasenaAdmin) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Configuración Protegida
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Ingrese la contraseña para acceder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Contraseña"
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">
              Contraseña incorrecta
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
          >
            Desbloquear
          </button>
        </form>
      </div>
    </div>
  );
};