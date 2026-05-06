import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Save, RotateCcw, UploadCloud, Lock } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export const Configuracion = () => {
  const { config, updateConfig, clearTransacciones, syncToSupabase } = useAppStore();
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [verified, setVerified] = useState(!config.contrasenaAdmin);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [formData, setFormData] = useState({
    nombre: config.nombre,
    direccion: config.direccion,
    telefono: config.telefono,
    email: config.email || '',
    leyendaPieRecibo: config.leyendaPieRecibo,
    impuestoRecibo: config.impuestoRecibo,
    tarifaDiariaDefault: config.tarifaDiariaDefault,
    tariffMensualDefault: config.tariffMensualDefault,
    usuarioAdmin: config.usuarioAdmin || '',
    contrasenaAdmin: config.contrasenaAdmin || '',
    horaCheckout: config.horaCheckout || '13:00',
    proximoNumeroRecibo: config.proximoNumeroRecibo,
  });

  const [guardado, setGuardado] = useState(false);

  const handleVerifyPassword = () => {
    if (passwordInput === config.contrasenaAdmin) {
      setVerified(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSave = () => {
    updateConfig(formData);
    setGuardado(true);
    setRedirect(true);
  };

  if (redirect) {
    return <Navigate to="/" replace />;
  }

  if (!verified) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl sm:max-w-sm w-full p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Acceso restringido
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Ingresa la contraseña de administrador para acceder a la configuración
            </p>
          </div>

          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleVerifyPassword();
            }}
            placeholder="Contraseña de administrador"
            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
            autoFocus
          />

          {passwordError && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              Contraseña incorrecta
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-sm"
            >
              Volver
            </button>
            <button
              onClick={handleVerifyPassword}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm"
            >
              Acceder
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Configuración
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Configura tu negocio
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Datos del Negocio
        </h2>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Nombre del Negocio
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Dirección
          </label>
          <input
            type="text"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Configuración de Recibos
        </h2>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Leyenda al Pie del Recibo
          </label>
          <textarea
            value={formData.leyendaPieRecibo}
            onChange={(e) => setFormData({ ...formData, leyendaPieRecibo: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Impuesto (%)
          </label>
          <input
            type="number"
            value={formData.impuestoRecibo}
            onChange={(e) => setFormData({ ...formData, impuestoRecibo: parseFloat(e.target.value) || 0 })}
            step={0.01}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Próximo N° de Recibo
          </label>
          <input
            type="number"
            value={formData.proximoNumeroRecibo}
            onChange={(e) => setFormData({ ...formData, proximoNumeroRecibo: parseInt(e.target.value) || 1 })}
            min={1}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Tarifas por Defecto
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tarifa Diaria Default
            </label>
            <input
              type="number"
              value={formData.tarifaDiariaDefault}
              onChange={(e) => setFormData({ ...formData, tarifaDiariaDefault: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tarifa Mensual Default
            </label>
            <input
              type="number"
              value={formData.tariffMensualDefault}
              onChange={(e) => setFormData({ ...formData, tariffMensualDefault: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Hora de Checkout (para cálculo de días)
          </label>
          <input
            type="time"
            value={formData.horaCheckout}
            onChange={(e) => setFormData({ ...formData, horaCheckout: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Después de esta hora se cuenta un día adicional
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Sincronizar Datos
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Envía todos los datos almacenados localmente a Supabase. Útil si realizaste check-ins sin conexión o desde otra computadora.
        </p>
        <button
          onClick={async () => {
            setSyncing(true);
            try {
              await syncToSupabase();
            } finally {
              setSyncing(false);
            }
          }}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 rounded-lg transition-colors text-sm disabled:opacity-50"
        >
          <UploadCloud size={18} />
          {syncing ? 'Sincronizando...' : 'Sincronizar a Supabase'}
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Eliminar Ingresos
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Borra solo las transacciones (ingresos) registradas. Los clientes y habitaciones no se eliminan.
        </p>
        <button
          onClick={async () => {
            if (confirm('¿Borrar todas las transacciones? Esta acción no se puede deshacer.')) {
              await clearTransacciones();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors text-sm"
        >
          <RotateCcw size={18} />
          Borrar Ingresos
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Seguridad
        </h2>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Usuario de Administrador
          </label>
          <input
            type="text"
            value={formData.usuarioAdmin}
            onChange={(e) => setFormData({ ...formData, usuarioAdmin: e.target.value })}
            placeholder="Ingresa tu usuario"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Usuario requerido para iniciar sesión
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Contraseña de Administrador
          </label>
          <input
            type="text"
            value={formData.contrasenaAdmin}
            onChange={(e) => setFormData({ ...formData, contrasenaAdmin: e.target.value })}
            placeholder="Dejar vacío para eliminar contraseña"
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Se requiere esta contraseña para iniciar sesión
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors text-sm"
        >
          <Save size={18} />
          {guardado ? 'Guardado!' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};
