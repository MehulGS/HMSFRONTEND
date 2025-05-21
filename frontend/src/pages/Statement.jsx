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
    totalAmount: 0,
    totalInvoices: 0,
    averageAmount: 0,
    monthlyStats: {},
    paymentTypeBreakdown: {},
    statusBreakdown: {},
    timeSeriesData: [],
    topPatients: []
  });

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/users/amountStatistics");
        const { data } = response.data;
        // Filter out Insurance from paymentTypeBreakdown
        if (data.paymentTypeBreakdown) {
          const { Insurance, ...rest } = data.paymentTypeBreakdown;
          data.paymentTypeBreakdown = rest;
        }
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
    const timeSeries = stats.timeSeriesData || [];
    let filteredData = [...timeSeries];

    // Filter data based on timeframe
    if (timeframe === "Year") {
      // Group by year
      const yearData = {};
      timeSeries.forEach(item => {
        const [year] = item.month.split('-');
        if (!yearData[year]) {
          yearData[year] = {
            paid: 0,
            unpaid: 0,
            month: year
          };
        }
        yearData[year].paid += item.paid;
        yearData[year].unpaid += item.unpaid;
      });
      filteredData = Object.values(yearData);
    } else if (timeframe === "Month") {
      // Keep monthly data as is
      filteredData = timeSeries;
    } else if (timeframe === "Week") {
      // For week view, we'll show the last 7 days
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      
      filteredData = timeSeries.filter(item => {
        const [year, month] = item.month.split('-');
        const itemDate = new Date(year, month - 1);
        return itemDate >= weekAgo && itemDate <= today;
      });
    }

    const labels = filteredData.map(item => {
      if (timeframe === "Year") {
        return item.month;
      }
      const [year, month] = item.month.split('-');
      return timeframe === "Month" ? `${month}/${year}` : item.month;
    });
    
    const paidData = filteredData.map(item => item.paid);
    const unpaidData = filteredData.map(item => item.unpaid);

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
              {formatCurrency(stats.totalAmount)}
            </p>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-sm text-gray-500 mb-1">Total Invoices</h3>
          {loading ? (
            <Skeleton height={24} />
          ) : (
            <p className="text-2xl font-bold text-[#A35DFF]">
              {stats.totalInvoices}
            </p>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h3 className="text-sm text-gray-500 mb-1">Average Invoice Value</h3>
          {loading ? (
            <Skeleton height={24} />
          ) : (
            <p className="text-2xl font-bold text-[#4CAF50]">
              {formatCurrency(stats.averageAmount)}
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
          <h3 className="text-lg font-semibold mb-4">Payment Status</h3>
          {loading ? (
            <Skeleton height={100} />
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.statusBreakdown || {}).map(([status, amount]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-600">{status}</span>
                  <span className="font-semibold">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statement;
