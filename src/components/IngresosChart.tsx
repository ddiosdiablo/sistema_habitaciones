import { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAppStore } from '../store/appStore';
import { formatearMoneda } from '../utils/formatearMoneda';
import { getSemanaActual, getMesActual } from '../utils/fechas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IngresosChartProps {
  tipo: 'semanal' | 'mensual';
}

export const IngresosChart = ({ tipo }: IngresosChartProps) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const { getIngresosSemanales, getIngresosMensuales, config, darkMode } = useAppStore();

  let labels: string[] = [];
  let data: number[] = [];

  if (tipo === 'semanal') {
    const { inicio } = getSemanaActual();
    const fechaInicio = new Date(inicio);
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fechaInicio.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];
      labels.push(fecha.toLocaleDateString('es-PE', { weekday: 'short' }));
      data.push(getIngresosSemanales(fechaStr, fechaStr));
    }
  } else {
    const { anio, mes } = getMesActual();
    const diasEnMes = new Date(anio, mes, 0).getDate();
    for (let dia = 1; dia <= diasEnMes; dia++) {
      labels.push(dia.toString());
      data.push(getIngresosMensuales(anio, dia));
    }
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: config.nombre,
        data,
        backgroundColor: darkMode
          ? 'rgba(20, 184, 166, 0.8)'
          : 'rgba(13, 148, 136, 0.8)',
        borderColor: darkMode ? '#14B8A6' : '#0D9488',
        borderWidth: 1,
        borderRadius: 4,
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
            return formatearMoneda(context.raw as number);
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
          callback: (value: unknown) => formatearMoneda(value as number),
          color: darkMode ? '#9CA3AF' : '#6B7280',
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
};