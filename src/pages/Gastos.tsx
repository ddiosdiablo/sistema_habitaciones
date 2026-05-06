import { useState } from 'react';
import { Plus, Trash2, Filter, Download } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { formatearMoneda } from '../utils/formatearMoneda';
import { formatoFechaTimeStamp } from '../utils/fechas';
import type { CategoriaGasto, MetodoPago } from '../types';

export const Gastos = () => {
  const { gastos, addGasto, deleteGasto, getGastosDiarios, getGastosSemanales, getGastosMensuales } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');

  const [nuevoGasto, setNuevoGasto] = useState({
    fecha: new Date().toISOString().split('T')[0],
    categoria: 'otro' as CategoriaGasto,
    descripcion: '',
    monto: '',
    metodoPago: 'efectivo' as MetodoPago,
  });

  const gastosFiltrados = gastos.filter((g) => {
    if (filtroCategoria !== 'todos' && g.categoria !== filtroCategoria) return false;
    const fecha = g.fecha.substring(0, 10);
    if (filtroFechaInicio && fecha < filtroFechaInicio) return false;
    if (filtroFechaFin && fecha > filtroFechaFin) return false;
    return true;
  });

  const totalFiltrado = gastosFiltrados.reduce((sum, g) => sum + g.monto, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoGasto.descripcion || !nuevoGasto.monto) return;

    await addGasto({
      fecha: nuevoGasto.fecha,
      categoria: nuevoGasto.categoria,
      descripcion: nuevoGasto.descripcion,
      monto: parseFloat(nuevoGasto.monto),
      metodoPago: nuevoGasto.metodoPago,
    });

    setNuevoGasto({
      fecha: new Date().toISOString().split('T')[0],
      categoria: 'otro',
      descripcion: '',
      monto: '',
      metodoPago: 'efectivo',
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este gasto?')) {
      await deleteGasto(id);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Categoría', 'Descripción', 'Monto', 'Método'];
    const rows = gastosFiltrados.map((g) => [
      formatoFechaTimeStamp(g.fecha),
      g.categoria,
      g.descripcion,
      g.monto.toString(),
      g.metodoPago,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoriasLabels: Record<CategoriaGasto, string> = {
    mantenimiento: 'Mantenimiento',
    suministros: 'Suministros',
    servicios: 'Servicios',
    personal: 'Personal',
    otro: 'Otro',
  };

  const categoriaColors: Record<CategoriaGasto, string> = {
    mantenimiento: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    suministros: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    servicios: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    personal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    otro: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Gastos / Egresos
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Controla los gastos del negocio
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus size={18} />
          Nuevo Gasto
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 shadow-sm">
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Hoy</p>
          <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
            {formatearMoneda(getGastosDiarios(new Date().toISOString().split('T')[0]))}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 shadow-sm">
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Esta Semana</p>
          <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
            {formatearMoneda(getGastosSemanales(new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]))}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 shadow-sm">
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Este Mes</p>
          <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
            {formatearMoneda(getGastosMensuales(new Date().getFullYear(), new Date().getMonth() + 1))}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 shadow-sm">
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">Total Filtrado</p>
          <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
            {formatearMoneda(totalFiltrado)}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
              Nuevo Gasto
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={nuevoGasto.fecha}
                  onChange={(e) => setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Categoría
                </label>
                <select
                  value={nuevoGasto.categoria}
                  onChange={(e) => setNuevoGasto({ ...nuevoGasto, categoria: e.target.value as CategoriaGasto })}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                >
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="suministros">Suministros</option>
                  <option value="servicios">Servicios</option>
                  <option value="personal">Personal</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={nuevoGasto.descripcion}
                  onChange={(e) => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                  placeholder="Ej. Compra de limpiadores"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={nuevoGasto.monto}
                  onChange={(e) => setNuevoGasto({ ...nuevoGasto, monto: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Método de Pago
                </label>
                <select
                  value={nuevoGasto.metodoPago}
                  onChange={(e) => setNuevoGasto({ ...nuevoGasto, metodoPago: e.target.value as MetodoPago })}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <Filter size={16} className="text-neutral-500" />
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              className="px-2 sm:px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm"
            />
            <span className="text-neutral-500 hidden sm:inline">-</span>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
              className="px-2 sm:px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm"
            />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-2 sm:px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm"
            >
              <option value="todos">Todas</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="suministros">Suministros</option>
              <option value="servicios">Servicios</option>
              <option value="personal">Personal</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Total: <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatearMoneda(totalFiltrado)}</span>
            </p>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-xs sm:text-sm transition-colors"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Descripción
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Método
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {gastosFiltrados.map((g) => (
                <tr key={g.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {formatoFechaTimeStamp(g.fecha)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${categoriaColors[g.categoria]}`}>
                      {categoriasLabels[g.categoria]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                    {g.descripcion}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-red-600 dark:text-red-400">
                    {formatearMoneda(g.monto)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 capitalize">
                    {g.metodoPago}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {gastosFiltrados.length === 0 && (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            No hay gastos registrados
          </div>
        )}
      </div>
    </div>
  );
};
