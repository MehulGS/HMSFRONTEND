import React from "react";
import { Link } from "react-router-dom";

const AppointmentCard = ({ patientName, doctorName, diseaseName, appointmentTime, appointmentType, id, userRole, status }) => {
  const CardContent = () => (
    <>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-black">{patientName}</h3>
        <div className="flex gap-2">
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              appointmentType === "Onsite" ? "bg-blue-100 text-blue-600" : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {appointmentType}
          </span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              status === "Done" 
                ? "bg-green-100 text-green-600" 
                : status === "Pending"
                ? "bg-orange-100 text-orange-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1">
        <span className="font-medium">Doctor Name:</span> {doctorName}
      </p>
      <p className="text-sm text-gray-500">
        <span className="font-medium">Appointment Time:</span> {appointmentTime}
      </p>
    </>
  );

  if (userRole === "doctor") {
    if (status === "Done") {
      return (
        <div className="block bg-white border rounded-xl shadow-md p-4 min-w-[250px] max-w-[250px] opacity-75 cursor-not-allowed">
          <CardContent />
        </div>
      );
    }

    // For both Pending and other non-Done statuses, make it clickable
    return (
      <Link
        to={`/doctor/create-prescription/${id}`}
        className={`block bg-white border rounded-xl shadow-md p-4 min-w-[250px] max-w-[250px] ${
          status === "Pending" 
            ? "hover:shadow-lg transition-shadow duration-300 border-orange-200" 
            : "hover:shadow-lg transition-shadow duration-300"
        }`}
      >
        <CardContent />
      </Link>
    );
  }

  // For patient view, make Pending appointments clickable
  if (userRole === "patient" && status === "Pending") {
    return (
      <Link
        to={`/patient/appointment/${id}`}
        className="block bg-white border rounded-xl shadow-md p-4 min-w-[250px] max-w-[250px] hover:shadow-lg transition-shadow duration-300 border-orange-200"
      >
        <CardContent />
      </Link>
    );
  }

  return (
    <div className="bg-white border rounded-xl shadow-md p-4 min-w-[250px] max-w-[250px]">
      <CardContent />
    </div>
  );
};

export default AppointmentCard;
