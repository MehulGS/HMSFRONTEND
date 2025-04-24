import React, { useState } from "react";
import { AiOutlineCamera, AiOutlineClockCircle } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api";
import countryData from "../../countryjson/countries+states+cities.json"; // Assuming the file path
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

const AddDoctorForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    qualification: "",
    specialtyType: "",
    checkupTime: "",
    phoneNumber: "",
    country: "",
    zipCode: "",
    onlineConsultationRate: "",
    gender: "",
    workType: "Onsite",
    state: "",
    city: "",
    address: "",
    description: "",
    experience: "",
    workingTime: "",
    breakTime: "",
    age: "",
    email: "",
    hospitalName: "",
    hospitalAddress: "",
    emergencyContactNumber: "",
    websiteLink: "",
    password: "",
  });

  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [signature, setSignature] = useState(null);
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const decode = jwtDecode;
  const token = localStorage.getItem("token");
  const decoded = decode(token);
  const role = decoded.role;
  console.log("first", decoded.role);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Handle country change and populate states
    if (name === "country") {
      const selectedCountry = countryData.find(
        (country) => country.name === value
      );
      setFilteredStates(selectedCountry ? selectedCountry.states : []);
      setFilteredCities([]); // Reset cities when country changes
    }

    // Handle state change and populate cities
    if (name === "state") {
      const selectedState = filteredStates.find(
        (state) => state.name === value
      );
      setFilteredCities(selectedState ? selectedState.cities : []);
    }
  };

  const handlePhotoUpload = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const handleSignatureUpload = (e) => {
    setSignature(e.target.files[0]);
  };

  console.log(formData)

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (profilePhoto) data.append("profileImage", profilePhoto);
    if (signature) data.append("signatureImage", signature);

    try {
      const token = localStorage.getItem("token");

      const response = await api.post("/users/add-doctor", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 201) {
        const error = response.data;
        console.error("Server error:", error);
        alert(`Error: ${error.message}`);
        return;
      }
      toast.success("Doctor added successfully!");
      navigate(`/${role}/doctor-management`);
    } catch (error) {
      toast.error("Error in adding doctor!");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex flex-col w-full bg-white rounded-xl shadow-md px-4 py-6 md:p-8">
        <form
          onSubmit={handleSubmit}
          className="border border-gray-300 rounded-xl px-4 py-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
            Add New Doctor
          </h2>

          <div className="flex flex-col md:flex-row md:justify-between gap-8">
            <div className="flex flex-col w-full md:w-1/3">
              <div className="relative mb-6 flex flex-col items-center">
                <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center">
                  {profilePhoto ? (
                    <img
                      src={URL.createObjectURL(profilePhoto)}
                      alt="Profile"
                      className="rounded-full w-full h-full object-cover"
                    />
                  ) : (
                    <AiOutlineCamera className="text-gray-400 text-3xl" />
                  )}
                </div>
                <label className="mt-2 text-blue-500 cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    name="profile"
                    onChange={handlePhotoUpload}
                  />
                  Choose Photo
                </label>
              </div>

              <div className="mb-6">
                <label className="text-gray-700 text-sm font-medium">
                  Upload Signature
                </label>
                <div className="flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl p-4 w-full mt-2 h-40">
                  <div className="flex align-middle justify-center h-full items-center">
                    {signature ? (
                      <img
                        src={URL.createObjectURL(signature)}
                        alt="Signature"
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <div className="text-center">
                        <FiUpload className="text-[#030229] text-2xl mx-auto" />
                        <label className="text-blue-500 cursor-pointer mt-2">
                          <input
                            type="file"
                            className="hidden"
                            name="signature"
                            onChange={handleSignatureUpload}
                          />
                          Upload a file
                        </label>
                        <p className="text-xs text-gray-400">PNG Up To 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Form Fields */}
              <InputField
                id="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
              />
              <InputField
                id="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
              />
              <InputField
                id="qualification"
                label="Doctor Qualification"
                value={formData.qualification}
                onChange={handleInputChange}
              />
              <InputField
                id="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <SelectField
                id="gender"
                label="Gender"
                options={["Male", "Female", "Other"]}
                value={formData.gender}
                onChange={handleInputChange}
              />
              <InputField
                id="specialtyType"
                label="Specialty Type"
                value={formData.specialtyType}
                onChange={handleInputChange}
              />
              <TimeRangePicker
                id="workingTime"
                label="Working Time"
                icon={<AiOutlineClockCircle />}
                value={formData.workingTime}
                onChange={handleInputChange}
              />
              <TimeRangePicker
                id="checkupTime"
                label="Check-Up Time"
                icon={<AiOutlineClockCircle />}
                value={formData.checkupTime}
                onChange={handleInputChange}
              />
              <TimeRangePicker
                id="breakTime"
                label="Break Time"
                icon={<AiOutlineClockCircle />}
                value={formData.breakTime}
                onChange={handleInputChange}
              />
              <InputField
                id="experience"
                label="Experience"
                value={formData.experience}
                onChange={handleInputChange}
              />
              <InputField
                id="age"
                label="Age"
                value={formData.age}
                onChange={handleInputChange}
              />
              <InputField
                id="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
              <InputField
                id="email"
                label="Doctor Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <SelectField
                id="country"
                label="Country"
                options={countryData.map((country) => country.name)}
                value={formData.country}
                onChange={handleInputChange}
              />
              <SelectField
                id="state"
                label="State"
                options={filteredStates.map((state) => state.name)}
                value={formData.state}
                onChange={handleInputChange}
              />
              <SelectField
                id="city"
                label="City"
                options={filteredCities.map((city) => city.name)}
                value={formData.city}
                onChange={handleInputChange}
              />
              <InputField
                id="zipCode"
                label="Zip Code"
                value={formData.zipCode}
                onChange={handleInputChange}
              />
              <InputField
                id="address"
                label="Doctor Address"
                value={formData.address}
                onChange={handleInputChange}
              />
              <InputField
                id="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
              />
              <InputField
                id="onlineConsultationRate"
                label="Online Consultation Rate"
                placeholder="₹ 0000"
                value={formData.onlineConsultationRate}
                onChange={handleInputChange}
              />
              <InputField
                id="emergencyContactNumber"
                label="Emergency Contact Number"
                value={formData.emergencyContactNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-[#f6f8fb] hover:bg-[#0eabeb] text-[#4f4f4f] hover:text-white px-12 py-2 rounded-xl"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// InputField component
const InputField = ({
  id,
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
}) => (
  <div className="relative mb-4">
    <input
      type={type}
      id={id}
      name={id}
      className="peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
      placeholder={placeholder || `Enter ${label}`}
      value={value}
      onChange={onChange}
    />
    <label
      htmlFor={id}
      className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-[#030229] peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200"
    >
      {label}
    </label>
  </div>
);

// SelectField component
const SelectField = ({ id, label, options, value, onChange }) => (
  <div className="relative mb-4">
    <select
      id={id}
      name={id}
      className="peer w-full px-4 py-2 border border-gray-300 rounded-xl text-[#030229] focus:outline-none"
      value={value}
      onChange={onChange}
    >
      <option value="">{`Select ${label}`}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <label
      htmlFor={id}
      className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-[#030229] peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200"
    >
      {label}
    </label>
  </div>
);

// InputFieldWithIcon component
const TimeRangePicker = ({ id, label, icon, value, onChange }) => {
  const [startTime, endTime] = value ? value.split(" - ") : ["", ""];

  const handleChange = (type, time) => {
    const newStart = type === "start" ? time : startTime;
    const newEnd = type === "end" ? time : endTime;
    const combined = `${newStart} - ${newEnd}`;
    onChange({ target: { name: id, value: combined } });
  };

  const generateTimeOptions = () => {
    const times = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const period = hour < 12 ? "AM" : "PM";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const h = displayHour.toString().padStart(2, "0");
        const m = minute.toString().padStart(2, "0");
        const time = `${h}:${m} ${period}`;
        times.push(time);
      }
    }

    return times.map((time) => (
      <option key={time} value={time}>
        {time}
      </option>
    ));
  };

  const defaultPlaceholder =
    label === "Working Time"
      ? "EX: 09:00 AM - 06:00 PM"
      : label === "Check-Up Time"
      ? "EX: 10:00 AM - 12:00 PM"
      : label === "Break Time"
      ? "EX: 12:00 PM - 01:00 PM"
      : `Enter ${label}`;

  return (
    <div className="relative">
      <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-[#030229] peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <select
          value={startTime}
          onChange={(e) => handleChange("start", e.target.value)}
          className="peer w-full px-4 py-2 border border-gray-300 rounded-xl text-[#030229] focus:outline-none"
        >
          <option value="">Select Start Time</option>
          {generateTimeOptions()}
        </select>

        <span className="text-gray-500">to</span>

        <select
          value={endTime}
          onChange={(e) => handleChange("end", e.target.value)}
          className="peer w-full px-4 py-2 border border-gray-300 rounded-xl text-[#030229] focus:outline-none"
        >
          <option value="">Select End Time</option>
          {generateTimeOptions()}
        </select>
      </div>
    </div>
  );
};


export default AddDoctorForm;
