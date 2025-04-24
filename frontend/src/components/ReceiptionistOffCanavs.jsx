import React from "react";
import { AiOutlineLeft } from "react-icons/ai";
import mask from "../assets/images/offcanvas.png";
import userImage from "../assets/images/user.png";

const ReceiptionistOffCanavs = ({ doctor, isOpen, onClose }) => {
  if (!isOpen || !doctor) return null;

  const hospital = doctor?.doctorDetails?.hospital || {};
  const workingHours = doctor?.doctorDetails?.workingHours || {};

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50">
      <div className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 h-full bg-white p-4 overflow-y-auto rounded-l-xl shadow-xl custom-scroll">
        {/* Close Button */}
        <div className="flex items-center justify-between p-2 sm:p-4">
          <button
            onClick={onClose}
            className="mb-4 flex items-center text-gray-500 hover:text-gray-700"
          >
            <AiOutlineLeft className="mr-2" />
            Close
          </button>
          <h2 className="text-lg sm:text-xl font-semibold">
            Receiptionist Management
          </h2>
        </div>

        {/* Banner */}
        <div>
          <div className="relative p-4 bg-gradient-to-br from-[#4C49ED] to-[#020067] rounded-xl shadow-lg mb-6">
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <img
                src={doctor.profileImage || userImage}
                alt="Doctor"
                className="w-16 h-16 rounded-full mb-2 sm:mb-0 sm:mr-4"
              />
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-white pb-2">
                  {doctor.firstName} {doctor.lastName}
                </h3>
                <div className="flex gap-4">
                  <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-xs sm:text-sm">
                    {doctor.gender}
                  </span>
                  <span className="bg-green-100 text-green-500 px-4 py-1 rounded-full text-xs sm:text-sm">
                    {doctor.role}
                  </span>
                </div>
              </div>
            </div>
            <img
              src={mask}
              alt="Background"
              className="absolute top-0 right-0 h-full opacity-25 z-0"
            />
          </div>
        </div>

        {/* Doctor Info Section */}
        <div className="bg-gray-50 p-4 mt-6 rounded-xl text-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info
              label="Qualification"
              value={doctor.qualification}
            />
          </div>

          <div className="mt-4">
            <strong className="text-gray-500">Signature:</strong>
            {doctor.signatureImage ? (
              <img
                src={doctor.signatureImage}
                alt="Doctor Signature"
                className="w-full h-24 object-contain bg-white rounded border mt-2"
              />
            ) : (
              <p className="text-sm text-gray-400 mt-2">
                No signature uploaded
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Info label="Email" value={doctor.email} />
            <Info label="Phone" value={doctor.phoneNumber} />
            <Info label="Emergency Number" value={doctor.receptionistDetails.emergencyContactNumber} />
            <Info label="Country" value={doctor.country} />
            <Info label="State" value={doctor.state} />
            <Info label="City" value={doctor.city} />
            <Info label="ZipCode" value={doctor.zipCode} />
            <Info label="Address" value={doctor.address} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable info field
const Info = ({ label, value }) => (
  <p>
    <strong className="text-gray-500">{label}:</strong>
    <span className="block text-sm sm:text-base">{value || "N/A"}</span>
  </p>
);

export default ReceiptionistOffCanavs;
