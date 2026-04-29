import { useState } from 'react';
import { X } from 'lucide-react';
import type { Habitacion, Cliente, Estadia, MetodoPago } from '../types';
import { useAppStore } from '../store/appStore';
import { fechaHoy, diasEntreFechas } from '../utils/fechas';
import { formatearMoneda } from '../utils/formatearMoneda';

interface CheckOutModalProps {
  habitacion: Habitacion;
  cliente: Cliente;
  estadia: Estadia;
  onClose: () => void;
}

export const CheckOutModal = ({
  habitacion,
  cliente,
  estadia,
  onClose,
}: CheckOutModalProps) => {
  const { endEstadia, addTransaccion, config } = useAppStore();

  const [fechaSalida, setFechaSalida] = useState(fechaHoy());
  const [diasReales, setDiasReales] = useState(
    diasEntreFechas(estadia.fechaEntrada, fechaSalida, config.horaCheckout)
  );
  const [totalCalibrado, setTotalCalibrado] = useState(
    estadia.tipo === 'dia' 
      ? diasReales * config.tarifaDiariaDefault
      : config.tariffMensualDefault
  );
const [montoPagado, setMontoPagado] = useState(estadia.totalPagado);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [estaPagado, setEstaPagado] = useState(true);
  const [loading, setLoading] = useState(false);

  const saldoPendiente = totalCalibrado - montoPagado;

  const handleFechaSalidaChange = (fecha: string) => {
    setFechaSalida(fecha);
    const dias = diasEntreFechas(estadia.fechaEntrada, fecha, config.horaCheckout);
    setDiasReales(dias);
    if (estadia.tipo === 'dia') {
      setTotalCalibrado(dias * config.tarifaDiariaDefault);
    }
  };

  const handleDiasChange = (dias: number) => {
    setDiasReales(dias);
    if (estadia.tipo === 'dia') {
      setTotalCalibrado(dias * config.tarifaDiariaDefault);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (estaPagado && montoPagado > 0) {
        await addTransaccion({
          estadiaId: estadia.id,
          habitacionId: habitacion.id,
          clienteId: cliente.id,
          tipo: 'checkout',
          monto: montoPagado,
          metodoPago,
          fecha: new Date().toISOString(),
          concepto: `Checkout - Hab ${habitacion.numero} - ${diasReales} día(s)`,
        });
      } else if (saldoPendiente > 0 && !estaPagado) {
        await addTransaccion({
          estadiaId: estadia.id,
          habitacionId: habitacion.id,
          clienteId: cliente.id,
          tipo: 'pago_parcial',
          monto: montoPagado,
          metodoPago,
          fecha: new Date().toISOString(),
          concepto: `Pago parcial checkout - Hab ${habitacion.numero}`,
        });
      }

      await endEstadia(estadia.id, fechaSalida, montoPagado, estaPagado);
      onClose();
    } catch (error) {
      console.error('Error en checkout:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Check-out - Hab {habitacion.numero}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4">
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 sm:p-4">
            <h3 className="font-medium text-sm sm:text-base text-neutral-900 dark:text-neutral-100 mb-2">
              {cliente.nombreCompleto}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500">
              DNI: {cliente.dni} | Tel: {cliente.telefono}
            </p>
            <p className="text-xs sm:text-sm text-neutral-500">
              Entrada: {estadia.fechaEntrada} | Tipo:{' '}
              {estadia.tipo === 'dia' ? 'Diario' : 'Mensual'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Fecha de Salida
            </label>
            <input
              type="date"
              value={fechaSalida}
              onChange={(e) => handleFechaSalidaChange(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Días utilizados
              </label>
              <input
                type="number"
                value={diasReales}
                onChange={(e) => handleDiasChange(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Total Calculado
              </label>
              <input
                type="number"
                value={Math.round(totalCalibrado)}
                onChange={(e) => setTotalCalibrado(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 sm:p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Total:</span>
              <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                {formatearMoneda(totalCalibrado)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Pagado:</span>
              <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                {formatearMoneda(montoPagado)}
              </span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-700 pt-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {saldoPendiente < 0 ? 'Crédito a favor:' : 'Saldo:'}
              </span>
              <span
                className={`font-medium text-sm ${
                  saldoPendiente > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {formatearMoneda(Math.abs(saldoPendiente))}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Monto Recibido
              </label>
              <input
                type="number"
                value={montoPagado}
                onChange={(e) => setMontoPagado(parseFloat(e.target.value) || 0)}
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="estaPagado-out"
              checked={estaPagado}
              onChange={(e) => setEstaPagado(e.target.checked)}
              className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
            />
            <label htmlFor="estaPagado-out" className="text-sm text-neutral-700 dark:text-neutral-300">
              Pagado totalmente
            </label>
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
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Confirmando...' : 'Confirmar Salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
