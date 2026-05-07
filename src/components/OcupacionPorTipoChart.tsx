import { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAppStore } from '../store/appStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const OcupacionPorTipoChart = () => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const { estadias, darkMode } = useAppStore();

  const hoy = new Date();
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - 6 + i);
    return {
      label: d.toLocaleDateString('es-PE', { weekday: 'short' }),
      fecha: d.toISOString().split('T')[0],
    };
  });

  const datasetDiario = {
    label: 'Diario',
    data: dias.map((d) =>
      estadias.filter(
        (e) =>
          e.estado === 'activa' &&
          e.tipo === 'dia' &&
          e.fechaEntrada <= d.fecha &&
          (e.fechaSalidaEstimada >= d.fecha || (e.fechaSalidaReal ?? '9999') >= d.fecha)
      ).length
    ),
    borderColor: darkMode ? '#F59E0B' : '#D97706',
    backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(217, 119, 6, 0.1)',
    tension: 0.3,
    fill: true,
    pointRadius: 5,
    pointHoverRadius: 7,
    pointBackgroundColor: darkMode ? '#F59E0B' : '#D97706',
  };

  const datasetMensual = {
    label: 'Mensual',
    data: dias.map((d) =>
      estadias.filter(
        (e) =>
          e.estado === 'activa' &&
          e.tipo === 'mes' &&
          e.fechaEntrada <= d.fecha &&
          (e.fechaSalidaEstimada >= d.fecha || (e.fechaSalidaReal ?? '') >= d.fecha)
      ).length
    ),
    borderColor: darkMode ? '#3B82F6' : '#2563EB',
    backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
    tension: 0.3,
    fill: true,
    pointRadius: 5,
    pointHoverRadius: 7,
    pointBackgroundColor: darkMode ? '#3B82F6' : '#2563EB',
  };

  const chartData = {
    labels: dias.map((d) => d.label),
    datasets: [datasetDiario, datasetMensual],
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
