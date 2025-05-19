import { useEffect, useState } from 'react';
import { PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from '../api/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  // Convert hex to rgba with 0.7 opacity
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.6)`;
};

const DiseaseSummary = () => {
  const [diseaseData, setDiseaseData] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPatients, setTotalPatients] = useState(0);

  useEffect(() => {
    const fetchDiseaseData = async () => {
      try {
        const response = await axios.get('/diseases/stats/patients');
        const { diseaseStats, totalPatients } = response.data;
        
        // Filter out diseases with 0 patients and sort by patient count
        const filteredStats = diseaseStats
          .filter(disease => disease.patientCount > 0)
          .sort((a, b) => b.patientCount - a.patientCount);

        const chartData = filteredStats.map(disease => ({
          disease: disease.name,
          count: disease.patientCount,
          percentage: parseFloat(disease.percentageOfTotal),
          totalAmount: disease.totalAmount
        }));

        const colorList = chartData.map(() => generateRandomColor());

        setDiseaseData(chartData);
        setColors(colorList);
        setTotalPatients(totalPatients);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseaseData();
  }, []);

  const chartData = {
    labels: diseaseData.map((item) => `${item.disease} (${item.percentage}%)`),
    datasets: [
      {
        label: 'Number of Patients',
        data: diseaseData.map((item) => item.count),
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          },
          generateLabels: function(chart) {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => ({
              text: `${label} - ${datasets[0].data[i]} patients`,
              fillStyle: datasets[0].backgroundColor[i],
              strokeStyle: datasets[0].backgroundColor[i],
              lineWidth: 1,
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const data = diseaseData[context.dataIndex];
            return [
              `Patients: ${data.count}`,
              `Percentage: ${data.percentage}%`,
              `Total Amount: ₹${data.totalAmount}`
            ];
          }
        }
      }
    },
    scales: {
      r: {
        ticks: {
          backdropColor: 'transparent',
          color: '#555',
        },
        pointLabels: {
          color: '#666',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">Disease Summary</h2>
      <div className="text-sm text-gray-600 mb-4">Total Patients: {totalPatients}</div>
      <div className="flex flex-col items-center justify-center">
        {loading ? (
          <Skeleton height={300} width={300} />
        ) : diseaseData.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No patient data available</div>
        ) : (
          <div className="w-full max-w-md">
            <PolarArea data={chartData} options={options} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseSummary;
