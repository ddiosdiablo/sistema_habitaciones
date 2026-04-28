import { useState } from 'react';
import { BedDouble, Users, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { formatearMoneda } from '../utils/formatearMoneda';
import { fechaHoy, getSemanaActual, getMesActual } from '../utils/fechas';
import { IngresosChart } from '../components/IngresosChart';

export const Dashboard = () => {
  const { habitaciones, clientes, estadias, getIngresosDiarios, getIngresosSemanales, getIngresosMensuales, getProximosVencimientos } = useAppStore();
  const [chartTipo, setChartTipo] = useState<'semanal' | 'mensual'>('semanal');

  const disponibles = habitaciones.filter((h) => h.estado === 'disponible').length;
  const ocupadas = habitaciones.filter((h) => h.estado === 'ocupada').length;
  const mantenimiento = habitaciones.filter((h) => h.estado === 'mantenimiento').length;

  const ingresosDia = getIngresosDiarios(fechaHoy());
  const { inicio: semanaInicio, fin: semanaFin } = getSemanaActual();
  const ingresosSemana = getIngresosSemanales(semanaInicio, semanaFin);
  const { anio, mes } = getMesActual();
  const ingresosMes = getIngresosMensuales(anio, mes);

  const proximosVencimientos = getProximosVencimientos(7);

  const estadiasActivas = estadias.filter((e) => e.estado === 'activa');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Resumen de tu negocio de alquiler
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Habitaciones</span>
            <BedDouble className="w-5 h-5 text-primary dark:text-primary-light" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {disponibles} / {habitaciones.length}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {ocupadas} ocupidas, {mantenimiento} mantenimiento
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Clientes</span>
            <Users className="w-5 h-5 text-primary dark:text-primary-light" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {clientes.length}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            {estadiasActivas.length} estadías activas
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Ingresos Hoy</span>
            <DollarSign className="w-5 h-5 text-primary dark:text-primary-light" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatearMoneda(ingresosDia)}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Ingresos Mes</span>
            <Calendar className="w-5 h-5 text-primary dark:text-primary-light" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatearMoneda(ingresosMes)}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Semana: {formatearMoneda(ingresosSemana)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Ingresos
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartTipo('semanal')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  chartTipo === 'semanal'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setChartTipo('mensual')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  chartTipo === 'mensual'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Mes
              </button>
            </div>
          </div>
          <IngresosChart tipo={chartTipo} />
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Próximos Vencimientos
            </h2>
          </div>
          {proximosVencimientos.length > 0 ? (
            <div className="space-y-3">
              {proximosVencimientos.map((item) => (
                <div
                  key={item.estadia.id}
                  className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {item.cliente.nombreCompleto}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Hab {item.habitacion.numero} -{' '}
                        {item.estadia.tipo === 'dia' ? 'Diario' : 'Mensual'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        {formatearMoneda(item.estadia.saldoPendiente)}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Vence: {item.estadia.fechaSalidaEstimada}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay vencimientos próximos</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Habitaciones Recientes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {habitaciones.slice(0, 5).map((hab) => {
            const estadia = estadias.find(
              (e) => e.habitacionId === hab.id && e.estado === 'activa'
            );
            const cliente = clientes.find(
              (c) => c.id === estadia?.clienteId
            );
            return (
              <div
                key={hab.id}
                className={`p-3 rounded-lg border ${
                  hab.estado === 'disponible'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : hab.estado === 'ocupada'
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  Hab {hab.numero}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                  {hab.estado}
                </p>
                {cliente && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 truncate">
                    {cliente.nombreCompleto}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};