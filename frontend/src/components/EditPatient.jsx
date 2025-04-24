import React, { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import countryData from "../countryjson/countries+states+cities.json"; // Assuming the file path
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";

const EditPatient = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    heigth: "",
    weigth: "",
    bloodGroup: "",
    phoneNumber: "",
    country: "",
    zipCode: "",
    gender: "",
    state: "",
    city: "",
    address: "",
    age: "",
    email: "",
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const [showHospitalFields, setShowHospitalFields] = useState(false);
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);
  const decode = jwtDecode;
  const token = localStorage.getItem("token");
  const decoded = decode(token);
  const role = decoded.role;

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
  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/users/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(response.data);
        if (response.data) {
          const patient = response.data;

          // Auto-populate state and city based on country
          const selectedCountry = countryData.find(
            (c) => c.name === patient.country
          );
          const states = selectedCountry ? selectedCountry.states : [];
          const selectedState = states.find((s) => s.name === patient.state);
          const cities = selectedState ? selectedState.cities : [];

          setFilteredStates(states);
          setFilteredCities(cities);
          const formatDateForInput = (isoDate) => {
            return isoDate ? new Date(isoDate).toISOString().split("T")[0] : "";
          };

          setFormData({
            firstName: patient.firstName || "",
            lastName: patient.lastName || "",
            dateOfBirth: formatDateForInput(patient.dateOfBirth) || "",
            heigth: patient.heigth || "",
            weigth: patient.weigth || "",
            bloodGroup: patient.bloodGroup || "",
            phoneNumber: patient.phoneNumber || "",
            country: patient.country || "",
            zipCode: patient.zipCode || "",
            gender: patient.gender || "",
            state: patient.state || "",
            city: patient.city || "",
            address: patient.address || "",
            age: patient.age || "",
            email: patient.email || "",
            adminhospital: patient.adminhospital || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch patient details:", error);
        toast.error("Failed to load patient data");
      }
    };

    fetchPatientDetails();
  }, [id]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/hospitals/hospitals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHospitalList(response.data.data);
      } catch (error) {
        console.error("Failed to fetch hospitals:", error);
        toast.error("Failed to load hospitals");
      }
    };

    fetchHospitals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await api.patch(`/users/patients/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Patient added successfully!");
      navigate(`/${role}/patient-management`);
    } catch (error) {
      console.error(error);
      toast.error("Error in adding Patient!");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-gradient-to-r from-[#f9fbff] to-[#eef5ff] min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <h2 className="text-3xl font-semibold text-[#0eabeb] text-center mb-8">
            🏥 Add New Patient
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                id="dateOfBirth"
                type="date"
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled
              />
              <InputField
                id="heigth"
                label="Height (cm)"
                value={formData.heigth}
                onChange={handleInputChange}
              />
              <InputField
                id="weigth"
                label="Weight (kg)"
                value={formData.weigth}
                onChange={handleInputChange}
              />
              <InputField
                id="bloodGroup"
                label="Blood Group"
                value={formData.bloodGroup}
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
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <SelectField
                id="adminhospital"
                label="Hospital"
                options={hospitalList?.map((h) => h.name)} // Adjust if hospital objects are different
                value={formData.adminhospital}
                onChange={handleInputChange}
              />
              <SelectField
                id="gender"
                label="Gender"
                options={["Male", "Female", "Other"]}
                value={formData.gender}
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
                label="Address"
                value={formData.address}
                onChange={handleInputChange}
              />
              <InputField
                id="age"
                label="Age"
                value={formData.age}
                onChange={handleInputChange}
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#0eabeb] text-white hover:bg-[#0984c7] px-8 py-3 rounded-xl text-lg font-medium transition duration-300"
              >
                <FiUpload className="text-xl" />
                Update Patient
              </button>
            </div>
          </form>
        </div>
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
const InputFieldWithIcon = ({ id, label, icon, value, onChange }) => {
  const defaultPlaceholder =
    label === "Working Time"
      ? "EX: 09:00 AM - 06:00 PM"
      : label === "Check-Up Time"
      ? "EX: 10:00 AM - 12:00 PM"
      : label === "Break Time"
      ? "EX: 12:00 PM - 01:00 PM"
      : `Enter ${label}`;

  return (
    <div className="relative mb-4">
      <input
        type="text"
        id={id}
        name={id}
        className="peer w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none"
        placeholder={defaultPlaceholder}
        value={value}
        onChange={onChange}
      />
      <label
        htmlFor={id}
        className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-[#030229] peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200"
      >
        {label}
      </label>
      {icon}
    </div>
  );
};

export default EditPatient;
