import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import PrescriptionModal from "./PrescritionModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PrescriptionList = ({ prescriptions, loading }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const openModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPrescription(null);
  };

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg mt-3 sm:mt-4 md:mt-6">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold">Prescriptions</h2>
      </div>

      <div className="rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[340px] sm:min-w-[500px] md:min-w-0">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-2 text-xs sm:text-sm font-medium whitespace-nowrap">Date</th>
                <th className="py-2 px-2 text-xs sm:text-sm font-medium whitespace-nowrap">Doctor</th>
                <th className="py-2 px-2 text-xs sm:text-sm font-medium whitespace-nowrap">Disease</th>
                <th className="py-2 px-2 text-xs sm:text-sm font-medium whitespace-nowrap">Amount</th>
                <th className="py-2 px-2 text-xs sm:text-sm font-medium whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 sm:py-3 px-2">
                      <Skeleton width="70%" height={14} className="text-xs sm:text-sm" />
                    </td>
                    <td className="py-2 sm:py-3 px-2">
                      <Skeleton width="50%" height={14} className="text-xs sm:text-sm" />
                    </td>
                    <td className="py-2 sm:py-3 px-2">
                      <Skeleton width="40%" height={14} className="text-xs sm:text-sm" />
                    </td>
                    <td className="py-2 sm:py-3 px-2">
                      <Skeleton width="30%" height={14} className="text-xs sm:text-sm" />
                    </td>
                    <td className="py-2 sm:py-3 px-2 flex justify-center">
                      <Skeleton circle width={20} height={20} className="sm:w-6 sm:h-6" />
                    </td>
                  </tr>
                ))
              ) : prescriptions && prescriptions.length > 0 ? (
                prescriptions.map((prescription) => (
                  <tr key={prescription._id} className="border-t">
                    <td className="py-2 sm:py-3 px-2 text-xs sm:text-sm whitespace-nowrap">
                      {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-2 sm:py-3 px-2 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[150px]">
                      {prescription.doctor?.name || "N/A"}
                    </td>
                    <td className="py-2 sm:py-3 px-2 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px]">
                      {prescription.diseases?.[0]?.name || "N/A"}
                    </td>
                    <td className="py-2 sm:py-3 px-2 text-xs sm:text-sm whitespace-nowrap">
                      ₹{prescription.amount || "N/A"}
                    </td>
                    <td className="py-2 sm:py-3 px-2 text-xs sm:text-sm flex justify-center">
                      <div className="text-customBlue p-1 sm:p-1.5 md:p-2 rounded-full bg-white shadow cursor-pointer hover:bg-gray-50 transition-colors">
                        <FaEye className="text-sm sm:text-base" onClick={() => openModal(prescription)} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-3 sm:py-4 text-xs sm:text-sm md:text-base text-gray-500">
                    No prescriptions available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Modal */}
      {showModal && selectedPrescription && (
        <PrescriptionModal
          closeModal={closeModal}
          prescription={selectedPrescription}
        />
      )}
    </div>
  );
};

export default PrescriptionList;
