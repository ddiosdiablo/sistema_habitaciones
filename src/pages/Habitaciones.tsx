import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { HabitacionCard } from '../components/HabitacionCard';
import { CheckInForm } from '../components/CheckInForm';
import { CheckOutModal } from '../components/CheckOutModal';
import type { Habitacion, TipoAlquiler, EstadoHabitacion, Estadia } from '../types';

export const Habitaciones = () => {
  const {
    habitaciones,
    clientes,
    config,
    addHabitacion,
    updateHabitacion,
    deleteHabitacion,
    getEstadiaActivaByHabitacion,
  } = useAppStore();

  const [filtroTipo, setFiltroTipo] = useState<TipoAlquiler | 'todos'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<EstadoHabitacion | 'todos'>('todos');
  const [checkInHabitacion, setCheckInHabitacion] = useState<Habitacion | null>(null);
  const [checkOutHabitacion, setCheckOutHabitacion] = useState<Habitacion | null>(null);
  const [checkOutEstadia, setCheckOutEstadia] = useState<Estadia | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editHabitacion, setEditHabitacion] = useState<Habitacion | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    numero: '',
    tipo: 'dia' as TipoAlquiler,
    tarifaDiaria: 0,
    tariffMensual: 0,
    descripcion: '',
  });
  const getInitialTarifa = () => config.tarifaDiariaDefault;
  const getInitialTariff = () => config.tariffMensualDefault;
  const [nuevaHabitacion, setNuevaHabitacion] = useState({
    numero: '',
    tipo: 'dia' as TipoAlquiler,
    tarifaDiaria: getInitialTarifa(),
    tariffMensual: getInitialTariff(),
    descripcion: '',
  });

  const habitacionesFiltradas = habitaciones.filter((h) => {
    if (filtroTipo !== 'todos' && h.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'todos' && h.estado !== filtroEstado) return false;
    return true;
  });

  const handleAddHabitacion = () => {
    if (!nuevaHabitacion.numero) {
      alert('El número de habitación es requerido');
      return;
    }
    addHabitacion({
      ...nuevaHabitacion,
      estado: 'disponible',
    });
    setShowAddForm(false);
    setNuevaHabitacion({
      numero: '',
      tipo: 'dia',
      tarifaDiaria: config.tarifaDiariaDefault,
      tariffMensual: config.tariffMensualDefault,
      descripcion: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Habitaciones
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Gestiona tus habitaciones
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Nueva Habitación
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-neutral-500" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoAlquiler | 'todos')}
            className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
          >
            <option value="todos">Todos los tipos</option>
            <option value="dia">Diario</option>
            <option value="mes">Mensual</option>
          </select>
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoHabitacion | 'todos')}
          className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
        >
          <option value="todos">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="ocupada">Ocupada</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Nueva Habitación
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Número *
                </label>
                <input
                  type="text"
                  value={nuevaHabitacion.numero}
                  onChange={(e) =>
                    setNuevaHabitacion({ ...nuevaHabitacion, numero: e.target.value })
                  }
                  placeholder="Ej: 101"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Tipo
                </label>
                <select
                  value={nuevaHabitacion.tipo}
                  onChange={(e) =>
                    setNuevaHabitacion({
                      ...nuevaHabitacion,
                      tipo: e.target.value as TipoAlquiler,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="dia">Diario</option>
                  <option value="mes">Mensual</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Tarifa Diaria
                  </label>
                  <input
                    type="number"
                    value={nuevaHabitacion.tarifaDiaria}
                    onChange={(e) =>
                      setNuevaHabitacion({
                        ...nuevaHabitacion,
                        tarifaDiaria: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Tarifa Mensual
                  </label>
                  <input
                    type="number"
                    value={nuevaHabitacion.tariffMensual}
                    onChange={(e) =>
                      setNuevaHabitacion({
                        ...nuevaHabitacion,
                        tariffMensual: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={nuevaHabitacion.descripcion}
                  onChange={(e) =>
                    setNuevaHabitacion({
                      ...nuevaHabitacion,
                      descripcion: e.target.value,
                    })
                  }
                  placeholder="Descripción opcional..."
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  rows={2}
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
                onClick={handleAddHabitacion}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {habitacionesFiltradas.map((habitacion) => {
          const estadia = getEstadiaActivaByHabitacion(habitacion.id);
          const cliente = clientes.find((c) => c.id === estadia?.clienteId);

          return (
            <HabitacionCard
              key={habitacion.id}
              habitacion={habitacion}
              cliente={cliente}
              estadia={estadia || undefined}
              onCheckIn={() => setCheckInHabitacion(habitacion)}
              onCheckOut={() => {
                if (estadia) {
                  setCheckOutHabitacion(habitacion);
                  setCheckOutEstadia(estadia);
                } else {
                  alert('Esta habitación no tiene una estadía activa');
                }
              }}
              onEdit={() => {
                setEditHabitacion(habitacion);
                setEditFormData({
                  numero: habitacion.numero,
                  tipo: habitacion.tipo,
                  tarifaDiaria: habitacion.tarifaDiaria,
                  tariffMensual: habitacion.tariffMensual,
                  descripcion: habitacion.descripcion || '',
                });
                setShowEditForm(true);
              }}
              onDelete={() => {
                if (habitacion.estado === 'disponible') {
                  if (confirm('¿Eliminar esta habitación?')) {
                    deleteHabitacion(habitacion.id);
                  }
                }
              }}
              onChangeEstado={(estado) => {
                updateHabitacion(habitacion.id, { estado });
              }}
              adminPassword={config.contrasenaAdmin}
            />
          );
        })}
      </div>

      {habitacionesFiltradas.length === 0 && (
        <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
          No hay habitaciones que coincidan con los filtros
        </div>
      )}

      {checkInHabitacion && (
        <CheckInForm
          habitacion={checkInHabitacion}
          onClose={() => setCheckInHabitacion(null)}
        />
      )}

      {showEditForm && editHabitacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Editar Habitación {editHabitacion.numero}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={editFormData.numero}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, numero: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Tipo
                </label>
                <select
                  value={editFormData.tipo}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, tipo: e.target.value as TipoAlquiler })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="dia">Por Día</option>
                  <option value="mes">Mensual</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Tarifa Diaria
                  </label>
                  <input
                    type="number"
                    value={editFormData.tarifaDiaria}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tarifaDiaria: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Tarifa Mensual
                  </label>
                  <input
                    type="number"
                    value={editFormData.tariffMensual}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tariffMensual: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editFormData.descripcion}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, descripcion: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditForm(false)}
                className="flex-1 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!editFormData.numero) {
                    alert('El número de habitación es requerido');
                    return;
                  }
                  updateHabitacion(editHabitacion.id, editFormData);
                  setShowEditForm(false);
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {checkOutHabitacion && checkOutEstadia && (
          <CheckOutModal
            habitacion={checkOutHabitacion}
            cliente={clientes.find((c) => c.id === checkOutEstadia.clienteId)!}
            estadia={checkOutEstadia}
            onClose={() => {
              setCheckOutHabitacion(null);
              setCheckOutEstadia(null);
            }}
          />
        )}
    </div>
  );
};