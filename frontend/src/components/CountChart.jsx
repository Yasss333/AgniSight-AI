import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, getElementsAtEvent } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const CountChart = ({ data, onPointClick }) => {
  const chartRef = useRef(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    tension: 0.3,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context) => `Time: ${context[0].label}s`,
          label: (context) => `Count: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Elapsed Time (seconds)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        title: { display: true, text: 'Box Count' },
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        fill: true,
        label: 'Box Count',
        data: data.dataset,
        borderColor: 'rgb(245, 158, 11)', // amber-500
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const onClick = (event) => {
    if (!chartRef.current) return;
    const elements = getElementsAtEvent(chartRef.current, event);
    if (elements.length > 0) {
      const index = elements[0].index;
      const clickedTime = data.labels[index];
      if (onPointClick) {
        onPointClick(clickedTime);
      }
    }
  };

  return (
    <div className="w-full h-[400px] p-4 bg-card rounded-lg border">
      <Line ref={chartRef} options={options} data={chartData} onClick={onClick} />
    </div>
  );
};
