import React, { useState, useEffect } from "react";
import moment from "moment";
import api from "../../api/api"; // Axios instance for API calls
import Modal from "react-modal"; // Modal package, install via npm: npm install react-modal
import countryData from "../../countryjson/countries+states+cities.json"; // Assuming this is the correct path to your JSON file
import noappointmentrecord from "../../assets/images/noappointmentrecord.png";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Initialize the Modal
Modal.setAppElement("#root");

const BookAppointment = () => {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [filteredPatient, setFilteredPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");
  const [patientIssue, setPatientIssue] = useState("");
  const [diseaseName, setDiseaseName] = useState("");
  const [appointmentType, setAppointmentType] = useState("Online");
  const [loading, setLoading] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({});
  const navigate=useNavigate()
  const [currentWeekStart, setCurrentWeekStart] = useState(
    moment().startOf("day")
  );
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlotsByDate, setBookedSlotsByDate] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTime, setSelectedTime] = useState({ slot: "" });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const token =localStorage.getItem("token")
  const decoded=jwtDecode(token)
  const role=decoded.role

  // Fetch hospitals when the component mounts
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await api.get("/hospitals/hospitals");
        const fetchedHospitals = response.data.data || [];
        setHospitals(fetchedHospitals);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        setHospitals([]);
      }
    };
    fetchHospitals();
  }, []);

  // Fetch doctors when the selected hospital changes
  // Fetch specialties and doctors when the component mounts
  useEffect(() => {
    const fetchDoctorsAndSpecialties = async () => {
      try {
        const response = await api.get("/users/doctors");
        const fetchedDoctors = response.data;

        // Set the doctors in state
        setDoctors(fetchedDoctors);

        // Extract unique specialties
        const specialtiesSet = new Set();
        fetchedDoctors.forEach((doctor) => {
          if (doctor.doctorDetails.specialtyType) {
            specialtiesSet.add(doctor.doctorDetails.specialtyType);
          }
        });

        // Convert Set to Array and set specialties
        setSpecialties(Array.from(specialtiesSet));
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctorsAndSpecialties();
  }, []);

  // Fetch doctor details when selected doctor changes and generate slots
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (selectedDoctor) {
        try {
          const response = await api.get(`/users/doctors/${selectedDoctor}`);
          const details = response.data;
          setDoctorDetails(details);
        } catch (error) {
          console.error("Error fetching doctor details:", error);
          setDoctorDetails(null);
        }
      }
    };
    fetchDoctorDetails();
  }, [selectedDoctor]);

  // Fetch booked slots whenever doctorDetails changes
  useEffect(() => {
    if (doctorDetails) {
      const fetchBookedSlots = async () => {
        try {
          const response = await api.get(
            `/appointments/appointments/booked/${doctorDetails._id}`
          );
          console.log("Booked slots API response:", response.data);
          if (response.data.success) {
            setBookedSlots(response.data.bookedSlots || {});
            console.log("Updated booked slots:", response.data.bookedSlots);
          }
        } catch (error) {
          console.error("Error fetching booked slots:", error);
          setBookedSlots({});
        }
      };
      fetchBookedSlots();
    } else {
      setBookedSlots({});
    }
  }, [doctorDetails]);

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    const countryObj = countryData.find((c) => c.name === selectedCountry);
    setFilteredStates(countryObj ? countryObj.states : []);
    setState("");
    setCity("");
    setFilteredCities([]);
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setState(selectedState);
    const stateObj = filteredStates.find((s) => s.name === selectedState);
    setFilteredCities(stateObj ? stateObj.cities : []);
    setCity("");
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(" ")) {
      console.warn("Invalid time string:", timeStr);
      return 0;
    }
    const [time, period] = timeStr.split(" ");
    const [hoursStr, minutesStr] = time.split(":");

    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) {
      console.warn("Invalid time format:", timeStr);
      return 0;
    }

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const handleSlotSubmission = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time.");
      return;
    }

    const formattedDate = moment(selectedDate).format("DD MMMM, YYYY");
    const formattedTime = moment(selectedTime, "HH:mm").format("hh:mm A");

    console.log("Selected Slot:", formattedDate, formattedTime);

    // You can now call your booking API or do further validation here
  };

  // Generate time slots dynamically based on the doctor's working hours and break time
  useEffect(() => {
    if (
      doctorDetails &&
      doctorDetails.doctorDetails &&
      doctorDetails.doctorDetails.workingHours
    ) {
      const { workingHours } = doctorDetails.doctorDetails;
      console.log("Doctor working hours:", workingHours);

      const { workingTime, checkupTime, breakTime } = workingHours;

      if (workingTime && checkupTime && breakTime) {
        const startTime = timeToMinutes(workingTime.split(" - ")[0]);
        const endTime = timeToMinutes(workingTime.split(" - ")[1]);
        const checkupEnd = timeToMinutes(checkupTime.split(" - ")[1]);
        const breakStart = timeToMinutes(breakTime);
        const breakEnd = breakStart + 60;

        console.log("Time ranges:", {
          startTime,
          endTime,
          checkupEnd,
          breakStart,
          breakEnd
        });

        const slots = [];
        for (let time = startTime; time < endTime; time += 20) {
          let slotStatus = "No Schedule";
          if (time >= breakStart && time < breakEnd) {
            slotStatus = "Lunch Break";
          } else if (time < checkupEnd) {
            slotStatus = "Available";
          }
          const slotTime = `${Math.floor(time / 60)
            .toString()
            .padStart(2, "0")}:${(time % 60).toString().padStart(2, "0")} ${
            time < 720 ? "AM" : "PM"
          }`;
          slots.push({ time: slotTime, status: slotStatus });
        }
        console.log("Generated time slots:", slots);
        setTimeSlots(slots);
      }
    }
  }, [doctorDetails]);

  const isSlotBooked = (timeSlot, date) => {
    return (
      bookedSlotsByDate[date] && bookedSlotsByDate[date].includes(timeSlot)
    );
  };

  const getWeekDays = (start) => {
    return Array.from({ length: 7 }, (_, i) =>
      moment(start).add(i, "days").format("YYYY-MM-DD")
    );
  };

  const days = getWeekDays(currentWeekStart);

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => moment(prev).add(7, "days"));
  };

  const handlePreviousWeek = () => {
    if (moment(currentWeekStart).isAfter(moment(), "day")) {
      setCurrentWeekStart((prev) => moment(prev).subtract(7, "days"));
    }
  };

  const handleSlotClick = (time, day) => {
    setSelectedSlot({ time, day });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setAppointmentSuccess(false);
  };
  

  const handleBookAppointment = async () => {
    // Validate required fields
    const missingFields = [];

    if (!patientIssue) missingFields.push("Patient Issue");
    if (!country) missingFields.push("Country");
    if (!state) missingFields.push("State");
    if (!city) missingFields.push("City");
    if (!doctorDetails?._id) missingFields.push("Doctor");
    if (!selectedDate) missingFields.push("Date");
    if (!selectedHour || !selectedMinute) missingFields.push("Time");

    if (missingFields.length > 0) {
      toast.error(`Please provide the following details: ${missingFields.join(", ")}`);
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

    const appointmentData = {
      patient: selectedPatient,
      specialty,
      country,
      state,
      city,
      appointmentDate: selectedDate,
      appointmentTime: formattedTime,
      doctor: doctorDetails._id,
      patientIssue,
    };

    setLoading(true);
    try {
      const response = await api.post("/appointments/appointment", appointmentData);
      setAppointmentSuccess(true);
      navigate(`/${role}/appointment-booking`)
      toast.success("Appointment booked successfully!");
    } catch (error) {
      console.error("Error booking appointment", error);
      toast.error("Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  // Add isTimeSlotBooked function with debugging
  const isTimeSlotBooked = (hour, minute) => {
    if (!selectedDate || !bookedSlots || !bookedSlots[selectedDate]) {
      console.log("Time slot check - missing data:", {
        selectedDate,
        hasBookedSlots: !!bookedSlots,
        hasDateSlots: bookedSlots && !!bookedSlots[selectedDate]
      });
      return false;
    }
    
    // Convert the selected time to 24-hour format for comparison
    let hour24 = parseInt(hour);
    if (selectedPeriod === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (selectedPeriod === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    // Format the time string to match the API format (HH:mm)
    const timeToCheck = `${hour24.toString().padStart(2, '0')}:${minute}`;
    
    const isBooked = bookedSlots[selectedDate].includes(timeToCheck);
    console.log("Time slot check:", {
      date: selectedDate,
      timeToCheck,
      isBooked,
      bookedSlotsForDate: bookedSlots[selectedDate]
    });
    
    return isBooked;
  };

  // Update time selection handlers with debugging
  const handleHourChange = (hour) => {
    console.log("Hour changed:", hour);
    setSelectedHour(hour);
    setSelectedMinute(""); // Reset minutes when hour changes
  };

  const handleMinuteChange = (minute) => {
    console.log("Minute changed:", minute);
    setSelectedMinute(minute);
  };

  const handlePeriodChange = (period) => {
    console.log("Period changed:", period);
    setSelectedPeriod(period);
  };

  const handleDateChange = (date) => {
    console.log("Date changed:", date);
    setSelectedDate(date);
    // Reset time selection when date changes
    setSelectedHour("");
    setSelectedMinute("");
    setSelectedPeriod("AM");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Appointment Booking</h2>

      <div className="flex items-end gap-2 mb-8">
        <div className="w-full">
          <label
            htmlFor="mobileNumber"
            className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200"
          >
            Search Patient by Mobile
          </label>
          <input
            type="text"
            id="mobileNumber"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm mb-4"
            placeholder="Enter Mobile Number"
          />
          <button
            onClick={async () => {
              try {
                const res = await api.get(`/users/patients`);
                const allPatients = res.data;

                const matchedPatient = allPatients.find(
                  (p) => p.phoneNumber === mobileNumber
                );

                if (matchedPatient) {
                  setFilteredPatient(matchedPatient);
                  setSelectedPatient(matchedPatient._id);
                  toast.success("Patient found");
                } else {
                  setFilteredPatient(null);
                  setSelectedPatient("");
                  toast.error("No patient found with this mobile number");
                }
              } catch (err) {
                console.error("Error fetching patient:", err);
                toast.error("Something went wrong!");
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {/* Dropdowns for filters */}
        <SelectField
          id="specialty"
          label="Specialty"
          options={specialties.map((specialty) => ({
            label: specialty,
            value: specialty,
          }))}
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        />
        <SelectField
          id="country"
          label="Country"
          options={countryData.map((c) => ({ label: c.name, value: c.name }))}
          value={country}
          onChange={handleCountryChange}
        />
        <SelectField
          id="state"
          label="State"
          options={filteredStates.map((state) => ({
            label: state.name,
            value: state.name,
          }))}
          value={state}
          onChange={handleStateChange}
        />
        <SelectField
          id="city"
          label="City"
          options={filteredCities.map((city) => ({
            label: city.name,
            value: city.name,
          }))}
          value={city}
          onChange={handleCityChange}
        />
        <SelectField
          id="doctor"
          label="Doctor"
          options={doctors.map((doctor) => ({
            label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            value: doctor._id,
          }))}
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        />
        {filteredPatient && (
          <>
            <div className="relative mb-4">
              <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200">
                Full Name
              </label>
              <input
                type="text"
                value={`${filteredPatient.firstName} ${filteredPatient.lastName}`}
                className="w-full border border-gray-300 p-2 px-4 rounded-xl focus:outline-none"
                readOnly
              />
            </div>

            <div className="relative mb-4">
              <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200">
                Age
              </label>
              <input
                type="text"
                value={filteredPatient.age}
                className="w-full border border-gray-300 p-2 px-4 rounded-xl focus:outline-none"
                readOnly
              />
            </div>

            <div className="relative mb-4">
              <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200">
                Gender
              </label>
              <input
                type="text"
                value={filteredPatient.gender}
                className="w-full border border-gray-300 p-2 px-4 rounded-xl focus:outline-none"
                readOnly
              />
            </div>

            <div className="relative mb-4">
              <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200">
                Mobile Number
              </label>
              <input
                type="text"
                value={filteredPatient.phoneNumber}
                className="w-full border border-gray-300 p-2 px-4 rounded-xl focus:outline-none"
                readOnly
              />
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4">
        {/* Time Slots Table - Left Side 70% */}
        {doctorDetails && (
          <div className="w-full p-4 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <label className="flex flex-col text-sm font-medium text-gray-700">
                Select Date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="mt-1 border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0eabeb]"
                  min={moment().format('YYYY-MM-DD')}
                />
              </label>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Select Time</label>
                <TimePickerDropdown
                  selectedHour={selectedHour}
                  selectedMinute={selectedMinute}
                  selectedPeriod={selectedPeriod}
                  onHourChange={handleHourChange}
                  onMinuteChange={handleMinuteChange}
                  onPeriodChange={handlePeriodChange}
                  isTimeSlotBooked={isTimeSlotBooked}
                  disabled={!selectedDate}
                />
              </div>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Enter Patient Issue"
                className="w-full border border-gray-300 p-2 px-4 rounded-xl focus:outline-none"
                value={patientIssue}
                onChange={(e) => setPatientIssue(e.target.value)}
              />
              <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-[#030229] transition-all duration-200">
                Patient Issue
              </label>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Enter Disease Name"
                className="w-full border border-gray-300 p-2 px-4 rounded-xl focus:outline-none"
                value={diseaseName}
                onChange={(e) => setDiseaseName(e.target.value)}
              />
              <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-[#030229] transition-all duration-200">
                Disease Name (Optional)
              </label>
            </div>

            <button
              onClick={handleBookAppointment}
              className="px-6 py-2 bg-[#0eabeb] text-white rounded-xl hover:bg-[#0eabee] transition shadow-md"
            >
              Book Slot
            </button>
          </div>
        )}

        {/* Doctor Details - Right Side 30% */}
        {doctorDetails && (
          <div className="w-full p-4">
            <div className="bg-white shadow-lg rounded-xl p-6">
              <div className="flex items-center mb-4">
                <img
                  src={doctorDetails.profileImage}
                  alt="Doctor"
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold text-blue-600">
                    Dr. {doctorDetails.firstName} {doctorDetails.lastName}
                  </h3>
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm">
                    {doctorDetails.gender === "Male" ? "Male" : "Female"}
                  </span>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-xl">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Qualification</p>
                    <p className="text-gray-900">
                      {doctorDetails.qualification}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Years of Experience</p>
                    <p className="text-gray-900">
                      {doctorDetails.doctorDetails.experience}+ Year
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Specialty Type</p>
                    <p className="text-gray-900">
                      {doctorDetails.doctorDetails.specialtyType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Working Time</p>
                    <p className="text-gray-900">
                      {doctorDetails.doctorDetails.workingHours.workingTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Break Time</p>
                    <p className="text-gray-900">
                      {doctorDetails.doctorDetails.workingHours.breakTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Emergency Contact Number</p>
                    <p className="text-gray-900">
                      {doctorDetails.doctorDetails.hospital
                        .emergencyContactNumber || "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Description</p>
                    <p className="text-gray-900">
                      {doctorDetails.doctorDetails.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SelectField = ({ id, label, options, value, onChange }) => (
  <div className="relative mb-4">
    <select
      id={id}
      name={id}
      className="peer w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-500 focus:outline-none"
      value={value}
      onChange={onChange}
    >
      <option value="">{`Select ${label}`}</option>
      {options &&
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
    </select>
    <label
      htmlFor={id}
      className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200"
    >
      {label}
    </label>
  </div>
);

// Update TimePickerDropdown component with improved handling
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
  console.log("TimePickerDropdown props:", {
    selectedHour,
    selectedMinute,
    selectedPeriod,
    disabled
  });

  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = (i + 1).toString().padStart(2, '0');
    return {
      value: hour,
      label: hour,
      disabled: false // You can add logic here to disable specific hours
    };
  });

  const minutes = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, '0');
    return {
      value: minute,
      label: minute,
      disabled: isTimeSlotBooked(selectedHour, minute)
    };
  });

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
          {hours.map(({ value, label, disabled: isDisabled }) => (
            <option key={value} value={value} disabled={isDisabled}>
              {label}
            </option>
          ))}
        </select>

        {/* Minute Selection */}
        <select
          value={selectedMinute}
          onChange={(e) => onMinuteChange(e.target.value)}
          disabled={disabled || !selectedHour}
          className="w-16 px-2 py-2 border-r border-gray-300 focus:outline-none appearance-none cursor-pointer bg-white"
        >
          <option value="">MM</option>
          {minutes.map(({ value, label, disabled: isDisabled }) => (
            <option key={value} value={value} disabled={isDisabled}>
              {label}
            </option>
          ))}
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

export default BookAppointment;
