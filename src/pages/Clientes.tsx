import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { formatearMoneda } from '../utils/formatearMoneda';
import { formatoFecha展示 } from '../utils/fechas';
import type { Cliente } from '../types';

export const Clientes = () => {
  const { clientes, habitaciones, addCliente, updateCliente, deleteCliente, getEstadiasByCliente } = useAppStore();

  const [busqueda, setBusqueda] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [verHistorial, setVerHistorial] = useState<Cliente | null>(null);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombreCompleto: '',
    dni: '',
    telefono: '',
    correo: '',
    nacionalidad: '',
  });

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.dni.includes(busqueda)
  );

  const handleAddCliente = () => {
    if (!nuevoCliente.nombreCompleto || !nuevoCliente.dni || !nuevoCliente.telefono) {
      alert('Por favor completa los campos requeridos');
      return;
    }
    addCliente(nuevoCliente);
    setShowAddForm(false);
    setNuevoCliente({
      nombreCompleto: '',
      dni: '',
      telefono: '',
      correo: '',
      nacionalidad: '',
    });
  };

  const handleUpdateCliente = () => {
    if (!clienteEditando) return;
    updateCliente(clienteEditando.id, clienteEditando);
    setClienteEditando(null);
  };

  const historialEstadias = verHistorial ? getEstadiasByCliente(verHistorial.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Clientes
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Administra tus clientes
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o DNI..."
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        />
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  DNI
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Correo
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Registro
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {cliente.nombreCompleto}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {cliente.dni}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {cliente.telefono}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {cliente.correo || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {formatoFecha展示(cliente.fechaRegistro)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setVerHistorial(cliente)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
                        title="Ver historial"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setClienteEditando(cliente)}
                        className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar cliente?')) {
                            deleteCliente(cliente.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clientesFiltrados.length === 0 && (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            No se encontraron clientes
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Nuevo Cliente
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={nuevoCliente.nombreCompleto}
                  onChange={(e) =>
                    setNuevoCliente({ ...nuevoCliente, nombreCompleto: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    DNI *
                  </label>
                  <input
                    type="text"
                    value={nuevoCliente.dni}
                    onChange={(e) =>
                      setNuevoCliente({ ...nuevoCliente, dni: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={nuevoCliente.telefono}
                    onChange={(e) =>
                      setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Correo
                </label>
                <input
                  type="email"
                  value={nuevoCliente.correo}
                  onChange={(e) =>
                    setNuevoCliente({ ...nuevoCliente, correo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  value={nuevoCliente.nacionalidad}
                  onChange={(e) =>
                    setNuevoCliente({ ...nuevoCliente, nacionalidad: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCliente}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {clienteEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Editar Cliente
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={clienteEditando.nombreCompleto}
                  onChange={(e) =>
                    setClienteEditando({ ...clienteEditando, nombreCompleto: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    DNI *
                  </label>
                  <input
                    type="text"
                    value={clienteEditando.dni}
                    onChange={(e) =>
                      setClienteEditando({ ...clienteEditando, dni: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={clienteEditando.telefono}
                    onChange={(e) =>
                      setClienteEditando({ ...clienteEditando, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Correo
                </label>
                <input
                  type="email"
                  value={clienteEditando.correo || ''}
                  onChange={(e) =>
                    setClienteEditando({ ...clienteEditando, correo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  value={clienteEditando.nacionalidad || ''}
                  onChange={(e) =>
                    setClienteEditando({ ...clienteEditando, nacionalidad: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setClienteEditando(null)}
                className="flex-1 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateCliente}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {verHistorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Historial - {verHistorial.nombreCompleto}
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              DNI: {verHistorial.dni} | Tel: {verHistorial.telefono}
            </p>

            {historialEstadias.length > 0 ? (
              <div className="space-y-3">
                {historialEstadias.map((estadia) => {
                  const habitacion = habitaciones.find(
                    (h) => h.id === estadia.habitacionId
                  );
                  return (
                    <div
                      key={estadia.id}
                      className={`p-3 rounded-lg border ${
                        estadia.estado === 'activa'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            Habitación {habitacion?.numero}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {estadia.tipo === 'dia' ? 'Diario' : 'Mensual'} |{' '}
                            {estadia.estado === 'activa' ? 'Activa' : 'Finalizada'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {formatearMoneda(estadia.tarifaAplicada)}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {formatoFecha展示(estadia.fechaEntrada)} -{' '}
                            {estadia.fechaSalidaReal
                              ? formatoFecha展示(estadia.fechaSalidaReal)
                              : formatoFecha展示(estadia.fechaSalidaEstimada)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                No hay historial de estadías
              </p>
            )}

            <button
              onClick={() => setVerHistorial(null)}
              className="w-full mt-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};