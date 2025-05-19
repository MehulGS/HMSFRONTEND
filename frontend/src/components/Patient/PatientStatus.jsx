import React from "react";
import { FaHospital, FaUserMd, FaCalendarAlt, FaInfoCircle, FaMoneyBillWave } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PatientStatus = ({ patient, hospital, lastAppointment, statistics, loading }) => {
  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Patient Status</h2>

      {/* Grid Layout for the icons and text */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-h-[180px] sm:min-h-[210px]">
        {/* First column: Hospital Name */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex-shrink-0 bg-blue-100 p-2 sm:p-3 rounded-full">
            <FaHospital className="text-blue-600 text-lg sm:text-xl md:text-2xl" />
          </div>
          <p className="font-semibold text-blue-900 text-sm sm:text-base truncate">
            {loading ? <Skeleton width={100} /> : hospital?.name || "N/A"}
          </p>
        </div>

        {/* Second column: Doctor's Name */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex-shrink-0 bg-green-100 p-2 sm:p-3 rounded-full">
            <FaUserMd className="text-green-500 text-lg sm:text-xl md:text-2xl" />
          </div>
          <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
            {loading ? <Skeleton width={100} /> : lastAppointment?.doctor?.name || "N/A"}
          </p>
        </div>

        {/* First column: Last Appointment Date */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex-shrink-0 bg-purple-100 p-2 sm:p-3 rounded-full">
            <FaCalendarAlt className="text-purple-500 text-lg sm:text-xl md:text-2xl" />
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            {loading ? <Skeleton width={80} /> : lastAppointment?.appointmentDate ? new Date(lastAppointment.appointmentDate).toLocaleDateString() : "N/A"}
          </p>
        </div>

        {/* Second column: Total Amount */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex-shrink-0 bg-purple-100 p-2 sm:p-3 rounded-full">
            <FaMoneyBillWave className="text-purple-500 text-lg sm:text-xl md:text-2xl" />
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            {loading ? <Skeleton width={80} /> : statistics?.totalAmount ? `₹${statistics.totalAmount}` : "N/A"}
          </p>
        </div>

        {/* Full row for statistics */}
        <div className="col-span-1 sm:col-span-2 flex items-start space-x-2 sm:space-x-3">
          <div className="flex-shrink-0 bg-blue-100 p-2 sm:p-3 rounded-full">
            <FaInfoCircle className="text-blue-500 text-lg sm:text-xl md:text-2xl" />
          </div>
          <div className="text-gray-600 text-xs sm:text-sm space-y-1 sm:space-y-2">
            {loading ? (
              <Skeleton count={3} />
            ) : (
              <>
                <p>Total Appointments: {statistics?.totalAppointments || "N/A"}</p>
                <p>Total Prescriptions: {statistics?.totalPrescriptions || "N/A"}</p>
                <p>Total Invoices: {statistics?.totalInvoices || "N/A"}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientStatus;
