import { useState } from 'react';
import { BedDouble, Edit2, Trash2, MoreVertical } from 'lucide-react';
import type { Habitacion, Cliente, Estadia } from '../types';
import { formatearMoneda } from '../utils/formatearMoneda';

interface HabitacionCardProps {
  habitacion: Habitacion;
  cliente?: Cliente;
  estadia?: Estadia;
  adminPassword?: string;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onChangeEstado?: (estado: Habitacion['estado']) => void;
}

const estadoColores = {
  disponible: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ocupada: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  mantenimiento: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400',
};

const estadoText = {
  disponible: 'Disponible',
  ocupada: 'Ocupada',
  mantenimiento: 'Mantenimiento',
};

export const HabitacionCard = ({
  habitacion,
  cliente,
  estadia,
  adminPassword,
  onCheckIn,
  onCheckOut,
  onEdit,
  onDelete,
  onChangeEstado,
}: HabitacionCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingEstado, setPendingEstado] = useState<Habitacion['estado'] | null>(null);

  const estados: Habitacion['estado'][] = ['disponible', 'ocupada', 'mantenimiento'];

  const handleEstadoClick = (estado: Habitacion['estado']) => {
    if (adminPassword) {
      setPendingEstado(estado);
      setShowPasswordModal(true);
    } else {
      onChangeEstado?.(estado);
    }
    setShowMenu(false);
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === adminPassword && pendingEstado && onChangeEstado) {
      onChangeEstado(pendingEstado);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPendingEstado(null);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BedDouble className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-primary-light" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 truncate">
              Habitación {habitacion.numero}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                estadoColores[habitacion.estado]
              }`}
            >
              {estadoText[habitacion.estado]}
            </span>
          </div>
        </div>
        <div className="flex gap-1 relative flex-shrink-0">
          {(onEdit || onDelete || onChangeEstado) && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
              aria-label="Más opciones"
            >
              <MoreVertical size={16} />
            </button>
          )}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 min-w-[160px] z-10">
              {onChangeEstado && (
                <>
                  <div className="px-3 py-1 text-xs text-neutral-400 uppercase">Cambiar estado</div>
                  {estados.map((estado) => (
                    <button
                      key={estado}
                      onClick={() => handleEstadoClick(estado)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                        habitacion.estado === estado ? 'font-medium text-primary' : 'text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      {estadoText[estado]}
                    </button>
                  ))}
                  <div className="border-t border-neutral-200 dark:border-neutral-700 my-1" />
                </>
              )}
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <Edit2 size={14} />
                  Editar
                </button>
              )}
              {onDelete && habitacion.estado === 'disponible' && (
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {habitacion.descripcion && (
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-3">
          {habitacion.descripcion}
        </p>
      )}

      <div className="space-y-1.5 mb-3 sm:mb-4">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">Diaria</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatearMoneda(habitacion.tarifaDiaria)}
          </span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-neutral-500 dark:text-neutral-400">Mensual</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {formatearMoneda(habitacion.tariffMensual)}
          </span>
        </div>
      </div>

      {cliente && estadia && (
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {cliente.nombreCompleto}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            DNI: {cliente.dni}
          </p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {habitacion.estado === 'disponible' && onCheckIn && (
          <button
            onClick={onCheckIn}
            className="flex-1 py-2 px-3 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            Check-in
          </button>
        )}
        {habitacion.estado === 'ocupada' && onCheckOut && (
          <button
            onClick={onCheckOut}
            className="flex-1 py-2 px-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs sm:text-sm font-medium rounded-lg transition-colors"
          >
            Check-out
          </button>
        )}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-sm w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Confirmar Cambio de Estado
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Ingrese la contraseña de administrador para cambiar el estado a "{estadoText[pendingEstado!]}".
            </p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Contraseña"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                  setPendingEstado(null);
                }}
                className="flex-1 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
