import React from "react";
import logo from "../../assets/images/logo.png";
import signature from "../../assets/images/signature.svg";

const PrescriptionModal = ({ prescription, closeModal }) => {
  if (!prescription) return null;

  const { doctor, medicines, diseases, createdAt, amount } = prescription;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow-lg w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Prescription</h2>
          <button 
            onClick={closeModal} 
            className="bg-red-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm hover:bg-red-600 transition-colors"
          >
            X
          </button>
        </div>

        {/* Header */}
        <div className="p-2 sm:p-3 md:p-4 bg-gray-50 rounded-xl mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="py-1 sm:py-2">
              <img src={logo} alt="Hospital Logo" className="w-32 sm:w-40 md:w-48 mx-auto mb-2 sm:mb-4" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-customBlue text-center sm:text-left">
                Dr. {doctor.name}
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:gap-4 text-xs sm:text-sm mb-2 sm:mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <p className="flex items-center">
                <strong>Prescription Date:</strong>
                <span className="ml-2 text-gray-600">
                  {new Date(createdAt).toLocaleDateString()}
                </span>
              </p>
              <p className="flex items-center">
                <strong>Amount:</strong>
                <span className="ml-2 text-gray-600">₹{amount}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Diseases */}
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold mb-2">Diagnosed Diseases</h3>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {diseases.map((disease, index) => (
              <span key={index} className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {disease.name}
              </span>
            ))}
          </div>
        </div>

        {/* Prescription Details */}
        <div className="overflow-x-auto mb-3 sm:mb-4 rounded-xl">
          <table className="w-full text-left rounded-xl min-w-[600px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-2 sm:px-4 text-xs sm:text-sm">Medicine Name</th>
                <th className="py-2 px-2 sm:px-4 text-xs sm:text-sm">Dose</th>
                <th className="py-2 px-2 sm:px-4 text-xs sm:text-sm">Duration</th>
                <th className="py-2 px-2 sm:px-4 text-xs sm:text-sm">When to Take</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med, index) => (
                <tr key={index} className="border-b-2">
                  <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">{med.name}</td>
                  <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">{med.dose}</td>
                  <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    <span className="bg-green-100 text-green-700 px-2 sm:px-4 py-1 rounded-full inline-block text-xs sm:text-sm">
                      {med.duration} days
                    </span>
                  </td>
                  <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">
                    <span className="bg-blue-100 text-blue-600 px-2 sm:px-3 py-1 rounded-full inline-block text-xs sm:text-sm">
                      {med.whenToTake}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Doctor Signature */}
        <div className="flex justify-end">
          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm italic">Doctor Signature</p>
            <img src={signature} alt="Doctor Signature" className="mt-1 sm:mt-2 w-16 h-16 sm:w-20 sm:h-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;
