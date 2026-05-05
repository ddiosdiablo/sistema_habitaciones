import { useState } from 'react';
import { FileText, Download, Eye, Search } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { generarReciboPDF } from '../utils/generarReciboPDF';
import type { DatosRecibo } from '../utils/generarReciboPDF';
import { VistaPreviaRecibo } from '../components/VistaPreviaRecibo';
import { formatoFechaTimeStamp } from '../utils/fechas';
import { formatearMoneda } from '../utils/formatearMoneda';

export const HistorialRecibos = () => {
  const { transacciones, clientes, habitaciones, estadias, config } = useAppStore();

  const [busqueda, setBusqueda] = useState('');
  const [reciboSeleccionado, setReciboSeleccionado] = useState<DatosRecibo | null>(null);

  const recibos = transacciones
    .filter((t) => t.numeroRecibo)
    .filter((t) => {
      if (!busqueda) return true;
      const habitacion = habitaciones.find((h) => h.id === t.habitacionId);
      const cliente = clientes.find((c) => c.id === t.clienteId);
      const textoBusqueda = `${t.numeroRecibo} ${cliente?.nombreCompleto || ''} ${habitacion?.numero || ''} ${t.concepto}`.toLowerCase();
      return textoBusqueda.includes(busqueda.toLowerCase());
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const handleVerRecibo = (transaccionId: string) => {
    const transaccion = transacciones.find((t) => t.id === transaccionId);
    if (!transaccion) return;

    const cliente = clientes.find((c) => c.id === transaccion.clienteId);
    const habitacion = habitaciones.find((h) => h.id === transaccion.habitacionId);
    const estadia = estadias.find((e) => e.id === transaccion.estadiaId);

    if (!cliente || !habitacion) return;

    const datos: DatosRecibo = {
      config,
      cliente,
      habitacion,
      tipoAlquiler: estadia?.tipo || 'dia',
      transaccion,
      fechaEntrada: estadia?.fechaEntrada || '',
      fechaSalida: estadia?.fechaSalidaEstimada || '',
      tarifaOriginal: estadia?.tarifaOriginal,
      descuento: estadia?.descuento,
    };

    setReciboSeleccionado(datos);
  };

  const handleDescargarPDF = (transaccionId: string) => {
    const transaccion = transacciones.find((t) => t.id === transaccionId);
    if (!transaccion) return;

    const cliente = clientes.find((c) => c.id === transaccion.clienteId);
    const habitacion = habitaciones.find((h) => h.id === transaccion.habitacionId);
    const estadia = estadias.find((e) => e.id === transaccion.estadiaId);

    if (!cliente || !habitacion) return;

    const datos: DatosRecibo = {
      config,
      cliente,
      habitacion,
      tipoAlquiler: estadia?.tipo || 'dia',
      transaccion,
      fechaEntrada: estadia?.fechaEntrada || '',
      fechaSalida: estadia?.fechaSalidaEstimada || '',
      tarifaOriginal: estadia?.tarifaOriginal,
      descuento: estadia?.descuento,
    };

    generarReciboPDF(datos);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Historial de Recibos
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Visualiza y descarga recibos generados
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por N° recibo, cliente, habitación..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  N° Recibo
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Habitación
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Monto
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {recibos.map((t) => {
                const habitacion = habitaciones.find((h) => h.id === t.habitacionId);
                const cliente = clientes.find((c) => c.id === t.clienteId);
                return (
                  <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <td className="px-4 py-3 text-sm font-medium text-primary dark:text-primary-light">
                      {t.numeroRecibo}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {formatoFechaTimeStamp(t.fecha)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {cliente?.nombreCompleto || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {habitacion?.numero || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-neutral-900 dark:text-neutral-100">
                      {formatearMoneda(t.monto)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleVerRecibo(t.id)}
                          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 transition-colors"
                          title="Ver recibo"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDescargarPDF(t.id)}
                          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 transition-colors"
                          title="Descargar PDF"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {recibos.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">
              {busqueda ? 'No se encontraron recibos' : 'No hay recibos generados'}
            </p>
          </div>
        )}
      </div>

      {reciboSeleccionado && (
        <VistaPreviaRecibo
          datos={reciboSeleccionado}
          onClose={() => setReciboSeleccionado(null)}
        />
      )}
    </div>
  );
};
