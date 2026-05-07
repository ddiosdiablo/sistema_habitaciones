import { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAppStore } from '../store/appStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const TasaOcupacionDiariaChart = () => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const { habitaciones, estadias, darkMode } = useAppStore();

  const hoy = new Date();
  const totalHabitaciones = habitaciones.length;

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - 6 + i);
    return {
      label: d.toLocaleDateString('es-PE', { weekday: 'short' }),
      fecha: d.toISOString().split('T')[0],
    };
  });

  const data = dias.map((d) => {
    const ocupadas = estadias.filter(
      (e) =>
        e.estado === 'activa' &&
        e.fechaEntrada <= d.fecha &&
        (e.fechaSalidaEstimada >= d.fecha || (e.fechaSalidaReal ?? '') >= d.fecha)
    ).length;
    return totalHabitaciones > 0 ? Math.round((ocupadas / totalHabitaciones) * 100) : 0;
  });

  const chartData = {
    labels: dias.map((d) => d.label),
    datasets: [
      {
        label: 'Tasa de ocupación (%)',
        data,
        borderColor: darkMode ? '#14B8A6' : '#0D9488',
        backgroundColor: darkMode ? 'rgba(20, 184, 166, 0.1)' : 'rgba(13, 148, 136, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: darkMode ? '#14B8A6' : '#0D9488',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { raw: unknown }) => {
            return `Ocupación: ${context.raw as number}%`;
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
        min: 0,
        max: 100,
        grid: {
          color: darkMode ? '#374151' : '#E5E7EB',
        },
        ticks: {
          callback: (value: unknown) => `${value as number}%`,
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
