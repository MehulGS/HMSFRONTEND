import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaSearch, FaChevronLeft, FaChevronRight, FaTrash, FaUserPlus } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import api from "../api/api";
import noRecordImage from "../assets/images/NoBill.png";
import "react-loading-skeleton/dist/skeleton.css";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const getBmiBadgeClasses = (bmi) => {
  const value = parseFloat(bmi);
  if (!value || !isFinite(value)) {
    // Neutral badge for missing/invalid BMI
    return "bg-gray-100 text-gray-600";
  }

  // Consider BMI > 25 as high (overweight/obese) and show in red
  if (value > 25) {
    return "bg-red-100 text-red-600";
  }

  // Normal BMI keeps existing blue styling
  return "bg-blue-100 text-blue-600";
};

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get("/users/patients", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPatients(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${patient.phoneNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPatient) return;
    setIsDeleting(true);
    try {
      const response = await api.delete(`/users/patients/${selectedPatient._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        toast.success("Patient deleted successfully");
        setPatients(patients.filter((pat) => pat._id !== selectedPatient._id));
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error(error.response?.data?.message || "Error deleting patient");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedPatient(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedPatient(null);
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold text-[#030229]">
          Patient Management
        </h2>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <div className="flex items-center bg-[#f6f8fb] rounded-full px-4 py-2 w-full">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search Patient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#f6f8fb] focus:outline-none w-full"
            />
          </div>
          <Link
            to={`/${role}/add-new-patient`}
            className="bg-customBlue text-white px-4 py-2 rounded-xl flex items-center space-x-2 w-full"
          >
            <FaUserPlus className="text-white" />
            <span>Add New Patient</span>
          </Link>
        </div>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl overflow-hidden">
          <thead className="bg-[#f6f8fb]">
            <tr>
              <th className="px-2 md:px-6 py-3 text-left font-semibold text-sm md:text-base">Sr No</th>
              <th className="px-2 md:px-6 py-3 text-left font-semibold text-sm md:text-base">Patient Name</th>
              <th className="px-2 md:px-6 py-3 text-left font-semibold text-sm md:text-base">Gender</th>
              <th className="px-2 md:px-6 py-3 text-left font-semibold text-sm md:text-base">Phone Number</th>
              <th className="px-2 md:px-6 py-3 text-left font-semibold text-sm md:text-base">Age</th>
              <th className="px-2 md:px-6 py-3 text-left font-semibold text-sm md:text-base">Blood Group</th>
              <th className="px-2 md:px-6 py-3 text-left font-semibold text-sm md:text-base">BMI</th>
              <th className="px-2 md:px-6 py-3 text-center font-semibold text-sm md:text-base">Action</th>
            </tr>
          </thead>
          <tbody className="max-h-[400px] overflow-y-auto custom-scroll">
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  {["80", "120", "80", "120", "60", "80", "60", "120"].map(
                    (width, i) => (
                      <td key={i} className="px-2 py-3">
                        <Skeleton width={width} height={20} />
                      </td>
                    )
                  )}
                </tr>
              ))
            ) : paginatedPatients.length > 0 ? (
              paginatedPatients.map((patient, idx) => (
                <tr key={patient._id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-3">{patient.patientUniqueId || `#${indexOfFirstItem + idx + 1}`}</td>
                  <td className="px-2 py-3 text-[#4F4F4F]">{`${patient.firstName} ${patient.lastName}`}</td>
                  <td className="px-2 py-3">
                    <span className="bg-blue-100 text-blue-600 px-2 md:px-3 py-1 rounded-full text-sm">
                      {patient.gender}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">{patient.phoneNumber || "N/A"}</td>
                  <td className="px-2 py-3 text-[#4F4F4F]">{patient.age || "N/A"}</td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    <span className="bg-blue-100 text-blue-600 px-2 md:px-3 py-1 rounded-full text-sm">
                      {patient.bloodGroup || "N/A"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    <span
                      className={`${getBmiBadgeClasses(
                        patient.bmi
                      )} px-2 md:px-3 py-1 rounded-full text-sm`}
                    >
                      {patient.bmi || "N/A"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-xl text-center">
                    <div className="flex items-center justify-center space-x-2 md:space-x-4">
                      <Link
                        to={`/${role}/patient/${patient._id}`}
                        className="text-blue-500 hover:text-blue-600 bg-gray-100 p-1 md:p-2 rounded-xl"
                        title="View"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        to={`/${role}/edit-patient/${patient._id}`}
                        className="text-green-500 hover:text-green-600 bg-gray-100 p-1 md:p-2 rounded-xl"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(patient)}
                        className="text-red-500 hover:text-red-600 bg-gray-100 p-1 md:p-2 rounded-xl"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-8 md:py-16">
                  <div className="flex flex-col items-center">
                    <img
                      src={noRecordImage}
                      alt="No Record Found"
                      className="w-48 sm:w-96 mb-4"
                    />
                    <p className="text-gray-500">No Patient Found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredPatients.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 px-4 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0eabeb] focus:border-transparent"
            >
              {[5, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPatients.length)} of {filteredPatients.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaChevronLeft />
            </button>
            {getPageNumbers().map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2">...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === pageNum
                      ? "bg-[#0eabeb] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              )
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Patient
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this patient? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  isDeleting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
