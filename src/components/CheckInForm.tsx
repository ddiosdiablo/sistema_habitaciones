import { useState, useEffect } from 'react';
import { X, Eye, Download } from 'lucide-react';
import type { Habitacion, TipoAlquiler, MetodoPago } from '../types';
import { useAppStore } from '../store/appStore';
import { fechaHoy, fechaMasDias, fechaMasMeses } from '../utils/fechas';
import { generarReciboPDF } from '../utils/generarReciboPDF';
import { VistaPreviaRecibo } from './VistaPreviaRecibo';
import type { DatosRecibo } from '../utils/generarReciboPDF';

interface CheckInFormProps {
  habitacion: Habitacion;
  onClose: () => void;
}

export const CheckInForm = ({ habitacion, onClose }: CheckInFormProps) => {
  const { clientes, addCliente, addEstadia, addTransaccion, config } = useAppStore();
  
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombreCompleto: '',
    dni: '',
    telefono: '',
    correo: '',
    nacionalidad: '',
  });
  const [esNuevoCliente, setEsNuevoCliente] = useState(false);
  
  const [tipoAlquiler, setTipoAlquiler] = useState<TipoAlquiler>(habitacion.tipo === 'mes' ? 'mes' : 'dia');
  const [diasEstadia, setDiasEstadia] = useState(1);
  const [tarifa, setTarifa] = useState(
    tipoAlquiler === 'dia' ? config.tarifaDiariaDefault : config.tariffMensualDefault
  );
  const [fechaEntrada, setFechaEntrada] = useState(fechaHoy());
  const [fechaSalida, setFechaSalida] = useState(
    tipoAlquiler === 'dia' ? fechaMasDias(1) : fechaMasMeses(1)
  );
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [montoPagado, setMontoPagado] = useState(tarifa);
  const [estaPagado, setEstaPagado] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mostrarRecibo, setMostrarRecibo] = useState(false);
  const [datosRecibo, setDatosRecibo] = useState<DatosRecibo | null>(null);

  // Calcular automáticamente cuando cambian los días o el tipo
  useEffect(() => {
    if (tipoAlquiler === 'dia') {
      const tarifaDiaria = config.tarifaDiariaDefault;
      const nuevaTarifa = tarifaDiaria * diasEstadia;
      setTarifa(nuevaTarifa);
      if (estaPagado) {
        setMontoPagado(nuevaTarifa);
      }
      setFechaSalida(fechaMasDias(diasEstadia, fechaEntrada));
    } else {
      const tarifaMensual = config.tariffMensualDefault;
      setTarifa(tarifaMensual);
      if (estaPagado) {
        setMontoPagado(tarifaMensual);
      }
      setFechaSalida(fechaMasMeses(1, fechaEntrada));
    }
  }, [diasEstadia, tipoAlquiler, estaPagado]);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.dni.includes(busqueda)
  );

  const handleTipoAlquilerChange = (tipo: TipoAlquiler) => {
    setTipoAlquiler(tipo);
  };

  const handleDiasChange = (dias: number) => {
    setDiasEstadia(dias);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let clienteId = clienteSeleccionado;

      if (esNuevoCliente) {
        await addCliente({
          nombreCompleto: nuevoCliente.nombreCompleto,
          dni: nuevoCliente.dni,
          telefono: nuevoCliente.telefono,
          correo: nuevoCliente.correo || undefined,
          nacionalidad: nuevoCliente.nacionalidad || undefined,
        });
        const todosLosClientes = useAppStore.getState().clientes;
        clienteId = todosLosClientes[todosLosClientes.length - 1]?.id;
      }

      if (!clienteId) {
        alert('Por favor selecciona un cliente');
        setLoading(false);
        return;
      }

      const estadiaId = await addEstadia({
        habitacionId: habitacion.id,
        clienteId,
        tipo: tipoAlquiler,
        fechaEntrada,
        fechaSalidaEstimada: fechaSalida,
        tarifaAplicada: tarifa,
        totalPagado: estaPagado ? montoPagado : 0,
        saldoPendiente: estaPagado ? 0 : tarifa - montoPagado,
        estaPagado,
        estado: 'activa',
      });

      if (estaPagado && montoPagado > 0) {
        await addTransaccion({
          estadiaId,
          habitacionId: habitacion.id,
          clienteId,
          tipo: estaPagado ? 'checkin' : 'pago_parcial',
          monto: montoPagado,
          metodoPago,
          fecha: new Date().toISOString(),
          concepto: `${tipoAlquiler === 'dia' ? 'Check-in diario' : 'Check-in mensual'} - Habitación ${habitacion.numero}`,
        });

        const todosClientes = useAppStore.getState().clientes;
        const clienteData = todosClientes.find(c => c.id === clienteId);
        if (clienteData) {
          const todasTransacciones = useAppStore.getState().transacciones;
          const transaccionReciente = todasTransacciones[todasTransacciones.length - 1];
          
          const datosDelRecibo: DatosRecibo = {
            config: config,
            cliente: clienteData,
            habitacion: habitacion,
            tipoAlquiler: tipoAlquiler,
            transaccion: transaccionReciente,
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            dias: tipoAlquiler === 'dia' ? diasEstadia : 1,
          };
          
          setDatosRecibo(datosDelRecibo);
          setShowSuccess(true);
          setLoading(false);
          return;
        }
      }

      onClose();
    } catch (error) {
      console.error('Error al registrar check-in:', error);
      alert('Error al registrar el check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Registro Check-in - Hab {habitacion.numero}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setEsNuevoCliente(false)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                !esNuevoCliente
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Cliente Existente
            </button>
            <button
              type="button"
              onClick={() => setEsNuevoCliente(true)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                esNuevoCliente
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Nuevo Cliente
            </button>
          </div>

          {esNuevoCliente ? (
            <div className="space-y-3">
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
                  required
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                    required
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    required
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      setNuevoCliente({
                        ...nuevoCliente,
                        nacionalidad: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Buscar Cliente
              </label>
              {clienteSeleccionado ? (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {clientes.find(c => c.id === clienteSeleccionado)?.nombreCompleto}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        DNI: {clientes.find(c => c.id === clienteSeleccionado)?.dni} | 
                        Telf: {clientes.find(c => c.id === clienteSeleccionado)?.telefono}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setClienteSeleccionado(null)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o DNI..."
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {busqueda && (
                    <div className="mt-2 max-h-32 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      {clientesFiltrados.length > 0 ? (
                        clientesFiltrados.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setClienteSeleccionado(c.id);
                              setBusqueda(c.nombreCompleto);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                              clienteSeleccionado === c.id
                                ? 'bg-primary/10'
                                : ''
                            }`}
                          >
                            <span className="font-medium">{c.nombreCompleto}</span>
                            <span className="text-neutral-500"> - DNI: {c.dni}</span>
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
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tipo de Alquiler
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTipoAlquilerChange('dia')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  tipoAlquiler === 'dia'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Por Día
              </button>
              <button
                type="button"
                onClick={() => handleTipoAlquilerChange('mes')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  tipoAlquiler === 'mes'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Por Mes
              </button>
            </div>
          </div>

          {tipoAlquiler === 'dia' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Días de estadía
              </label>
              <input
                type="number"
                min="1"
                value={diasEstadia}
                onChange={(e) => handleDiasChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Fecha Entrada
              </label>
              <input
                type="date"
                value={fechaEntrada}
                onChange={(e) => setFechaEntrada(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Fecha Salida
              </label>
              <input
                type="date"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tarifa
            </label>
            <input
              type="number"
              value={tarifa}
              onChange={(e) => setTarifa(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Monto a Pagar
              </label>
              <input
                type="number"
                value={montoPagado}
                onChange={(e) => setMontoPagado(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="estaPagado"
              checked={estaPagado}
              onChange={(e) => setEstaPagado(e.target.checked)}
              className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
            />
            <label htmlFor="estaPagado" className="text-sm text-neutral-700 dark:text-neutral-300">
              Pagado completamente
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Confirmar Check-in'}
            </button>
          </div>
        </form>
      </div>

      {showSuccess && datosRecibo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Check-in Completado
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                Recibo N°: {datosRecibo.transaccion.numeroRecibo}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => setMostrarRecibo(true)}
                className="flex-1 py-2.5 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                Ver Recibo
              </button>
              <button
                onClick={() => generarReciboPDF(datosRecibo)}
                className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarRecibo && datosRecibo && (
        <VistaPreviaRecibo
          datos={datosRecibo}
          onClose={() => setMostrarRecibo(false)}
        />
      )}
    </div>
  );
};