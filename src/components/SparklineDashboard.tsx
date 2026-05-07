import { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAppStore } from '../store/appStore';
import { formatearMoneda } from '../utils/formatearMoneda';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const dias = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 6 + i);
  return {
    label: d.toLocaleDateString('es-PE', { weekday: 'short' }),
    fecha: d.toISOString().split('T')[0],
  };
});

interface SparklineCardProps {
  label: string;
  value: string;
  data: number[];
  color: string;
}

const SparklineCard = ({ label, value, data, color }: SparklineCardProps) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const chartData = {
    labels: dias.map((d) => d.label),
    datasets: [
      {
        data,
        borderColor: color,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: { line: { capBezierPoints: true } },
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 shadow-sm">
      <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <div className="flex items-end justify-between mt-1">
        <span className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</span>
        <div className="w-20 h-10">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export const SparklineDashboard = () => {
  const { habitaciones, estadias, transacciones, darkMode } = useAppStore();
  const ocupacionData = dias.map((d) => {
    const ocupadas = estadias.filter(
      (e) =>
        e.estado === 'activa' &&
        e.fechaEntrada <= d.fecha &&
        (e.fechaSalidaEstimada >= d.fecha || (e.fechaSalidaReal ?? '9999') >= d.fecha)
    ).length;
    return habitaciones.length > 0 ? Math.round((ocupadas / habitaciones.length) * 100) : 0;
  });

  const estadiasData = dias.map((d) =>
    estadias.filter(
      (e) =>
        e.estado === 'activa' &&
        e.fechaEntrada <= d.fecha &&
        (e.fechaSalidaEstimada >= d.fecha || (e.fechaSalidaReal ?? '9999') >= d.fecha)
    ).length
  );

  const disponiblesData = dias.map((d) => {
    const ocupadas = estadias.filter(
      (e) =>
        e.estado === 'activa' &&
        e.fechaEntrada <= d.fecha &&
        (e.fechaSalidaEstimada >= d.fecha || (e.fechaSalidaReal ?? '9999') >= d.fecha)
    ).length;
    return habitaciones.length - ocupadas;
  });

  const ingresosData = dias.map((d) =>
    transacciones.filter(
      (t) => t.fecha.startsWith(d.fecha) && (t.tipo === 'checkin' || t.tipo === 'pago_parcial')
    ).reduce((sum, t) => sum + t.monto, 0)
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <SparklineCard
        label="Ocupación"
        value={`${ocupacionData[ocupacionData.length - 1]}%`}
        data={ocupacionData}
        color={darkMode ? '#14B8A6' : '#0D9488'}
      />
      <SparklineCard
        label="Estadías activas"
        value={`${estadiasData[estadiasData.length - 1]}`}
        data={estadiasData}
        color={darkMode ? '#3B82F6' : '#2563EB'}
      />
      <SparklineCard
        label="Disponibles"
        value={`${disponiblesData[disponiblesData.length - 1]}`}
        data={disponiblesData}
        color={darkMode ? '#10B981' : '#059669'}
      />
      <SparklineCard
        label="Ingresos hoy"
        value={formatearMoneda(ingresosData[ingresosData.length - 1])}
        data={ingresosData}
        color={darkMode ? '#F59E0B' : '#D97706'}
      />
    </div>
  );
};
