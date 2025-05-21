import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { FaEye, FaEdit, FaTrash, FaSearch, FaUserPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import api from "../../api/api";
import noRecordImage from "../../assets/images/Frame 1116602772.png";
import userImage from "../../assets/images/user.png";
import "react-loading-skeleton/dist/skeleton.css";
import ReceiptionistOffCanavs from "../../components/ReceiptionistOffCanavs";
import { jwtDecode } from "jwt-decode";

const ReceptionManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRows, setSelectedRows] = useState([]);
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role=decoded.role


  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/users/receptionist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDoctors(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleViewClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsOffCanvasOpen(true);
  };

  const handleCloseOffCanvas = () => {
    setIsOffCanvasOpen(false);
    setSelectedDoctor(null);
  };

  const handleDeleteClick = (doctorId) => {
    setDoctorToDelete(doctorId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDoctorToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/users/receptionist/${doctorToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDoctors(doctors.filter((doctor) => doctor._id !== doctorToDelete));
      handleCloseModal();
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.firstName} ${doctor.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // SickPage-style pagination helpers
  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pageNumbers.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pageNumbers;
  };
  const indexOfFirstItem = (currentPage - 1) * rowsPerPage;
  const indexOfLastItem = Math.min(currentPage * rowsPerPage, filteredDoctors.length);
  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) setCurrentPage(pageNum);
  };
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Row selection logic
  const isAllSelected = paginatedDoctors.length > 0 && paginatedDoctors.every((doc) => selectedRows.includes(doc._id));
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows([
        ...selectedRows,
        ...paginatedDoctors.filter((doc) => !selectedRows.includes(doc._id)).map((doc) => doc._id),
      ]);
    } else {
      setSelectedRows(selectedRows.filter((id) => !paginatedDoctors.some((doc) => doc._id === id)));
    }
  };
  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-100">
      <div className="bg-white p-4 md:p-6 rounded-xl h-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <h2 className="text-2xl font-semibold text-center md:text-left">Reception Management</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 space-x-2 w-full md:w-auto">
              <FaSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search Receptionist"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-100 focus:outline-none w-full"
              />
            </div>
            <select
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border rounded-xl px-2 py-1 text-sm"
            >
              {[5, 10, 20, 50].map(num => (
                <option key={num} value={num}>{num} / page</option>
              ))}
            </select>
            <Link
              to={`/${role}/add-new-receiptionist`}
              className="bg-customBlue text-white px-4 py-2 rounded-xl flex items-center space-x-2"
            >
              <FaUserPlus className="text-white" />
              <span>Add New Receptionist</span>
            </Link>
          </div>
        </div>

        {/* Responsive Table Wrapper with Vertical and Horizontal Scrollbar */}
        <div className="overflow-x-auto max-h-[580px] custom-scroll">
          <table className="w-full bg-white rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 sticky top-0 z-10">
                <th className="px-3 md:px-6 py-3 text-left text-gray-600 font-semibold">Receptionist Name</th>
                <th className="px-3 md:px-6 py-3 text-left text-gray-600 font-semibold">Gender</th>
                <th className="px-3 md:px-6 py-3 text-left text-gray-600 font-semibold">Qualification</th>
                <th className="px-3 md:px-6 py-3 text-left text-gray-600 font-semibold">Email</th>
                <th className="px-3 md:px-6 py-3 text-left text-gray-600 font-semibold">Phone Number</th>
                <th className="px-3 md:px-6 py-3 text-left text-gray-600 font-semibold">Emergency Number</th>
                <th className="px-3 md:px-6 py-3 text-center text-gray-600 font-semibold">Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-3 md:px-6 py-4"><Skeleton height={40} /></td>
                    <td className="px-3 md:px-6 py-4"><Skeleton height={40} /></td>
                    <td className="px-3 md:px-6 py-4"><Skeleton width={80} height={20} /></td>
                    <td className="px-3 md:px-6 py-4"><Skeleton width={80} height={20} /></td>
                    <td className="px-3 md:px-6 py-4"><Skeleton width={100} height={20} /></td>
                    <td className="px-3 md:px-6 py-4 text-center"><Skeleton width={80} height={20} /></td>
                    <td className="px-3 md:px-6 py-4 text-center"><Skeleton width={100} height={20} /></td>
                    <td className="px-3 md:px-6 py-4 text-center"><Skeleton width={120} height={40} /></td>
                  </tr>
                ))}
              </tbody>
            ) : paginatedDoctors.length > 0 ? (
              <tbody>
                {paginatedDoctors.map((doctor) => (
                  <tr key={doctor._id} className="border-b">
                    <td className="px-3 md:px-6 py-4 flex items-center space-x-3">
                      <img
                        src={doctor.profileImage ? `${doctor.profileImage}` : userImage}
                        alt="Doctor"
                        className="w-10 h-10 rounded-full"
                      />
                      <span>{`${doctor.firstName} ${doctor.lastName}`}</span>
                    </td>
                    <td className="px-3 md:px-6 py-4"><span className="bg-blue-100 text-blue-600 px-2 md:px-3 py-1 rounded-full text-sm">{doctor.gender}</span></td>
                    <td className="px-3 md:px-6 py-4">{doctor.qualification || "N/A"}</td>
                    <td className="px-3 md:px-6 py-4">{doctor.email || "N/A"}</td>
                    <td className="px-3 md:px-6 py-4">{doctor.phoneNumber || "N/A"}</td>
                    <td className="px-3 md:px-6 py-4">{doctor.receptionistDetails.emergencyContactNumber || "N/A"}</td>
                    <td className="px-3 md:px-6 py-4 text-xl text-center">
                      <div className="flex items-center justify-center space-x-2 md:space-x-4">
                        <button
                          onClick={() => handleViewClick(doctor)}
                          className="text-customBlue bg-gray-100 p-1 md:p-2 rounded-xl"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <Link
                          to={`/${role}/edit-receiptionist/${doctor._id}`}
                          className="text-green-500 hover:text-green-600 bg-gray-100 p-1 md:p-2 rounded-xl"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(doctor._id)}
                          className="text-red-500 hover:text-red-600 bg-gray-100 p-1 md:p-2 rounded-xl"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="8" className="text-center py-8 md:py-16">
                    <div className="flex flex-col items-center">
                      <img
                        src={noRecordImage}
                        alt="No Doctor Found"
                        className="w-32 md:w-48 mb-4"
                      />
                      <p className="text-gray-500">No Doctors Found</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredDoctors.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-4 px-4 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0eabeb] focus:border-transparent"
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredDoctors.length === 0 ? 0 : indexOfFirstItem + 1} to {indexOfLastItem} of {filteredDoctors.length} entries
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
                pageNum === '...'
                  ? <span key={`ellipsis-${index}`} className="px-2">...</span>
                  : <button
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
      </div>

      {/* OffCanvas Component */}
      <ReceiptionistOffCanavs
        doctor={selectedDoctor}
        isOpen={isOffCanvasOpen}
        onClose={handleCloseOffCanvas}
      />

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white rounded-xl w-80 p-6 relative shadow-lg border-t-8 border-[#e11d29]">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#e11d29] rounded-full w-16 h-16 flex items-center justify-center">
              <i className="text-white text-3xl">🗑️</i>
            </div>
            <div className="text-center mt-8">
              <h2 className="text-lg font-bold text-[#030229] mb-2">
                Delete Receiptionist Details?
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this doctor details?
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-700 px-4 py-2 rounded-xl w-full hover:bg-[#f6f8fb] border"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmDelete}
                  type="submit"
                  className="bg-[#f6f8fb] text-[#4F4F4F] px-4 py-2 rounded-xl hover:text-white hover:bg-[#0EABEB] w-full"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionManagement;
