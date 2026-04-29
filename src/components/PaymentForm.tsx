import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import type { MetodoPago, TipoTransaccion } from '../types';
import { useAppStore } from '../store/appStore';
import { formatearMoneda } from '../utils/formatearMoneda';

interface PaymentFormProps {
  onClose: () => void;
}

export const PaymentForm = ({ onClose }: PaymentFormProps) => {
  const { clientes, habitaciones, estadias, addTransaccion } = useAppStore();

  const [busqueda, setBusqueda] = useState('');
  const [estadiaId, setEstadiaId] = useState<string | null>(null);
  const [monto, setMonto] = useState(0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [concepto, setConcepto] = useState('');
  const [loading, setLoading] = useState(false);

  const estadiasActivas = estadias.filter(
    (e) => e.estado === 'activa' && e.saldoPendiente > 0
  );

  const estadiasFiltradas = estadiasActivas.filter((e) => {
    const cliente = clientes.find((c) => c.id === e.clienteId);
    const habitacion = habitaciones.find((h) => h.id === e.habitacionId);
    const texto = `${cliente?.nombreCompleto || ''} ${cliente?.dni || ''} ${habitacion?.numero || ''}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const estadiaSeleccionada = estadias.find((e) => e.id === estadiaId);
  const cliente = clientes.find((c) => c.id === estadiaSeleccionada?.clienteId);
  const habitacion = habitaciones.find((h) => h.id === estadiaSeleccionada?.habitacionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!estadiaId || !cliente || !habitacion) {
      alert('Por favor selecciona una estadía');
      return;
    }

    setLoading(true);

    try {
      const tipo: TipoTransaccion = monto >= (estadiaSeleccionada?.saldoPendiente || 0)
        ? 'pago'
        : 'pago_parcial';

      await addTransaccion({
        estadiaId,
        habitacionId: habitacion.id,
        clienteId: cliente.id,
        tipo,
        monto,
        metodoPago,
        fecha: new Date().toISOString(),
        concepto: concepto || `Pago - Hab ${habitacion.numero} - ${cliente.nombreCompleto}`,
      });

      onClose();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Registrar Pago
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Buscar Cliente / Habitación
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, DNI o número..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            {busqueda && (
              <div className="mt-2 max-h-32 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
                {estadiasFiltradas.length > 0 ? (
                  estadiasFiltradas.map((e) => {
                    const c = clientes.find((c) => c.id === e.clienteId);
                    const h = habitaciones.find((h) => h.id === e.habitacionId);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => setEstadiaId(e.id)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                          estadiaId === e.id ? 'bg-primary/10' : ''
                        }`}
                      >
                        <span className="font-medium">
                          {h?.numero} - {c?.nombreCompleto}
                        </span>
                        <span className="text-neutral-500">
                          {' '}
                          | Saldo: {formatearMoneda(e.saldoPendiente)}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-2 text-sm text-neutral-500">
                    No se encontraron Estadías con saldo pendiente
                  </p>
                )}
              </div>
            )}
          </div>

          {estadiaSeleccionada && cliente && habitacion && (
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 sm:p-4">
              <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                {habitacion.numero} - {cliente.nombreCompleto}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500">
                Saldo pendiente: {formatearMoneda(estadiaSeleccionada.saldoPendiente)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Monto
              </label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                min={0}
                step={0.01}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Método de Pago
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Concepto
            </label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Descripción del pago..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !estadiaId}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <DollarSign size={18} />
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
