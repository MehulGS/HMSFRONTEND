import React, { useEffect, useState } from "react";
import { AiOutlineCamera, AiOutlineClockCircle } from "react-icons/ai";
import { FiUpload } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import countryData from "../countryjson/countries+states+cities.json";
import toast from "react-hot-toast";
import api from "../api/api";

const EditReceiptionist = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    Qualification: "",
    phoneNumber: "",
    country: "",
    zipCode: "",
    gender: "",
    state: "",
    city: "",
    Address: "",
    Email: "",
    emergencyContact: "",
  });

  const [showHospitalFields, setShowHospitalFields] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [signatureImagePreview, setSignatureImagePreview] = useState(null);

  // For dynamically filtered states and cities
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await api.get(`/users/receptionist/${id}`);
        const doctor = response.data;

        setFormData({
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          Qualification: doctor.qualification,
          phoneNumber: doctor.phoneNumber,
          country: doctor.country,
          zipCode: doctor.zipCode,
          gender: doctor.gender,
          state: doctor.state,
          city: doctor.city,
          doctorAddress: doctor.address,
          doctorEmail: doctor.email,
          emergencyContact:
            doctor.receptionistDetails.emergencyContactNumber,
        });

        // Set preview images
        setProfileImagePreview(`${doctor.profileImage}`);
        setSignatureImagePreview(`${doctor.signatureImage}`);

        // Populate states and cities if country and state are present
        const selectedCountry = countryData.find(
          (c) => c.name === doctor.country
        );
        if (selectedCountry) {
          setFilteredStates(selectedCountry.states);
          const selectedState = selectedCountry.states.find(
            (s) => s.name === doctor.state
          );
          setFilteredCities(selectedState ? selectedState.cities : []);
        }
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      }
    };

    fetchDoctorData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (name === "country") {
      const selectedCountry = countryData.find(
        (country) => country.name === value
      );
      setFilteredStates(selectedCountry ? selectedCountry.states : []);
      setFilteredCities([]); // Reset cities when country changes
      setFormData((prevData) => ({ ...prevData, state: "", city: "" }));
    }

    if (name === "state") {
      const selectedState = filteredStates.find(
        (state) => state.name === value
      );
      setFilteredCities(selectedState ? selectedState.cities : []);
      setFormData((prevData) => ({ ...prevData, city: "" }));
    }
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;

    if (files.length > 0) {
      const file = files[0];

      setFormData((prevData) => ({
        ...prevData,
        [name]: file, // ✅ Store File object instead of URL
      }));

      // ✅ Set preview for UI updates
      if (name === "profileImage") {
        setProfileImagePreview(URL.createObjectURL(file));
      } else if (name === "signatureImage") {
        setSignatureImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Append all form fields (excluding files)
    Object.keys(formData).forEach((key) => {
      if (
        formData[key] !== null &&
        formData[key] !== undefined &&
        key !== "profileImage" &&
        key !== "signatureImage" // Exclude files for separate handling
      ) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // ✅ Append Images Properly
    if (formData.profileImage instanceof File) {
      formDataToSend.append("profileImage", formData.profileImage);
    }
    if (formData.signatureImage instanceof File) {
      formDataToSend.append("signatureImage", formData.signatureImage);
    }

    try {
      const response = await api.put(`/users/receptionist/${id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Receiptionist updated successfully!");
      navigate("/admin/reception-management");
    } catch (error) {
      console.error("Error updating Receiptionist:", error.response?.data || error);
      toast.error("Failed to update Receiptionist profile.");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex flex-col w-full bg-white rounded-lg shadow-lg">
        <div className="rounded-xl px-6 py-8">
          <h2 className="text-2xl font-bold mb-4 text-center md:text-left ms-2">
            Edit Receiptionist Detail
          </h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Profile Image and Signature Section */}
            <div className="flex flex-col md:flex-row justify-between gap-8">
              {/* Profile Image Section */}
              <div className="flex flex-col w-full md:w-1/4 items-center">
                <div className="relative mb-4 flex flex-col items-center">
                  <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Profile"
                        className="rounded-full w-full h-full"
                      />
                    ) : (
                      <AiOutlineCamera className="text-gray-400 text-3xl" />
                    )}
                  </div>
                  <label className="mt-2 text-blue-500 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      name="profileImage"
                      onChange={handleImageChange}
                    />
                    Choose Photo
                  </label>
                </div>

                {/* Signature Upload */}
                <div className="mb-4">
                  <label className="text-gray-700 text-sm font-medium">
                    Upload Signature
                  </label>
                  <div className="flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl p-5 w-1/2 mt-2 m-auto">
                    {signatureImagePreview ? (
                      <img
                        src={signatureImagePreview}
                        alt="Signature"
                        className="object-contain w-1/2 m-auto"
                      />
                    ) : (
                      <div className="flex justify-center">
                        <FiUpload className="text-gray-500 text-2xl" />
                      </div>
                    )}
                    <div className="text-center mt-2">
                      <label className="text-blue-500 cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          name="signatureImage"
                          onChange={handleImageChange}
                        />
                        Upload a file
                      </label>
                      <p className="text-xs text-gray-400">PNG Up To 5MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Info Section */}
              <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InputField
                  id="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <InputField
                  id="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                <InputField
                  id="doctorQualification"
                  label="Receiptionist Qualification"
                  value={formData.Qualification}
                  onChange={handleChange}
                />
                <SelectField
                  id="gender"
                  label="Gender"
                  options={["Male", "Female", "Other"]}
                  value={formData.gender}
                  onChange={handleChange}
                />
                <InputField
                  id="phoneNumber"
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                <InputField
                  id="doctorEmail"
                  label="Receiptionist Email"
                  type="email"
                  value={formData.doctorEmail}
                  onChange={handleChange}
                />
                <SelectField
                  id="country"
                  label="Country"
                  options={countryData.map((country) => country.name)}
                  value={formData.country}
                  onChange={handleChange}
                />
                <SelectField
                  id="state"
                  label="State"
                  options={filteredStates.map((state) => state.name)}
                  value={formData.state}
                  onChange={handleChange}
                />
                <SelectField
                  id="city"
                  label="City"
                  options={filteredCities.map((city) => city.name)}
                  value={formData.city}
                  onChange={handleChange}
                />
                <InputField
                  id="zipCode"
                  label="Zip Code"
                  value={formData.zipCode}
                  onChange={handleChange}
                />
                <InputField
                  id="doctorAddress"
                  label="Doctor Address"
                  value={formData.doctorAddress}
                  onChange={handleChange}
                />
                <InputField
                  id="emergencyContact"
                  label="Emergency Contact Number"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="py-2 px-8 bg-[#f6f8fb] text-[#4f4f4f] hover:bg-[#0eabeb] hover:text-white rounded-xl"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Input field components
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
      className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-500 peer-focus:-top-2.5 peer-focus:left-3 transition-all duration-200"
    >
      {label}
    </label>
  </div>
);

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
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
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


export default EditReceiptionist;
