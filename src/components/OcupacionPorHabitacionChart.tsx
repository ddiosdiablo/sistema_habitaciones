import { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAppStore } from '../store/appStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const colors = [
  { bg: 'rgba(13, 148, 136, 0.1)', border: '#0D9488' },
  { bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F6' },
  { bg: 'rgba(168, 85, 247, 0.1)', border: '#A855F7' },
  { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B' },
  { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444' },
  { bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981' },
  { bg: 'rgba(236, 72, 153, 0.1)', border: '#EC4899' },
  { bg: 'rgba(99, 102, 241, 0.1)', border: '#6366F1' },
];

export const OcupacionPorHabitacionChart = () => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const { habitaciones, estadias, darkMode } = useAppStore();

  const hoy = new Date();
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - 6 + i);
    return {
      label: d.toLocaleDateString('es-PE', { weekday: 'short' }),
      fecha: d.toISOString().split('T')[0],
    };
  });

  const datasets = habitaciones
    .sort((a, b) => (parseInt(a.numero) || 0) - (parseInt(b.numero) || 0))
    .slice(0, 8)
    .map((hab, idx) => {
      const data = dias.map((d) => {
        return estadias.filter(
          (e) =>
            e.habitacionId === hab.id &&
            e.estado === 'activa' &&
            e.fechaEntrada <= d.fecha &&
            (e.fechaSalidaEstimada >= d.fecha || (e.fechaSalidaReal ?? '9999') >= d.fecha)
        ).length;
      });

      const color = colors[idx % colors.length];

      return {
        label: `Hab ${hab.numero}`,
        data,
        borderColor: color.border,
        backgroundColor: color.bg,
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

  const chartData = {
    labels: dias.map((d) => d.label),
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#9CA3AF' : '#6B7280',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { raw: unknown }) => {
            return `${context.raw as number} estadia(s)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? '#9CA3AF' : '#6B7280',
        },
      },
      y: {
        grid: {
          color: darkMode ? '#374151' : '#E5E7EB',
        },
        ticks: {
          stepSize: 1,
          color: darkMode ? '#9CA3AF' : '#6B7280',
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};
