import { useEffect, useState } from "react";
import api from "../api/api"; // Import the api instance
import AppointmentCard from "../components/AppointmentCard";
import noAppointment from "../assets/images/noAppointment.png";
import moment from "moment"; // for date formatting and comparisons
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import { jwtDecode } from "jwt-decode"; // Import jwtDecode
import { Link } from "react-router-dom"; // Import Link for navigation
import { FaSearch } from "react-icons/fa"; // Import search icon

const AppointmentPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Get user role from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Function to fetch all appointments and filter today's appointments
  const fetchTodaysAppointments = async () => {
    try {
      const response = await api.get("/appointments/appointments");
      const allAppointments = response.data.data;

      // Filter appointments for today's date
      const today = moment().format("YYYY-MM-DD");
      const todaysAppointments = allAppointments.filter(appointment =>
        moment(appointment.appointmentDate).isSame(today, "day")
      );

      setAppointments(todaysAppointments);
      setFilteredAppointments(todaysAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAppointments(appointments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = appointments.filter(appointment => 
      appointment.patientName?.toLowerCase().includes(query) ||
      appointment.patientUniqueId?.toLowerCase().includes(query) ||
      appointment.patientPhoneNumber?.includes(query)
    );
    setFilteredAppointments(filtered);
  }, [searchQuery, appointments]);

  useEffect(() => {
    fetchTodaysAppointments();
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-lg sm:text-xl font-semibold">Today's Appointments</h2>
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by patient name, ID, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto">
          {/* Skeleton loading placeholders for Appointment Cards */}
          {Array(3).fill().map((_, index) => (
            <div key={index} className="min-w-[200px] sm:min-w-[250px]">
              <Skeleton height={80} className="mb-2 rounded-xl" />
              <Skeleton height={15} width="80%" className="mb-1" />
              <Skeleton height={15} width="60%" className="mb-1" />
              <Skeleton height={15} width="40%" />
            </div>
          ))}
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          {filteredAppointments.map((appointment, index) => (
            <div key={index} className="w-full sm:w-64">
              <AppointmentCard {...appointment} userRole={userRole} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <img src={noAppointment} alt="No Appointments" className="w-32 sm:w-48 mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">
            {searchQuery ? "No matching appointments found" : "No Appointments Found for Today"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;
