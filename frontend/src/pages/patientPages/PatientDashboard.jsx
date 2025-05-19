import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PatientDetails from "../../components/Patient/PatientDetails";
import PrescriptionList from "../../components/Patient/PrescriptionList";
import TestReports from "../../components/Patient/TestReports";
import PatientStatus from "../../components/Patient/PatientStatus";
import MedicalHistory from "../../components/Patient/MedicalHistory";
import api from "../../api/api";
import { jwtDecode } from "jwt-decode";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PatientDashboard = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
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
    const fetchPatientDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const patientResponse = await api.get(`/users/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatient(patientResponse.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching details:", error);
        setLoading(false);
      }
    };
    fetchPatientDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-2 sm:p-4 md:p-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <Skeleton height={30} count={6} className="mb-3 sm:mb-4" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-2 sm:p-4 md:p-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm text-center">
          <h2 className="text-lg sm:text-xl text-gray-600">Patient not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-2 sm:p-3 md:p-4 bg-gray-50">
      {/* Patient Details at the top */}
      <div className="w-full mb-3 sm:mb-4 md:mb-6">
        <PatientDetails
          patient={patient}
          hospital={patient.adminhospital}
          isAdmin={isAdmin}
        />
      </div>

      {/* Grid Layout for Medical History, Prescriptions, Test Reports, and Patient Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6 flex-1">
        {/* Left Column: Medical History */}
        <div className="lg:col-span-8 flex flex-col">
          <MedicalHistory
            className="flex-1 h-full"
            appointments={patient.recentAppointments}
            loading={loading}
          />
        </div>

        {/* Right Column: Prescriptions */}
        <div className="lg:col-span-4 flex flex-col">
          <PrescriptionList
            className="flex-1 h-full"
            prescriptions={patient.recentPrescriptions}
            loading={loading}
          />
        </div>

        {/* Patient Status - Full width on mobile, 4 columns on desktop */}
        <div className="lg:col-span-4 flex flex-col mt-3 sm:mt-4 lg:mt-0">
          <PatientStatus
            className="flex-1 h-full"
            patient={patient}
            hospital={patient.adminhospital}
            lastAppointment={patient.recentAppointments?.[0]}
            statistics={patient.statistics}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;