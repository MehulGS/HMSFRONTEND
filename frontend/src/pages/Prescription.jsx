import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaPlus,
  FaSearch,
  FaFileInvoiceDollar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Skeleton from "react-loading-skeleton";

import noRecordImage from "../assets/images/NoBill.png";
import "react-loading-skeleton/dist/skeleton.css";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";

const Prescription = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrescriptionData = async () => {
      try {
        const response = await api.get("/prescription", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPrescriptionData(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        setLoading(false);
      }
    };
    fetchPrescriptionData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const filteredPrescriptionData = prescriptionData.filter((item) => {
    const prescription = item.prescription;
    return (
      (prescription.patientDetails?.firstName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (prescription.patientDetails?.lastName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (prescription.status || "active")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedPrescriptions = filteredPrescriptionData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPrescriptionData.length / itemsPerPage);

  // Pagination controls
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      return [...Array(totalPages)].map((_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  // Row selection (highlight)
  const handleRowClick = (prescriptionId) => {
    setSelectedRow((prev) => (prev === prescriptionId ? null : prescriptionId));
  };

  const statusStyles = {
    active: "bg-green-100 text-green-600 px-4 py-2 rounded-full",
    completed: "bg-blue-100 text-blue-600 px-4 py-2 rounded-full",
    cancelled: "bg-red-100 text-red-600 px-4 py-2 rounded-full",
  };

  return (
    <div className="p-2 md:p-6 bg-white rounded-2xl shadow-md w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
        <h2 className="text-base md:text-xl font-semibold text-[#030229] text-center md:text-left">
          Prescriptions
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="flex items-center bg-[#f6f8fb] rounded-full px-3 py-2 w-full sm:w-auto">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Quick Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#f6f8fb] focus:outline-none w-full text-xs md:text-sm"
            />
          </div>
          {role === "doctor" && (
            <div>
              <button
                className="w-full text-sm bg-[#0eabeb] text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center hover:bg-[#0099cc]"
                onClick={() => navigate(`/${role}/create-prescription`)}
              >
                <FaPlus className="mr-2" />
                Create Prescription
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Table */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-[600px] w-full bg-white rounded-2xl overflow-hidden text-xs md:text-sm">
          <thead className="bg-[#f6f8fb]">
            <tr>
              {[
                "Patient Name",
                "Doctor Name",
                "Medicines",
                "Amount",
                "Status",
                "Date",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-2 md:px-6 py-3 text-left font-semibold whitespace-nowrap"
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
                  {["120", "120", "100", "80", "80", "80", "100"].map(
                    (width, i) => (
                      <td key={i} className="px-2 py-3">
                        <Skeleton width={width} height={20} />
                      </td>
                    )
                  )}
                </tr>
              ))
            ) : paginatedPrescriptions.length > 0 ? (
              paginatedPrescriptions.map((item, index) => {
                const prescription = item.prescription;
                const invoice = item.invoice;
                return (
                  <tr
                    key={prescription._id}
                    className={`border-b hover:bg-gray-50 cursor-pointer transition-colors duration-100 ${
                      selectedRow === prescription._id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleRowClick(prescription._id)}
                  >
                    <td className="px-2 py-3">
                      <span className="px-2 md:px-4 py-1 md:py-2 bg-[#f6f8fb] rounded-full font-semibold text-[#718EBF] text-xs md:text-sm">
                        {prescription.patientDetails?.firstName}{" "}
                        {prescription.patientDetails?.lastName}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F] whitespace-nowrap">
                      Dr. {prescription.doctorDetails?.firstName}{" "}
                      {prescription.doctorDetails?.lastName}
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F] whitespace-nowrap">
                      {prescription.medicines?.length || 0} medicines
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F] whitespace-nowrap">
                      ₹{prescription.amount || 0}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={
                          statusStyles[
                            prescription.status?.toLowerCase() || "active"
                          ]
                        }
                      >
                        {prescription.status || "Active"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F] whitespace-nowrap">
                      {prescription.createdAt
                        ? new Date(prescription.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-2 py-3 flex flex-wrap space-x-2">
                      <button
                        className="text-blue-500 hover:bg-gray-100 p-2 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/${role}/prescription/${prescription._id}`);
                        }}
                        title="View Prescription"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-8 md:py-16">
                  <div className="flex flex-col items-center">
                    <img
                      src={noRecordImage}
                      alt="No Record Found"
                      className="w-32 md:w-48 mb-4"
                    />
                    <p className="text-gray-500 text-xs md:text-base">
                      No prescriptions found
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredPrescriptionData.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 px-2 md:px-4 space-y-3 md:space-y-0 w-full">
          <div className="flex items-center space-x-2">
            <span className="text-xs md:text-sm text-gray-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#0eabeb] focus:border-transparent"
            >
              {[5, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-xs md:text-sm text-gray-600">entries</span>
          </div>
          <div className="text-xs md:text-sm text-gray-600 text-center">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredPrescriptionData.length)} of{" "}
            {filteredPrescriptionData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaChevronLeft />
            </button>
            {getPageNumbers().map((pageNum, index) =>
              pageNum === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2">
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm ${
                    currentPage === pageNum
                      ? "bg-[#0eabeb] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
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
    </div>
  );
};

export default Prescription;
