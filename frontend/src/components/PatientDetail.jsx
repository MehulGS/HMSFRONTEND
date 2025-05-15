import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUser, FaPhone, FaEnvelope, FaHospital, FaUserMd, FaCalendarAlt, FaTint, FaVenusMars, FaIdCard, FaPills, FaDisease } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import api from "../api/api";
import { jwtDecode } from "jwt-decode";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setIsAdmin(decoded.role === "admin");
    }
  }, []);

  useEffect(() => {
    const fetchPatientAndHospitalDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch patient details
        const patientResponse = await api.get(`/users/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatient(patientResponse.data);

        // Fetch all hospitals
        const hospitalResponse = await api.get("/hospitals/hospitals", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Find the specific hospital from the list using the adminhospital ID string
        if (patientResponse.data.adminhospital) {
          const patientHospital = hospitalResponse.data.data.find(
            h => h._id === patientResponse.data.adminhospital
          );
          if (patientHospital) {
            setHospital(patientHospital);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching details:", error);
        setLoading(false);
      }
    };

    fetchPatientAndHospitalDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <Skeleton height={40} count={6} className="mb-4" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <h2 className="text-xl text-gray-600">Patient not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <FaArrowLeft className="mr-2" />
          Back to Patient List
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                  <FaUser className="text-xl sm:text-2xl" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold break-words">
                    {patient.firstName} {patient.lastName}
                  </h1>
                  <p className="text-sm sm:text-base text-white/80">Patient ID: {patient.patientUniqueId || 'N/A'}</p>
                </div>
              </div>
              {patient.caseStatus && (
                <div className="bg-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full self-start sm:self-auto">
                  <span className="text-xs sm:text-sm font-medium">
                    {patient.patientUniqueId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Personal Information */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">
                  Personal Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FaIdCard className="text-blue-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Patient ID</p>
                      <p className="font-medium break-words">{patient.patientUniqueId || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaPhone className="text-blue-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium break-words">{patient.phoneNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaEnvelope className="text-blue-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium break-all">{patient.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaVenusMars className="text-blue-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{patient.gender || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FaTint className="text-blue-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <p className="font-medium">{patient.bloodGroup || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hospital Information - Only visible to admin */}
              {isAdmin && hospital && (
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">
                    Hospital Information
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {/* Hospital Logo */}
                      {hospital.logoUrl && (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                          <img
                            src={hospital.logoUrl}
                            alt={`${hospital.name} logo`}
                            className="w-full h-full object-contain rounded-lg bg-white p-1"
                          />
                        </div>
                      )}
                      
                      <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
                        {/* Hospital Name and ID */}
                        <div>
                          <p className="text-sm text-gray-500">Hospital Name</p>
                          <p className="font-medium break-words">{hospital.name}</p>
                          <p className="text-sm text-gray-500 break-all">ID: {hospital._id}</p>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500">Phone Number</p>
                            <p className="font-medium break-words">{hospital.phone || "N/A"}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium break-all">{hospital.email || "N/A"}</p>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium break-words">{hospital.address}</p>
                          {(hospital.city || hospital.state || hospital.zipCode) && (
                            <p className="font-medium break-words">
                              {hospital.city}
                              {hospital.state && `, ${hospital.state}`}
                              {hospital.zipCode && ` - ${hospital.zipCode}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Information */}
              <div className="space-y-3 sm:space-y-4 md:col-span-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">
                  Medical Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <FaCalendarAlt className="text-blue-500 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="font-medium">{patient.age || "N/A"} years</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FaCalendarAlt className="text-blue-500 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prescription Information */}
              <div className="space-y-3 sm:space-y-4 md:col-span-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 border-b pb-2">
                  Prescription Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Diseases */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaDisease className="text-blue-500 text-lg sm:text-xl flex-shrink-0" />
                      <h3 className="font-medium">Diseases</h3>
                    </div>
                    {patient.diseases && patient.diseases.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2">
                        {patient.diseases.map((disease, index) => (
                          <li key={index} className="text-gray-700 break-words">{disease}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No diseases recorded</p>
                    )}
                  </div>

                  {/* Medicines */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <FaPills className="text-blue-500 text-lg sm:text-xl flex-shrink-0" />
                      <h3 className="font-medium">Medicines</h3>
                    </div>
                    {patient.medicines && patient.medicines.length > 0 ? (
                      <ul className="space-y-3">
                        {patient.medicines.map((medicine, index) => (
                          <li key={index} className="border-b pb-2 last:border-b-0">
                            <p className="font-medium break-words">{medicine.name}</p>
                            <p className="text-sm text-gray-600 break-words">Dosage: {medicine.dosage}</p>
                            <p className="text-sm text-gray-600 break-words">Duration: {medicine.duration}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No medicines prescribed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail; 