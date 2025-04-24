import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useBreadcrumb } from "../../context/BreadcrumbContext";
import { FaCalendarAlt, FaTrashAlt, FaRedoAlt, FaEye } from "react-icons/fa";
import DoctorDetailsSidebar from "../../components/Patient/DoctorDetailsSidebar";
import api from "../../api/api";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Button } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import CustomDateFilter from "../../components/modals/CustomDateFilter";
import moment from "moment";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";

Modal.setAppElement("#root");

const TimePickerDropdown = ({ 
  selectedHour, 
  selectedMinute, 
  selectedPeriod,
  onHourChange, 
  onMinuteChange,
  onPeriodChange,
  isTimeSlotBooked,
  disabled 
}) => {
  return (
    <div className="relative">
      <div className="flex border border-gray-300 rounded-xl overflow-hidden">
        {/* Hour Selection */}
        <select
          value={selectedHour}
          onChange={(e) => onHourChange(e.target.value)}
          disabled={disabled}
          className="w-16 px-2 py-2 border-r border-gray-300 focus:outline-none appearance-none cursor-pointer bg-white"
        >
          <option value="">HH</option>
          {Array.from({ length: 12 }, (_, i) => {
            const hour = (i + 1).toString().padStart(2, '0');
            return (
              <option key={hour} value={hour}>
                {hour}
              </option>
            );
          })}
        </select>

        {/* Minute Selection */}
        <select
          value={selectedMinute}
          onChange={(e) => onMinuteChange(e.target.value)}
          disabled={disabled || !selectedHour}
          className="w-16 px-2 py-2 border-r border-gray-300 focus:outline-none appearance-none cursor-pointer bg-white"
        >
          <option value="">MM</option>
          {Array.from({ length: 60 }, (_, i) => {
            const minute = i.toString().padStart(2, '0');
            return (
              <option 
                key={minute} 
                value={minute}
                disabled={isTimeSlotBooked(selectedHour, minute)}
              >
                {minute}
              </option>
            );
          })}
        </select>

        {/* AM/PM Selection */}
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          disabled={disabled || !selectedHour}
          className="w-16 px-2 py-2 focus:outline-none appearance-none cursor-pointer bg-white"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

const RescheduleModal = ({ isOpen, onClose, appointment, onReschedule }) => {
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const [availableTimeSlots, setAvailableTimeSlots] = useState({ hours: [], minutes: [] });
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Generate all possible hours (1-24)
  const allHours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  // Generate all possible minutes (1-60)
  const allMinutes = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  useEffect(() => {
    if (appointment && selectedDate) {
      fetchDoctorDetails();
      fetchAvailableTimeSlots();
    }
  }, [selectedDate, appointment]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await api.get('/users/doctors');
      const doctor = response.data.find(doc => doc._id === appointment.doctorId);
      setSelectedDoctor(doctor);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
    }
  };

  const generateTimeSlots = (workingHours) => {
    if (!workingHours) return { hours: [], minutes: [] };

    const { workingTime, breakTime } = workingHours;
    const [startTimeStr, endTimeStr] = workingTime.split(' - ');
    const [breakStartStr, breakEndStr] = breakTime.split(' - ');

    const startTime = moment(startTimeStr, 'hh:mm A');
    const endTime = moment(endTimeStr, 'hh:mm A');
    const breakStart = moment(breakStartStr, 'hh:mm A');
    const breakEnd = moment(breakEndStr, 'hh:mm A');

    // Filter hours based on working hours
    const availableHours = allHours.filter(hour => {
      const currentTime = moment(hour, 'HH');
      return currentTime.isBetween(startTime, endTime, 'hour', '[]') && 
             !currentTime.isBetween(breakStart, breakEnd, 'hour', '[]');
    });

    return {
      hours: availableHours,
      minutes: allMinutes
    };
  };

  const fetchAvailableTimeSlots = async () => {
    if (!appointment?.doctorId) return;
    setLoading(true);
    try {
      // Get doctor's booked slots
      const bookedResponse = await api.get(`/appointments/appointments/booked/${appointment.doctorId}`);
      const bookedSlotsData = bookedResponse.data.data || [];
      setBookedSlots(bookedSlotsData);

      // Get doctor's working hours
      if (selectedDoctor?.doctorDetails?.workingHours) {
        const { hours, minutes } = generateTimeSlots(selectedDoctor.doctorDetails.workingHours);
        setAvailableTimeSlots({ hours, minutes });
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const isTimeSlotBooked = (hour, minute) => {
    if (!selectedDate) return false;
    
    return bookedSlots.some(slot => {
      const slotDate = moment(slot.appointmentDate).format('YYYY-MM-DD');
      const [slotHour, slotMinute] = slot.appointmentTime.split(':');
      
      return slotDate === selectedDate && 
             slotHour === hour && 
             slotMinute === minute;
    });
  };

  const handleHourChange = (hour) => {
    setSelectedHour(hour);
    setSelectedMinute('');
  };

  const handleMinuteChange = (minute) => {
    setSelectedMinute(minute);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedHour || !selectedMinute) {
      toast.error('Please select both date and time');
      return;
    }

    // Convert 12-hour to 24-hour format
    let hour24 = parseInt(selectedHour);
    if (selectedPeriod === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (selectedPeriod === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    const formattedTime = `${hour24.toString().padStart(2, '0')}:${selectedMinute}`;

    // Check if selected time slot is booked
    if (isTimeSlotBooked(hour24.toString().padStart(2, '0'), selectedMinute)) {
      toast.error('This time slot is already booked. Please select another time.');
      return;
    }

    try {
      await onReschedule(appointment.id, selectedDate, formattedTime);
      onClose();
      toast.success('Appointment rescheduled successfully');
    } catch (error) {
      console.error('Error rescheduling:', error);
      toast.error('Failed to reschedule appointment');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto my-20"
      overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Reschedule Appointment</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              min={moment().format('YYYY-MM-DD')}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Time</label>
            <TimePickerDropdown
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              selectedPeriod={selectedPeriod}
              onHourChange={handleHourChange}
              onMinuteChange={handleMinuteChange}
              onPeriodChange={handlePeriodChange}
              isTimeSlotBooked={isTimeSlotBooked}
              disabled={loading || !selectedDate}
            />
            {selectedHour && selectedMinute && isTimeSlotBooked(selectedHour, selectedMinute) && (
              <p className="text-red-500 text-sm mt-1">This time slot is already booked</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            className="px-4 py-2 bg-customBlue text-white rounded-xl hover:bg-blue-600"
            disabled={!selectedDate || !selectedHour || !selectedMinute || loading}
          >
            Reschedule
          </button>
        </div>
      </div>
    </Modal>
  );
};

const AppointmentBookingPage = () => {
  const { updateBreadcrumb } = useBreadcrumb();
  const [activeTab, setActiveTab] = useState("Scheduled");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [openCustomDateModal, setOpenCustomDateModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDates, setFilterDates] = useState({
    fromDate: null,
    toDate: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [doctors, setDoctors] = useState([]);
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;

  // Define appointment status constants
  const APPOINTMENT_STATUS = {
    PENDING: "Pending",
    CANCELLED: "Cancelled",
    DONE: "Done",
    ONGOING: "OnGoing"
  };

  const TAB_STATUS_MAPPING = {
    Scheduled: APPOINTMENT_STATUS.PENDING,
    Previous: APPOINTMENT_STATUS.DONE,
    Canceled: APPOINTMENT_STATUS.CANCELLED,
    Pending: APPOINTMENT_STATUS.ONGOING
  };

  useEffect(() => {
    updateBreadcrumb([
      { label: "Appointment Booking", path: "/patient/appointment-booking" },
    ]);
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get("/appointments/appointments");
      if (response.data.success && Array.isArray(response.data.data)) {
        setAppointments(response.data.data);
      } else {
        console.error("Invalid data format received:", response.data);
        toast.error("Error loading appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/users/doctors');
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = moment(appointment.appointmentDate);
    
    // Date range filter
    const withinDateRange =
      filterDates.fromDate && filterDates.toDate
        ? appointmentDate.isBetween(
            moment(filterDates.fromDate).startOf("day"),
            moment(filterDates.toDate).endOf("day"),
            null,
            "[]"
          )
        : true;

    // Doctor filter
    const matchesDoctor = selectedDoctorId ? appointment.doctorId === selectedDoctorId : true;

    // Status filter based on active tab
    const expectedStatus = TAB_STATUS_MAPPING[activeTab];
    const matchesStatus = appointment.status === expectedStatus;

    return withinDateRange && matchesDoctor && matchesStatus;
  });

  const handleDoctorChange = (e) => {
    setSelectedDoctorId(e.target.value);
  };

  const handleViewDetails = (appointment) => {
    setSelectedDoctorId(appointment);
    setIsSidebarVisible(true);
  };

  const openCancelModal = (appointment) => {
    setAppointmentToUpdate(appointment);
    setSelectedStatus("Cancelled");
    setIsStatusModalOpen(true);
  };

  const closeModal = () => {
    setIsStatusModalOpen(false);
    setAppointmentToUpdate(null);
    setSelectedStatus("");
  };

  const handleUpdateStatus = async () => {
    if (!appointmentToUpdate || !selectedStatus) return;
    
    setLoading(true);
    try {
      await api.patch(`/appointments/appointments/${appointmentToUpdate.id}`, {
        status: selectedStatus
      });
      
      // Update local state
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentToUpdate.id
            ? { ...appointment, status: selectedStatus }
            : appointment
        )
      );
      
      toast.success(`Appointment status updated to ${selectedStatus}`);
      closeModal();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (appointment) => {
    setAppointmentToUpdate(appointment);
    setSelectedStatus(appointment.status);
    setIsStatusModalOpen(true);
  };

  const handleApplyDateFilter = (fromDate, toDate) => {
    setFilterDates({ fromDate, toDate });
    setOpenCustomDateModal(false);
  };

  const handleResetDateFilter = () => {
    setFilterDates({ fromDate: null, toDate: null });
    setOpenCustomDateModal(false);
  };

  const dateRangeLabel =
    filterDates.fromDate && filterDates.toDate
      ? `${moment(filterDates.fromDate).format("D MMM, YYYY")} - ${moment(
          filterDates.toDate
        ).format("D MMM, YYYY")}`
      : "Any Date";

  const handleRescheduleClick = (appointment) => {
    const doctor = doctors.find(d => d._id === appointment.doctorId);
    if (!doctor) {
      toast.error("Doctor information not found");
      return;
    }
    setAppointmentToReschedule({ ...appointment, doctor });
    setIsRescheduleModalOpen(true);
  };

  const handleReschedule = async (appointmentId, newDate, newTime) => {
    try {
      await api.patch(`/appointments/appointments/reschedule/${appointmentId}`, {
        appointmentDate: newDate,
        appointmentTime: newTime
      });

      // Update local state
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt.id === appointmentId
            ? { 
                ...apt, 
                appointmentDate: newDate, 
                appointmentTime: newTime,
                status: "Pending" // Reset status to Pending after rescheduling
              }
            : apt
        )
      );

      toast.success('Appointment rescheduled successfully');
      setIsRescheduleModalOpen(false);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error('Failed to reschedule appointment');
      throw error;
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg h-full">
      {/* Tabs for Appointment Types */}
      <div className="flex flex-wrap md:space-x-4 border-b mb-4">
        {Object.keys(TAB_STATUS_MAPPING).map((tab) => (
          <button
            key={tab}
            className={`py-2 px-3 md:px-4 focus:outline-none font-medium ${
              activeTab === tab
                ? "border-b-4 border-customBlue text-customBlue"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} Appointment
          </button>
        ))}
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-3 md:space-y-0">
        <h2 className="text-xl md:text-2xl font-semibold">My Appointment</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div
            className="flex items-center border border-gray-300 rounded-xl px-4 py-2 cursor-pointer"
            onClick={() => setOpenCustomDateModal(true)}
          >
            <CalendarToday className="text-gray-600 mr-2" />
            <span className="text-gray-800">{dateRangeLabel}</span>
            {filterDates.fromDate && filterDates.toDate && (
              <button
                className="ml-2 text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetDateFilter();
                }}
              >
                ✕
              </button>
            )}
          </div>
          <Link
            to={`/${role}/book-appointment`}
            className="flex items-center justify-center bg-customBlue text-white px-4 py-2 rounded-xl text-sm md:text-base hover:bg-blue-600"
          >
            <FaCalendarAlt className="mr-2" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* Doctor Selection */}
      <div className="mb-4">
        <select
          value={selectedDoctorId}
          onChange={handleDoctorChange}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Doctors</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {`Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.doctorDetails.specialtyType}`}
            </option>
          ))}
        </select>
      </div>

      {/* Appointments Grid */}
      <div className="custom-scroll overflow-y-auto h-[620px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border">
                <Skeleton height={20} width="60%" className="mb-2" />
                <Skeleton height={20} width="80%" className="mb-2" />
                <Skeleton height={20} width="70%" className="mb-2" />
                <Skeleton height={20} width="50%" className="mb-2" />
                <Skeleton height={20} width="70%" />
              </div>
            ))
          ) : filteredAppointments.length === 0 ? (
            // No appointments message
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No appointments found for this category</p>
            </div>
          ) : (
            // Appointments list
            filteredAppointments.map((appointment) => {
              const doctor = doctors.find(d => d._id === appointment.doctorId);
              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl w-full relative hover:shadow-lg transition-shadow duration-300 ease-in-out border"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-center px-4 py-2 bg-[#f6f8fb] rounded-t-xl">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">
                        {`Dr. ${doctor?.firstName} ${doctor?.lastName}`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {doctor?.doctorDetails.specialtyType}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="text-sm text-[#818194] space-y-2 px-4 py-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-semibold text-[#FFC313]">
                        {appointment.appointmentType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Hospital</span>
                      <span className="font-semibold text-[#4F4F4F]">
                        {appointment?.hospitalName || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Patient Name</span>
                      <span className="font-semibold text-[#4F4F4F]">
                        {appointment?.patientName || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Working Hours</span>
                      <span className="font-semibold text-[#4F4F4F]">
                        {doctor?.doctorDetails.workingHours.workingTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-semibold text-[#4F4F4F]">
                        {moment(appointment.appointmentDate).format("DD MMM, YYYY")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-semibold text-[#4F4F4F]">
                        {appointment.appointmentTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Issue</span>
                      <span className="font-semibold text-[#4F4F4F]">
                        {appointment.patientIssue || "Not specified"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 py-3 flex justify-between space-x-2 bg-white rounded-b-xl">
                    {(activeTab === "Scheduled" || activeTab === "Pending") && (
                      <>
                        <button
                          className="flex items-center justify-center space-x-1 border-2 px-3 py-2 rounded-xl text-gray-600 w-1/2 hover:bg-gray-100 transition"
                          onClick={() => openStatusModal(appointment)}
                          disabled={loading}
                        >
                          <span>{loading ? "Updating..." : "Update Status"}</span>
                        </button>
                        <button
                          onClick={() => handleRescheduleClick(appointment)}
                          className="flex items-center justify-center space-x-1 bg-[#0EABEB] px-3 py-2 rounded-xl text-white w-1/2 hover:bg-[#0c97cc] transition"
                        >
                          <FaRedoAlt />
                          <span>Reschedule</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sidebar and Modals */}
      {selectedDoctorId && (
        <DoctorDetailsSidebar
          doctor={selectedDoctorId}
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
        />
      )}
      <Modal
        isOpen={isStatusModalOpen}
        onRequestClose={closeModal}
        className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto my-20 border-t-4 border-blue-500"
        overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center"
      >
        <div className="text-center">
          <div className="text-blue-600 text-4xl mb-4">
            <FaCalendarAlt />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Update Appointment Status
          </h2>
          <p className="text-gray-600 mb-6">
            Select the new status for this appointment
          </p>
          
          <div className="mb-6">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
              <option value="OnGoing">OnGoing</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-100"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
              onClick={handleUpdateStatus}
              disabled={!selectedStatus || loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </Modal>
      <CustomDateFilter
        open={openCustomDateModal}
        onClose={() => setOpenCustomDateModal(false)}
        onApply={handleApplyDateFilter}
        onReset={handleResetDateFilter}
      />
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        appointment={appointmentToReschedule}
        onReschedule={handleReschedule}
      />
    </div>
  );
};

export default AppointmentBookingPage;
