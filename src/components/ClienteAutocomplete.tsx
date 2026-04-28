import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface ClienteAutocompleteProps {
  value: string;
  onChange: (clienteId: string) => void;
  excludeId?: string;
}

export const ClienteAutocomplete = ({
  value,
  onChange,
  excludeId,
}: ClienteAutocompleteProps) => {
  const { clientes } = useAppStore();
  const [busqueda, setBusqueda] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.id !== excludeId &&
      (c.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.dni.includes(busqueda))
  );

  const clienteSeleccionado = clientes.find((c) => c.id === value);

  useEffect(() => {
    setShowDropdown(busqueda.length > 0);
  }, [busqueda]);

  return (
    <div className="relative">
      {clienteSeleccionado ? (
        <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <User size={18} className="text-neutral-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {clienteSeleccionado.nombreCompleto}
            </p>
            <p className="text-xs text-neutral-500">
              DNI: {clienteSeleccionado.dni} | Telf: {clienteSeleccionado.telefono}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-neutral-400 hover:text-neutral-600"
          >
            ×
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Buscar cliente por nombre o DNI..."
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {showDropdown && busqueda && (
            <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 shadow-lg">
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.id);
                      setBusqueda(c.nombreCompleto);
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {c.nombreCompleto}
                    </p>
                    <p className="text-xs text-neutral-500">
                      DNI: {c.dni} | Telf: {c.telefono}
                    </p>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-neutral-500">
                  No se encontraron clientes
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};