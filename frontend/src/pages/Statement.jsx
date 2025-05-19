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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Statement = () => {
  const [timeframe, setTimeframe] = useState("Year");
  const [chartData, setChartData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [tooltipData, setTooltipData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/users/patients");
        const patients = response.data;

        const currentDate = new Date();
        let dataCounts = [];
        let groupedPatients = [];
        let tempLabels = [];

        if (timeframe === "Year") {
          dataCounts = Array(12).fill(0);
          groupedPatients = Array(12)
            .fill()
            .map(() => []);
          tempLabels = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          patients.forEach((patient) => {
            const date = new Date(patient.createdAt);
            if (date.getFullYear() === currentDate.getFullYear()) {
              const month = date.getMonth();
              dataCounts[month]++;
              groupedPatients[month].push(
                `${patient.firstName} ${patient.lastName}`
              );
            }
          });
        } else if (timeframe === "Month") {
          const daysInMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          ).getDate();
          dataCounts = Array(daysInMonth).fill(0);
          groupedPatients = Array(daysInMonth)
            .fill()
            .map(() => []);
          tempLabels = Array.from(
            { length: daysInMonth },
            (_, i) => `Day ${i + 1}`
          );

          patients.forEach((patient) => {
            const date = new Date(patient.createdAt);
            if (
              date.getFullYear() === currentDate.getFullYear() &&
              date.getMonth() === currentDate.getMonth()
            ) {
              const day = date.getDate() - 1;
              dataCounts[day]++;
              groupedPatients[day].push(
                `${patient.firstName} ${patient.lastName}`
              );
            }
          });
        } else if (timeframe === "Week") {
          dataCounts = Array(7).fill(0);
          groupedPatients = Array(7)
            .fill()
            .map(() => []);
          const weekLabels = [];
          const weekDates = [];

          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(currentDate.getDate() - i);
            weekDates.push(date.toDateString());
            weekLabels.push(
              date.toLocaleDateString("en-US", { weekday: "short" })
            );
          }

          tempLabels = weekLabels;

          patients.forEach((patient) => {
            const patientDate = new Date(patient.createdAt).toDateString();

            const index = weekDates.findIndex((date) => date === patientDate);
            if (index !== -1) {
              dataCounts[index]++;
              groupedPatients[index].push(
                `${patient.firstName} ${patient.lastName}`
              );
            }
          });
        }

        setChartData(dataCounts);
        setLabels(tempLabels);
        setTooltipData(groupedPatients);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [timeframe]);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Patients Registered",
        data: chartData,
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "#A35DFF",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#A35DFF",
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context) => {
            const index = context.dataIndex;
            const count = chartData[index];
            const names = tooltipData[index] || [];
            return [
              `Registered: ${count}`,
              ...names.map((name, i) => `👤 ${name}`),
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
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
    },
  };

  return (
    <div className="bg-white p-2 sm:p-4 md:p-6 rounded-xl shadow-md w-full min-h-[300px] sm:min-h-[490px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-0">
          Accounting Statement
        </h2>
        <div className="flex gap-1 sm:gap-2">
          {["Year", "Month", "Week"].map((time) => (
            <button
              key={time}
              className={`px-2 sm:px-3 md:px-4 py-1 text-xs sm:text-sm font-medium rounded transition-colors duration-200 ${
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

      <div className="flex-1 relative min-h-[250px] sm:min-h-[300px] md:min-h-[350px]">
        {loading ? (
          <div className="absolute inset-0">
            <Skeleton height="100%" />
          </div>
        ) : (
          <div className="absolute inset-0">
            <Line data={data} options={options} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Statement;
