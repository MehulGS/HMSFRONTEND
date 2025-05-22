import React, { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import countryData from "../countryjson/countries+states+cities.json"; // Assuming the file path
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";

const AddPatientForm = () => {
  const [formData, setFormData] = useState({
    patientUniqueId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    heigth: "",
    weigth: "",
    bloodGroup: "",
    phoneNumber: "",
    gender: "",
    address: "",
    age: "",
    email: "",
    KCO: "", // Key of Contact
    drugHistory: "", // Drug History
  });

  const [errors, setErrors] = useState({});
  const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'phoneNumber', 'gender', 'age'];

  const navigate = useNavigate();
  const [hospitalList, setHospitalList] = useState([]);
  const decode = jwtDecode;
  const token = localStorage.getItem("token");
  const decoded = decode(token);
  const role = decoded.role;
  const userHospital = decoded.adminhospital;

  // Fetch next patient ID when component mounts
  useEffect(() => {
    const fetchNextPatientId = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/users/nextPatientId", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.nextPatientId) {
          setFormData(prev => ({
            ...prev,
            patientUniqueId: response.data.nextPatientId
          }));
        }
      } catch (error) {
        console.error("Failed to fetch next patient ID:", error);
        toast.error("Failed to generate patient ID");
      }
    };

    fetchNextPatientId();
  }, []);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "";
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    // Check if the date is valid
    if (isNaN(birthDate.getTime())) return "";
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // If birthday hasn't occurred this year, subtract one year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  const validateField = (name, value) => {
    if (requiredFields.includes(name) && !value) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    if (name === 'phoneNumber' && value && !/^\d{10}$/.test(value)) {
      return 'Phone number must be 10 digits';
    }
    if (name === 'age' && value && (isNaN(value) || value < 0 || value > 120)) {
      return 'Age must be between 0 and 120';
    }
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email format';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If date of birth is changed, calculate age automatically
    if (name === "dateOfBirth") {
      const calculatedAge = calculateAge(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        age: calculatedAge
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/hospitals/hospitals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Filter hospitals based on role
        if (role === "receptionist" || role === "doctor") {
          // For receptionist and doctor, only show their assigned hospital
          const filteredHospitals = response.data.data.filter(
            hospital => hospital._id === userHospital
          );
          setHospitalList(filteredHospitals);
          // Set the hospital automatically for receptionist/doctor
          setFormData(prev => ({
            ...prev,
            adminhospital: filteredHospitals[0]?.name || ""
          }));
        } else {
          // For admin, show all hospitals
          setHospitalList(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch hospitals:", error);
        toast.error("Failed to load hospitals");
      }
    };

    fetchHospitals();
  }, [role, userHospital]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/users/register-patient", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 201) {
        const error = response.data;
        console.error("Server error:", error);
        toast.error(`Error: ${error.message}`);
        return;
      }

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
                id="patientUniqueId"
                label="Patient ID"
                value={formData.patientUniqueId}
                onChange={handleInputChange}
                disabled={true}
              />
              <InputField
                id="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required={true}
                error={errors.firstName}
              />
              <InputField
                id="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required={true}
                error={errors.lastName}
              />
              <InputField
                id="dateOfBirth"
                type="date"
                label="Date of Birth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required={true}
                error={errors.dateOfBirth}
              />
              <InputField
                id="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required={true}
                error={errors.phoneNumber}
              />
              <SelectField
                id="gender"
                label="Gender"
                options={["Male", "Female", "Other"]}
                value={formData.gender}
                onChange={handleInputChange}
                required={true}
                error={errors.gender}
              />
              <InputField
                id="age"
                label="Age"
                value={formData.age}
                onChange={handleInputChange}
                required={true}
                error={errors.age}
                placeholder="Auto-calculated from date of birth"
              />
              <InputField
                id="KCO"
                label="Key of Contact"
                value={formData.KCO}
                onChange={handleInputChange}
                placeholder="Enter name and relationship of emergency contact"
              />
              <InputField
                id="drugHistory"
                label="Drug History"
                value={formData.drugHistory}
                onChange={handleInputChange}
                placeholder="Enter patient's drug history"
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
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
              />
              <SelectField
                id="adminhospital"
                label="Hospital"
                options={hospitalList?.map((h) => h.name)}
                value={formData.adminhospital}
                onChange={handleInputChange}
                disabled={role === "receptionist" || role === "doctor"}
              />
              <InputField
                id="address"
                label="Address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#0eabeb] text-white hover:bg-[#0984c7] px-8 py-3 rounded-xl text-lg font-medium transition duration-300"
              >
                <FiUpload className="text-xl" />
                Add Patient
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
  disabled = false,
  required = false,
  error = "",
}) => (
  <div className="relative mb-4">
    <input
      type={type}
      id={id}
      name={id}
      className={`peer w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      placeholder={placeholder || `Enter ${label}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
    />
    <label
      htmlFor={id}
      className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-[#030229] peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200"
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

// SelectField component
const SelectField = ({ 
  id, 
  label, 
  options, 
  value, 
  onChange, 
  disabled = false,
  required = false,
  error = "",
}) => (
  <div className="relative mb-4">
    <select
      id={id}
      name={id}
      className={`peer w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl text-[#030229] focus:outline-none ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
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
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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

export default AddPatientForm;
