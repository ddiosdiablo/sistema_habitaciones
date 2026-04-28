import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Save, RotateCcw } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export const Configuracion = () => {
  const { config, updateConfig, clearTransacciones } = useAppStore();
  const [redirect, setRedirect] = useState(false);

  const [formData, setFormData] = useState({
    nombre: config.nombre,
    direccion: config.direccion,
    telefono: config.telefono,
    email: config.email || '',
    leyendaPieRecibo: config.leyendaPieRecibo,
    impuestoRecibo: config.impuestoRecibo,
    tarifaDiariaDefault: config.tarifaDiariaDefault,
    tariffMensualDefault: config.tariffMensualDefault,
    contrasenaAdmin: config.contrasenaAdmin || '',
    horaCheckout: config.horaCheckout || '13:00',
    proximoNumeroRecibo: config.proximoNumeroRecibo,
  });

  const [guardado, setGuardado] = useState(false);

  const handleSave = () => {
    updateConfig(formData);
    setGuardado(true);
    setRedirect(true);
  };

  if (redirect) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Configuración
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Configura tu negocio
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
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

        <div className="grid grid-cols-2 gap-4">
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

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
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

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Tarifas por Defecto
        </h2>

        <div className="grid grid-cols-2 gap-4">
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

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Eliminar Ingresos
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Borra solo las transacciones (ingresos) registradas. Los clientes y habitaciones no se eliminan.
        </p>
        <button
          onClick={async () => {
            if (confirm('¿Borrar todas las transacciones? Esta acción no se puede deshacer.')) {
              await clearTransacciones();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
        >
          <RotateCcw size={18} />
          Borrar Ingresos
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Seguridad
        </h2>

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
            Se requiere esta contraseña para acceder a Configuración
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          <Save size={18} />
          {guardado ? 'Guardado!' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};