import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MedicalHistory = ({ appointments, loading }) => {
  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg mt-3 sm:mt-4 md:mt-6">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold">Appointment History</h2>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
        <div className="flex space-x-2 sm:space-x-3 md:space-x-4 w-full max-w-full overflow-x-auto custom-scroll pb-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="min-w-[260px] sm:min-w-[280px] md:min-w-[300px] max-w-[260px] sm:max-w-[280px] md:max-w-[300px] bg-white rounded-xl shadow-md border mb-2 sm:mb-3 md:mb-4"
              >
                <div className="flex align-center justify-between bg-gray-100 px-2 sm:px-3 md:px-4 py-2 rounded-t-lg">
                  <Skeleton width={80} height={16} className="text-xs sm:text-sm" />
                  <Skeleton width={60} height={16} className="text-xs sm:text-sm" />
                </div>
                <div className="p-2 sm:p-3 md:p-4">
                  <Skeleton width="60%" height={14} className="mb-2 text-xs sm:text-sm" />
                  <Skeleton width="80%" height={14} className="text-xs sm:text-sm" />
                </div>
              </div>
            ))
          ) : appointments && appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="min-w-[260px] sm:min-w-[280px] md:min-w-[300px] max-w-[260px] sm:max-w-[280px] md:max-w-[300px] bg-white rounded-xl shadow-md border mb-2 sm:mb-3 md:mb-4"
              >
                <div className="flex align-center justify-between bg-gray-100 px-2 sm:px-3 md:px-4 py-2 rounded-t-lg">
                  <h4 className="font-semibold text-xs sm:text-sm md:text-base text-customBlue truncate max-w-[150px] sm:max-w-[180px]">
                    {appointment.doctor?.name || "N/A"}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                    {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="p-2 sm:p-3 md:p-4">
                  <p className="font-semibold text-xs sm:text-sm md:text-base">Appointment Time</p>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                    {appointment.appointmentTime || "N/A"}
                  </p>
                  <p className="font-semibold mt-2 sm:mt-3 text-xs sm:text-sm md:text-base">Status</p>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600">
                    {appointment.status || "N/A"}
                  </p>
                  <p className="font-semibold mt-2 sm:mt-3 text-xs sm:text-sm md:text-base">Hospital</p>
                  <p className="mt-1 text-xs sm:text-sm text-gray-600 truncate">
                    {appointment.hospital?.name || "N/A"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs sm:text-sm md:text-base text-gray-500 px-2 sm:px-3">No appointment history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;
