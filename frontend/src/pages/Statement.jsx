import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import api from "../api/api";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Statement = () => {
  const [timeframe, setTimeframe] = useState("Year");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: { total: 0, paid: 0, unpaid: 0 },
    bills: { total: 0, paid: 0, unpaid: 0 },
    chargeBreakdown: {},
    paymentTypeBreakdown: {},
    timeSeriesData: {
      daily: [],
      monthly: [],
      weekly: []
    },
    topPatients: []
  });

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/users/amountStatistics");
        const { data } = response.data;
        setStats(data);
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [timeframe]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getTimeSeriesData = () => {
    let timeSeries = [];
    
    if (timeframe === "Year") {
      timeSeries = stats.timeSeriesData.monthly || [];
    } else if (timeframe === "Month") {
      timeSeries = stats.timeSeriesData.daily || [];
    } else if (timeframe === "Week") {
      timeSeries = stats.timeSeriesData.weekly || [];
    }

    const labels = timeSeries.map(item => {
      if (timeframe === "Year") {
        return item.month;
      } else if (timeframe === "Month") {
        return item.date;
      } else {
        return item.week;
      }
    });
    
    const paidData = timeSeries.map(item => item.revenue?.paid || 0);
    const unpaidData = timeSeries.map(item => item.revenue?.unpaid || 0);

    return {
      labels,
      datasets: [
        {
          label: "Paid Amount",
          data: paidData,
          borderColor: "#4CAF50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#4CAF50",
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        },
        {
          label: "Unpaid Amount",
          data: unpaidData,
          borderColor: "#F44336",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#F44336",
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value),
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          }
        },
        grid: {
          display: window.innerWidth < 640 ? false : true
        }
      },
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 10 : 12
          }
        },
        grid: {
          display: window.innerWidth < 640 ? false : true
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-sm text-gray-500 mb-1">Total Revenue</h3>
          {loading ? (
            <Skeleton height={24} />
          ) : (
            <p className="text-2xl font-bold text-[#0eabeb]">
              {formatCurrency(stats.revenue.total)}
            </p>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-sm text-gray-500 mb-1">Total Bills</h3>
          {loading ? (
            <Skeleton height={24} />
          ) : (
            <p className="text-2xl font-bold text-[#A35DFF]">
              {stats.bills.total}
            </p>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-sm text-gray-500 mb-1">Average Bill Value</h3>
          {loading ? (
            <Skeleton height={24} />
          ) : (
            <p className="text-2xl font-bold text-[#4CAF50]">
              {formatCurrency(stats.revenue.total / stats.bills.total)}
            </p>
          )}
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-lg font-semibold mb-2 sm:mb-0">
            Revenue Overview
          </h2>
          <div className="flex gap-2">
            {["Year", "Month", "Week"].map((time) => (
              <button
                key={time}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors duration-200 ${
                  timeframe === time
                    ? "bg-[#0eabeb] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setTimeframe(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px]">
          {loading ? (
            <Skeleton height="100%" />
          ) : (
            <Line data={getTimeSeriesData()} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Payment Type and Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Payment Type Distribution</h3>
          {loading ? (
            <Skeleton height={100} />
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.paymentTypeBreakdown || {}).map(([type, amount]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-600">{type}</span>
                  <span className="font-semibold">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Bill Status</h3>
          {loading ? (
            <Skeleton height={100} />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid Bills</span>
                <span className="font-semibold">{stats.bills.paid} ({((stats.bills.paid / stats.bills.total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Unpaid Bills</span>
                <span className="font-semibold">{stats.bills.unpaid} ({((stats.bills.unpaid / stats.bills.total) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statement;
