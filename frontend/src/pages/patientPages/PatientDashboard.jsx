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
    <div className="flex flex-col h-screen p-4 bg-gray-50">
      {/* Patient Details at the top */}
      <PatientDetails
        patient={patient}
        hospital={hospital}
        isAdmin={isAdmin}
      />
      {/* Grid Layout for Medical History, Prescriptions, Test Reports, and Patient Status */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4 md:gap-6 flex-1 mt-6">
        {/* Left Column: Medical History */}
        <div className="col-span-1 md:col-span-5 flex flex-col">
          <MedicalHistory
            className="flex-1 h-full"
            patient={patient}
            diseases={patient.diseases}
          />
        </div>
        {/* Right Column: Prescriptions */}
        <div className="col-span-1 md:col-span-3 flex flex-col">
          <PrescriptionList
            className="flex-1 h-full"
            medicines={patient.medicines}
          />
        </div>
      </div>
      {/* Second row for Test Reports and Patient Status */}
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4 md:gap-6 flex-1 mt-6">
        {/* Test Reports */}
        <div className="col-span-1 md:col-span-5 flex flex-col">
          <TestReports
            className="flex-1 h-full"
            patientId={patient._id}
          />
        </div>
        {/* Patient Status */}
        <div className="col-span-1 md:col-span-3 flex flex-col mt-4 md:mt-0">
          <PatientStatus
            className="flex-1 h-full"
            patient={patient}
            hospital={hospital}
          />
        </div>
      </div>
    </div>
  );
};
export default PatientDashboard;