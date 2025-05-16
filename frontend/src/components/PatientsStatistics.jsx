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

const PatientsStatistics = () => {
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
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">
          Patients Statistics
        </h2>
        <div className="flex gap-1 sm:gap-2">
          {["Year", "Month", "Week"].map((time) => (
            <button
              key={time}
              className={`px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium rounded ${
                timeframe === time
                  ? "bg-[#0eabeb] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setTimeframe(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Loader or Chart */}
      {loading ? (
        <div className="mt-6">
          <Skeleton height={300} />
        </div>
      ) : (
        <div className="mt-6">
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
};

export default PatientsStatistics;
