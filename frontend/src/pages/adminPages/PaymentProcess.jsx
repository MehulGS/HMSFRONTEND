import { useState, useEffect } from "react";
import { FaEye, FaDollarSign, FaEdit, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import api from "../../api/api";
import CashPaymentModal from "../../components/modals/CashPaymentModal";
import "react-loading-skeleton/dist/skeleton.css";
import { jwtDecode } from "jwt-decode";

const PaymentProcess = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [billingData, setBillingData] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [isAppointmentStatusModalOpen, setIsAppointmentStatusModalOpen] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPaymentType, setSelectedPaymentType] = useState("Cash");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedRow, setSelectedRow] = useState(null);
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await api.get("/invoices", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setBillingData(response.data.data);
      } catch (error) {
        console.error("Error fetching billing data:", error);
      }
      setLoading(false);
    };
    fetchBillingData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, statusFilter]);

  const handleOpenPaymentModal = (bill) => {
    if (bill.status === "Paid") return;
    setSelectedBill(bill);
    setStatusModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setStatusModalOpen(false);
    setSelectedBill(null);
    setSelectedPaymentType("Cash");
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      if (newStatus === "Paid") {
        await api.patch(`/invoices/status/${selectedBill.id}`, {
          status: newStatus,
          paymentType: selectedPaymentType
        });
      } else {
        await api.patch(`/invoices/status/${selectedBill.id}`, {
          status: newStatus
        });
      }

      // Update local state
      setBillingData((prevData) =>
        prevData.map((bill) =>
          bill.id === selectedBill.id 
            ? { 
                ...bill, 
                status: newStatus,
                paymentType: newStatus === "Paid" ? selectedPaymentType : bill.paymentType 
              } 
            : bill
        )
      );

      handleClosePaymentModal();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAppointmentStatusUpdate = async (newStatus) => {
    try {
      await api.patch(`/appointments/appointments/${selectedAppointment.id}`, {
        status: newStatus,
      });

      // Update local state
      setBillingData((prevData) =>
        prevData.map((bill) =>
          bill.id === selectedAppointment.id
            ? { ...bill, status: newStatus }
            : bill
        )
      );

      setIsAppointmentStatusModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const openAppointmentStatusModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentStatusModalOpen(true);
  };

  const closeAppointmentStatusModal = () => {
    setIsAppointmentStatusModalOpen(false);
    setSelectedAppointment(null);
  };

  const statusStyles = {
    Paid: "bg-green-100 text-green-600 px-4 py-2 rounded-full",
    Unpaid: "bg-red-100 text-red-600 px-4 py-2 rounded-full",
  };

  const filteredBillingData = billingData.filter((bill) => {
    const searchTermLower = searchTerm.toLowerCase().trim();

    // First apply status filter
    if (statusFilter !== "All" && (bill.status || "Unpaid") !== statusFilter) {
      return false;
    }

    // If search term is empty, return all bills that passed the status filter
    if (!searchTermLower) return true;

    // Check each field, handling null/undefined values
    const billNumber = (bill.billNumber || "").toLowerCase();
    const patientName = (bill.patientName || "").toLowerCase();
    const status = (bill.status || "Unpaid").toLowerCase();
    const phoneNumber = (bill.patientPhoneNumber || "").toLowerCase();
    const date = bill.billDate
      ? new Date(bill.billDate).toLocaleDateString()
      : "";

    // Return true if any field matches the search term
    return (
      billNumber.includes(searchTermLower) ||
      patientName.includes(searchTermLower) ||
      status.includes(searchTermLower) ||
      phoneNumber.includes(searchTermLower) ||
      date.toLowerCase().includes(searchTermLower)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedBills = filteredBillingData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBillingData.length / itemsPerPage);

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
  const handleRowClick = (billId) => {
    setSelectedRow((prev) => (prev === billId ? null : billId));
  };

  return (
    <div className="p-2 md:p-6 bg-white rounded-2xl shadow-md w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
        <h2 className="text-base md:text-xl font-semibold text-[#030229] text-center md:text-left">
          Monitor Billing
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center md:justify-start">
            {["All", "Paid", "Unpaid"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-colors border ${
                  statusFilter === status
                    ? "bg-[#0eabeb] text-white border-[#0eabeb]"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-[#f6f8fb]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          {/* Search Input */}
          <div className="flex items-center bg-[#f6f8fb] rounded-full px-3 py-2 w-full sm:w-auto">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Quick Search"
              className="bg-[#f6f8fb] focus:outline-none w-full text-xs md:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
        </div>
      </div>

      {/* Billing Table */}
      <div className="overflow-x-auto w-full">
        <table className="min-w-[600px] w-full bg-white rounded-2xl overflow-hidden text-xs md:text-sm">
          <thead className="bg-[#f6f8fb]">
            <tr>
              {[
                "Bill Number",
                "Patient Name",
                "Reciever Name",
                "Phone Number",
                "Status",
                "Date",
                "Action",
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
                  {["80", "120", "120", "100", "80", "100", "80", "60"].map(
                    (width, i) => (
                      <td key={i} className="px-2 py-3">
                        <Skeleton width={width} height={20} />
                      </td>
                    )
                  )}
                </tr>
              ))
            ) : paginatedBills.length > 0 ? (
              paginatedBills.map((bill, index) => {
                const nameofreceiver =
                  bill.status === "Unpaid"
                    ? "Not yet"
                    : bill.statusDetails?.updatedBy?.id?.firstName +
                      " " +
                      bill.statusDetails?.updatedBy?.id?.lastName;
                return (
                  <tr
                    key={bill.id}
                    className={`border-b hover:bg-gray-50 cursor-pointer transition-colors duration-100 ${
                      selectedRow === bill.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleRowClick(bill.id)}
                  >
                    <td className="px-2 py-3">
                      <span className="px-2 md:px-4 py-1 md:py-2 bg-[#f6f8fb] rounded-full font-semibold text-[#718EBF] text-xs md:text-sm">
                        {bill.billNumber || "N/A"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F] whitespace-nowrap">
                      {bill.patientName || "N/A"}
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F] whitespace-nowrap">
                      {nameofreceiver}
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F] whitespace-nowrap">
                      {bill.patientPhoneNumber || "N/A"}
                    </td>
                    <td className="px-2 py-3">
                      <span className={statusStyles[bill.status || "Unpaid"] + " text-xs md:text-sm"}>
                        {bill.status || "Unpaid"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F] whitespace-nowrap">
                      {bill.billDate
                        ? new Date(bill.billDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-2 py-3 flex flex-wrap space-x-2 ">
                      <button
                        className="text-blue-500 hover:bg-gray-100 p-2 rounded-xl"
                        onClick={(e) => { e.stopPropagation(); navigate(`/${role}/invoice/${bill.id}`); }}
                      >
                        <FaEye />
                      </button>
                      <button
                        className={`p-2 rounded-xl ${
                          bill.status === "Paid"
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-500 hover:bg-gray-100"
                        }`}
                        onClick={(e) => { e.stopPropagation(); bill.status !== "Paid" && navigate(`/${role}/payment/edit/${bill.id}`); }}
                        disabled={bill.status === "Paid"}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className={`p-2 rounded-xl ${
                          bill.status === "Paid"
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-green-500 hover:bg-gray-100"
                        }`}
                        onClick={(e) => { e.stopPropagation(); handleOpenPaymentModal(bill); }}
                        disabled={bill.status === "Paid"}
                      >
                        <FaDollarSign />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-8 md:py-16 text-gray-500">
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredBillingData.length > 0 && (
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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBillingData.length)} of {filteredBillingData.length} entries
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

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Update Payment Status
            </h3>
            <div className="space-y-4">
              {selectedBill.status !== "Paid" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Type
                  </label>
                  <select
                    value={selectedPaymentType}
                    onChange={(e) => setSelectedPaymentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0eabeb] focus:border-transparent"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                    <option value="FOC">FOC</option>
                  </select>
                </div>
              )}
              <button
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleStatusUpdate("Paid")}
                disabled={selectedBill.status === "Paid"}
              >
                Mark as Paid
              </button>

              <button
                className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={handleClosePaymentModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentProcess;
