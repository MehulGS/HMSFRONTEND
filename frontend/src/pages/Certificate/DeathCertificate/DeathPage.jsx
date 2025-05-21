import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaTrash } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import api from "../../../api/api";
import noRecordImage from "../../../assets/images/NoBill.png";
import "react-loading-skeleton/dist/skeleton.css";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const DeathPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;
  const navigate = useNavigate();

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await api.get("/certificate", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // Filter only Death type certificates
        const deathCertificates = response.data.data.filter(
          cert => cert.type === "Death"
        );
        setCertificates(deathCertificates);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching certificates:", error);
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cert.patientName || "N/A")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (cert.diseaseName || "N/A")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (cert.status || "Active").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCertificates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);

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

  const statusStyles = {
    Active: "bg-green-100 text-green-600 px-4 py-2 rounded-full",
    Expired: "bg-red-100 text-red-600 px-4 py-2 rounded-full",
    Revoked: "bg-yellow-100 text-yellow-600 px-4 py-2 rounded-full",
  };

  const handleDeleteClick = (certificate) => {
    setSelectedCertificate(certificate);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCertificate) return;
    
    setIsDeleting(true);
    try {
      const response = await api.delete(`/certificate/${selectedCertificate._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.status === 200) {
        toast.success("Certificate deleted successfully");
        // Remove the deleted certificate from the list
        setCertificates(certificates.filter(cert => cert._id !== selectedCertificate._id));
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error(error.response?.data?.message || "Error deleting certificate");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setSelectedCertificate(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedCertificate(null);
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold text-[#030229]">
          Death Certificate
        </h2>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <div className="flex items-center bg-[#f6f8fb] rounded-full px-4 py-2 w-full md:max-w-lg">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Quick Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#f6f8fb] focus:outline-none w-full"
            />
          </div>
          <button
            className="w-full text-sm bg-[#0eabeb] text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center hover:bg-[#0099cc]"
            onClick={() => navigate(`/${role}/create-deathcertificate`)}
          >
            <FaPlus className="mr-2" />
            Create Death Certificate
          </button>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl overflow-hidden">
          <thead className="bg-[#f6f8fb]">
            <tr>
              {[
                "Certificate Number",
                "Patient Name",
                "Doctor Name",
                "Disease Name",
                "Duration",
                "Status",
                "Created Date",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  className="px-2 md:px-6 py-3 text-left font-semibold text-sm md:text-base"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="max-h-[400px] overflow-y-auto custom-scroll">
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  {["80", "120", "120", "120", "80", "100", "80", "60"].map(
                    (width, i) => (
                      <td key={i} className="px-2 py-3">
                        <Skeleton width={width} height={20} />
                      </td>
                    )
                  )}
                </tr>
              ))
            ) : currentItems.length > 0 ? (
              currentItems.map((certificate) => (
                <tr key={certificate._id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-3">
                    <span className="px-2 md:px-4 py-1 md:py-2 bg-[#f6f8fb] rounded-full font-semibold text-[#718EBF]">
                      {certificate.certificateNumber || "N/A"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    {certificate.patientName || "N/A"}
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    {certificate.doctorName || "N/A"}
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    {certificate.diseaseName || "N/A"}
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    {certificate.duration || "N/A"}
                  </td>
                  <td className="px-2 py-3">
                    <span className={statusStyles[certificate.status || "Active"]}>
                      {certificate.status || "Active"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    {certificate.createdAt
                      ? new Date(certificate.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-500 hover:bg-gray-100 p-2 rounded-xl"
                        onClick={() => navigate(`/${role}/deathcertificate/${certificate._id}`)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="text-red-500 hover:bg-gray-100 p-2 rounded-xl"
                        onClick={() => handleDeleteClick(certificate)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 md:py-16">
                  <div className="flex flex-col items-center">
                    <img
                      src={noRecordImage}
                      alt="No Record Found"
                      className="w-48 sm:w-96 mb-4"
                    />
                    <p className="text-gray-500">No records found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredCertificates.length > 0 && (
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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCertificates.length)} of {filteredCertificates.length} entries
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
              Delete Certificate
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this certificate? This action cannot be undone.
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

export default DeathPage;
