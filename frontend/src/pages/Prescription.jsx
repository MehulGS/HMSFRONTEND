import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPlus, FaSearch, FaFileInvoiceDollar } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";

import noRecordImage from "../assets/images/NoBill.png";
import "react-loading-skeleton/dist/skeleton.css";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";

const Prescription = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const filteredPrescriptionData = prescriptionData.filter(
    (item) => {
      const prescription = item.prescription;
      return (
        (prescription.patientDetails?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.patientDetails?.lastName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.diseaseDetails?.[0]?.name || "N/A").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prescription.status || "active").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  const statusStyles = {
    active: "bg-green-100 text-green-600 px-4 py-2 rounded-full",
    completed: "bg-blue-100 text-blue-600 px-4 py-2 rounded-full",
    cancelled: "bg-red-100 text-red-600 px-4 py-2 rounded-full",
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold text-[#030229]">
          Prescriptions
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
        </div>
      </div>

      {/* Prescription Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-2xl overflow-hidden">
          <thead className="bg-[#f6f8fb]">
            <tr>
              {[
                "Patient Name",
                "Disease",
                "Doctor Name",
                "Hospital",
                "Medicines",
                "Amount",
                "Status",
                "Date",
                "Actions",
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
                  {["120", "120", "120", "120", "100", "80", "80", "80", "100"].map(
                    (width, i) => (
                      <td key={i} className="px-2 py-3">
                        <Skeleton width={width} height={20} />
                      </td>
                    )
                  )}
                </tr>
              ))
            ) : filteredPrescriptionData.length > 0 ? (
              filteredPrescriptionData.map((item, index) => {
                const prescription = item.prescription;
                const invoice = item.invoice;
                return (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-3">
                      <span className="px-2 md:px-4 py-1 md:py-2 bg-[#f6f8fb] rounded-full font-semibold text-[#718EBF]">
                        {prescription.patientDetails?.firstName} {prescription.patientDetails?.lastName}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F]">
                      {prescription.diseaseDetails?.[0]?.name || "N/A"}
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F]">
                      Dr. {prescription.doctorDetails?.firstName} {prescription.doctorDetails?.lastName}
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F]">
                      {prescription.hospitalDetails?.name || "N/A"}
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F]">
                      {prescription.medicines?.length || 0} medicines
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F]">
                      ₹{prescription.amount || 0}
                    </td>
                    <td className="px-2 py-3">
                      <span className={statusStyles[prescription.status?.toLowerCase() || "active"]}>
                        {prescription.status || "Active"}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-[#4F4F4F]">
                      {prescription.createdAt
                        ? new Date(prescription.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-2 py-3 flex flex-wrap space-x-2">
                      <button
                        className="text-blue-500 hover:bg-gray-100 p-2 rounded-xl"
                         onClick={() => navigate(`/${role}/invoice/${invoice._id}`)}
                        title="View Prescription"
                      >
                        <FaEye />
                      </button>
                      {/* {invoice && (
                        <button
                          className="text-green-500 hover:bg-gray-100 p-2 rounded-xl"
                          onClick={() => navigate(`/${role}/invoice/${invoice._id}`)}
                          title="View Invoice"
                        >
                          <FaFileInvoiceDollar />
                        </button>
                      )} */}
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
                      className="w-48 sm:w-96 mb-4"
                    />
                    <p className="text-gray-500">No prescriptions found</p>
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

export default Prescription;
