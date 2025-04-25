import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus, FaSearch, FaDollarSign } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import api from "../../api/api";
import noRecordImage from "../../assets/images/NoBill.png";
import "react-loading-skeleton/dist/skeleton.css";
import { jwtDecode } from "jwt-decode";

const MonitorBilling = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
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
        console.log("Billing data:", response.data);
        setBillingData(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setLoading(false);
      }
    };
    fetchBillingData();
  }, []);

  const filteredBillingData = billingData.filter(
    (bill) =>
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.patientName || "N/A")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (bill.diseaseName || "N/A")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (bill.status || "Unpaid").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusStyles = {
    Paid: "bg-green-100 text-green-600 px-4 py-2 rounded-full",
    Unpaid: "bg-red-100 text-red-600 px-4 py-2 rounded-full",
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold text-[#030229]">
          Monitor Billing
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
            onClick={() => navigate(`/${role}/create-bill`)}
          >
            <FaPlus className="mr-2" />
            Create Bills
          </button>
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
    </div>
  );
};

export default MonitorBilling;
