import { useState, useEffect } from "react";
import { FaEye, FaDollarSign, FaEdit, FaSearch } from "react-icons/fa";
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

  const handleOpenPaymentModal = (bill) => {
    if (bill.status === "Paid") return;
    setSelectedBill(bill);
    setStatusModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setStatusModalOpen(false);
    setSelectedBill(null);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.patch(`/invoices/status/${selectedBill.id}`, {
        status: newStatus,
      });

      // Update local state
      setBillingData((prevData) =>
        prevData.map((bill) =>
          bill.id === selectedBill.id ? { ...bill, status: newStatus } : bill
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
    const diseaseName = (bill.diseaseName || "").toLowerCase();
    const status = (bill.status || "Unpaid").toLowerCase();
    const phoneNumber = (bill.patientPhoneNumber || "").toLowerCase();
    const date = bill.billDate
      ? new Date(bill.billDate).toLocaleDateString()
      : "";
    const time = (bill.billTime || "").toLowerCase();

    // Return true if any field matches the search term
    return (
      billNumber.includes(searchTermLower) ||
      patientName.includes(searchTermLower) ||
      diseaseName.includes(searchTermLower) ||
      status.includes(searchTermLower) ||
      phoneNumber.includes(searchTermLower) ||
      date.toLowerCase().includes(searchTermLower) ||
      time.includes(searchTermLower)
    );
  });

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold text-[#030229]">
          Monitor Billing
        </h2>
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:max-w-lg">
          {/* Status Filter Buttons */}
          <div className="flex space-x-2 w-full md:w-auto">
            {["All", "Paid", "Unpaid"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-[#0eabeb] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          {/* Search Input */}
          <div className="flex items-center bg-[#f6f8fb] rounded-full px-4 py-2 w-full">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Quick Search"
              className="bg-[#f6f8fb] focus:outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Billing Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl overflow-hidden">
          <thead className="bg-[#f6f8fb]">
            <tr>
              {[
                "Bill Number",
                "Patient Name",
                "Disease Name",
                "Phone Number",
                "Status",
                "Date",
                "Time",
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
                  {["80", "120", "120", "100", "80", "100", "80", "60"].map(
                    (width, i) => (
                      <td key={i} className="px-2 py-3">
                        <Skeleton width={width} height={20} />
                      </td>
                    )
                  )}
                </tr>
              ))
            ) : filteredBillingData.length > 0 ? (
              filteredBillingData.map((bill, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-3">
                    <span className="px-2 md:px-4 py-1 md:py-2 bg-[#f6f8fb] rounded-full font-semibold text-[#718EBF]">
                      {bill.billNumber || "N/A"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    {bill.patientName || "N/A"}
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    {bill.diseaseName || "N/A"}
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    {bill.patientPhoneNumber || "N/A"}
                  </td>
                  <td className="px-2 py-3">
                    <span className={statusStyles[bill.status || "Unpaid"]}>
                      {bill.status || "Unpaid"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    {bill.billDate
                      ? new Date(bill.billDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-2 py-3 text-[#4F4F4F]">
                    {bill.billTime || "N/A"}
                  </td>
                  <td className="px-2 py-3 flex flex-wrap space-x-2">
                    <button
                      className="text-blue-500 hover:bg-gray-100 p-2 rounded-xl"
                      onClick={() => navigate(`/${role}/invoice/${bill.id}`)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="text-blue-500 hover:bg-gray-100 p-2 rounded-xl"
                      onClick={() =>
                        navigate(`/${role}/payment/edit/${bill.id}`)
                      }
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`p-2 rounded-xl ${
                        bill.status === "Paid"
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-green-500 hover:bg-gray-100"
                      }`}
                      onClick={() => handleOpenPaymentModal(bill)}
                      disabled={bill.status === "Paid"}
                    >
                      <FaDollarSign />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-8 md:py-16 text-gray-500"
                >
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Update Payment Status
            </h3>
            <div className="space-y-4">
              <button
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={() => handleStatusUpdate("Paid")}
              >
                Mark as Paid
              </button>
              <button
                className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={() => handleStatusUpdate("Unpaid")}
              >
                Mark as Unpaid
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
