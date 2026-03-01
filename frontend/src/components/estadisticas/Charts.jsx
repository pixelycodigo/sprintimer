import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

/**
 * Gráfico de Barras - Horas por Usuario
 */
export function HorasPorUsuarioChart({ data }) {
  const chartData = {
    labels: data.map(item => item.nombre.split(' ')[0]),
    datasets: [
      {
        label: 'Horas Registradas',
        data: data.map(item => item.total_horas),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
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
      title: {
        display: true,
        text: 'Horas por Usuario',
        font: {
          size: 16,
          weight: '600',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value}h`,
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}

/**
 * Gráfico de Pastel - Horas por Proyecto
 */
export function HorasPorProyectoChart({ data }) {
  const colors = [
    'rgba(16, 185, 129, 0.7)',
    'rgba(59, 130, 246, 0.7)',
    'rgba(245, 158, 11, 0.7)',
    'rgba(139, 92, 246, 0.7)',
    'rgba(236, 72, 153, 0.7)',
    'rgba(239, 68, 68, 0.7)',
    'rgba(34, 197, 94, 0.7)',
    'rgba(99, 102, 241, 0.7)',
  ];

  const chartData = {
    labels: data.map(item => item.nombre.length > 20 ? item.nombre.substring(0, 20) + '...' : item.nombre),
    datasets: [
      {
        label: 'Horas',
        data: data.map(item => item.total_horas),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Horas por Proyecto',
        font: {
          size: 16,
          weight: '600',
        },
      },
    },
  };

  return (
    <div className="h-80">
      <ChartJS type="pie" data={chartData} options={options} />
    </div>
  );
}

/**
 * Gráfico de Línea - Horas por Día
 */
export function HorasPorDiaChart({ data }) {
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.fecha);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }),
    datasets: [
      {
        label: 'Horas Registradas',
        data: data.map(item => item.total_horas),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
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
      title: {
        display: true,
        text: 'Horas por Día (Últimos 30 días)',
        font: {
          size: 16,
          weight: '600',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value}h`,
        },
      },
    },
  };

  return (
    <div className="h-80">
      <ChartJS type="line" data={chartData} options={options} />
    </div>
  );
}

/**
 * Gráfico de Barras Horizontales - Progreso de Sprints
 */
export function ProgresoSprintsChart({ data }) {
  const chartData = {
    labels: data.map(item => item.nombre),
    datasets: [
      {
        label: 'Horas Estimadas',
        data: data.map(item => item.horas_estimadas),
        backgroundColor: 'rgba(148, 163, 184, 0.7)',
        borderColor: 'rgba(148, 163, 184, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Horas Registradas',
        data: data.map(item => item.horas_registradas),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progreso de Sprints (Estimado vs Real)',
        font: {
          size: 16,
          weight: '600',
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value}h`,
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
}
