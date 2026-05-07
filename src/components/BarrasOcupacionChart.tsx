import { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAppStore } from '../store/appStore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const BarrasOcupacionChart = () => {
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const { habitaciones, estadias, darkMode } = useAppStore();

  const habitacionsOrdenadas = [...habitaciones].sort(
    (a, b) => (parseInt(a.numero) || 0) - (parseInt(b.numero) || 0)
  );

  const labels = habitacionsOrdenadas.map((h) => `Hab ${h.numero}`);
  const data = habitacionsOrdenadas.map((h) => {
    return estadias.filter(
      (e) => e.habitacionId === h.id && e.estado === 'activa'
    ).length;
  });
  const colors = habitacionsOrdenadas.map((h) =>
    h.estado === 'disponible'
      ? darkMode ? 'rgba(16, 185, 129, 0.8)' : 'rgba(13, 148, 136, 0.8)'
      : h.estado === 'ocupada'
      ? darkMode ? 'rgba(245, 158, 11, 0.8)' : 'rgba(217, 119, 6, 0.8)'
      : darkMode ? 'rgba(107, 114, 128, 0.8)' : 'rgba(100, 116, 139, 0.8)'
  );
  const borders = habitacionsOrdenadas.map((h) =>
    h.estado === 'disponible'
      ? darkMode ? '#10B981' : '#0D9488'
      : h.estado === 'ocupada'
      ? darkMode ? '#F59E0B' : '#D97706'
      : darkMode ? '#6B7280' : '#64748B'
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Estadías activas',
        data,
        backgroundColor: colors,
        borderColor: borders,
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { raw: unknown }) => {
            const value = context.raw as number;
            return `${value} estadía(s) activa(s)`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(...data.map((d) => Math.max(d, 1))),
        grid: {
          color: darkMode ? '#374151' : '#E5E7EB',
        },
        ticks: {
          stepSize: 1,
          color: darkMode ? '#9CA3AF' : '#6B7280',
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? '#9CA3AF' : '#6B7280',
        },
      },
    },
  };

  const height = Math.max(habitacionsOrdenadas.length * 40, 160);

  return (
    <div style={{ height: `${height}px` }}>
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
};
