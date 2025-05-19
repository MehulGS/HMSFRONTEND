import React, { useEffect, useState } from "react";
import { FaEdit, FaIdCard } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../api/api";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PatientDetails = ({ patient }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient) {
      setTimeout(() => setLoading(false), 1000); // Simulate loading delay
    } else {
      setError("Patient data not available.");
      setLoading(false);
    }
  }, [patient]);

  if (loading) {
    return (
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <Skeleton width={120} height={24} />
        </div>
        <div className="flex justify-between items-start">
          <div className="flex-grow ml-4 sm:ml-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="font-semibold leading-5">
                  <Skeleton width={80} height={16} />
                  <Skeleton width={120} height={16} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!patient) {
    return <div className="text-gray-500 p-4">Patient not found</div>;
  }

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg">
      {/* Patient ID Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-blue-500 p-1.5 sm:p-2 rounded-lg">
              <FaIdCard className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Patient ID</p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-blue-800">{patient.patientUniqueId || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start">
        <div className="flex-grow w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">Name</p>
              <p className="text-sm sm:text-base">{patient.firstName || patient.lastName ? `${patient.firstName || ""} ${patient.lastName || ""}`.trim() : "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">Number</p>
              <p className="text-sm sm:text-base">{patient.phoneNumber || "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">Email</p>
              <p className="text-sm sm:text-base">{patient.email || "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">Gender</p>
              <p className="text-sm sm:text-base">{patient.gender || "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">DOB</p>
              <p className="text-sm sm:text-base">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">Age</p>
              <p className="text-sm sm:text-base">{patient.age ? `${patient.age} Years` : "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">Blood Group</p>
              <p className="text-sm sm:text-base">{patient.bloodGroup || "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">Height (cm)</p>
              <p className="text-sm sm:text-base">{patient.height ? `${patient.height} cm` : "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">Weight (Kg)</p>
              <p className="text-sm sm:text-base">{patient.weight ? `${patient.weight} Kg` : "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">Country</p>
              <p className="text-sm sm:text-base">{patient.country || "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">State</p>
              <p className="text-sm sm:text-base">{patient.state || "N/A"}</p>
            </div>
            <div className="font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">City</p>
              <p className="text-sm sm:text-base">{patient.city || "N/A"}</p>
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 font-semibold leading-5">
              <p className="text-xs sm:text-sm text-gray-400">Address</p>
              <p className="text-sm sm:text-base">{patient.address || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
