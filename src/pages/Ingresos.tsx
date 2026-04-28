import { useState } from 'react';
import { Download, DollarSign, Filter } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { formatearMoneda } from '../utils/formatearMoneda';
import { formatoFechaTimeStamp } from '../utils/fechas';
import { PaymentForm } from '../components/PaymentForm';
import { IngresosChart } from '../components/IngresosChart';

export const Ingresos = () => {
  const { transacciones, clientes, habitaciones, getIngresosDiarios, getIngresosSemanales, getIngresosMensuales, getIngresosAnuales } = useAppStore();

  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const transaccionesFiltradas = transacciones.filter((t) => {
    if (filtroTipo !== 'todos' && t.tipo !== filtroTipo) return false;
    const fecha = t.fecha.substring(0, 10);
    if (filtroFechaInicio && fecha < filtroFechaInicio) return false;
    if (filtroFechaFin && fecha > filtroFechaFin) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Fecha', 'N° Recibo', 'Habitacion', 'Cliente', 'Tipo', 'Monto', 'Metodo', 'Concepto'];
    const rows = transaccionesFiltradas.map((t) => {
      const habitacion = habitaciones.find((h) => h.id === t.habitacionId);
      const cliente = clientes.find((c) => c.id === t.clienteId);
      return [
        formatoFechaTimeStamp(t.fecha),
        t.numeroRecibo || '',
        habitacion?.numero || '',
        cliente?.nombreCompleto || '',
        t.tipo,
        t.monto.toString(),
        t.metodoPago,
        t.concepto,
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingresos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalFiltrado = transaccionesFiltradas
    .filter((t) => t.tipo === 'checkin' || t.tipo === 'pago' || t.tipo === 'pago_parcial')
    .reduce((sum, t) => sum + t.monto, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Ingresos
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Controla tus ingresos
          </p>
        </div>
        <button
          onClick={() => setShowPaymentForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          <DollarSign size={18} />
          Registrar Pago
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Hoy</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatearMoneda(getIngresosDiarios(new Date().toISOString().split('T')[0]))}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Esta Semana</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatearMoneda(getIngresosSemanales(new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]))}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Este Mes</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatearMoneda(getIngresosMensuales(new Date().getFullYear(), new Date().getMonth() + 1))}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Este Año</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatearMoneda(getIngresosAnuales(new Date().getFullYear()))}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Gráfico de Ingresos
        </h2>
        <IngresosChart tipo="mensual" />
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter size={16} className="text-neutral-500" />
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
            />
            <span className="text-neutral-500">-</span>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
              className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
            />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
            >
              <option value="todos">Todos los tipos</option>
              <option value="checkin">Check-in</option>
              <option value="checkout">Check-out</option>
              <option value="pago">Pago</option>
              <option value="pago_parcial">Pago Parcial</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total: <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatearMoneda(totalFiltrado)}</span>
            </p>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-sm transition-colors"
            >
              <Download size={16} />
              Exportar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  N° Recibo
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Habitación
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Método
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Concepto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {transaccionesFiltradas.map((t) => {
                const habitacion = habitaciones.find((h) => h.id === t.habitacionId);
                const cliente = clientes.find((c) => c.id === t.clienteId);
                return (
                  <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {formatoFechaTimeStamp(t.fecha)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {t.numeroRecibo || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {habitacion?.numero || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                      {cliente?.nombreCompleto || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          t.tipo === 'checkin'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : t.tipo === 'checkout'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {t.tipo === 'checkin'
                          ? 'Check-in'
                          : t.tipo === 'checkout'
                          ? 'Check-out'
                          : t.tipo === 'pago'
                          ? 'Pago'
                          : 'Pago Parcial'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 capitalize">
                      {t.metodoPago}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-neutral-900 dark:text-neutral-100">
                      {formatearMoneda(t.monto)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                      {t.concepto}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {transaccionesFiltradas.length === 0 && (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            No hay transacciones
          </div>
        )}
      </div>

      {showPaymentForm && <PaymentForm onClose={() => setShowPaymentForm(false)} />}
    </div>
  );
};