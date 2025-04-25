import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaPrint } from "react-icons/fa";
import api from "../../api/api";

const Invoice = () => {
  const {billId} = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(billId);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await api.get(`/invoices/${billId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setInvoiceData(response.data.invoice);
        console.log(invoiceData);
        console.log("Invoice data:", response.data.invoice);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceData();
  }, [billId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print Button - Will not show in print */}
      <div className="print:hidden mb-4 flex justify-end max-w-3xl mx-auto px-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#0eabeb] text-white px-4 py-2 rounded-xl hover:bg-[#0c97cc] transition-colors"
        >
          <FaPrint />
          <span>Print Invoice</span>
        </button>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-2xl max-w-3xl mx-auto shadow-md border border-gray-200 overflow-hidden print:shadow-none print:border-none">
        {/* Header */}
        <div className="relative overflow-hidden mb-6">
          <div
            className="absolute top-0 left-0 bg-[#87d5f5] p-2 w-5/12 h-4"
            style={{
              clipPath: "polygon(0 0, 90% 0, 85% 100%, 0% 100%)",
            }}
          ></div>
          <div className="absolute top-[-150px] right-[-20px] w-72 h-72 bg-[#e7f7fd] rounded-full bg-opacity-50"></div>
          <div className="flex justify-between items-center mt-12 px-6">
            <div className="flex flex-col">
              {loading ? (
                <Skeleton height={50} width={200} />
              ) : (
                <div>
                  <h2 className="text-xl font-bold">{invoiceData?.hospital?.name || "Hospital Name"}</h2>
                  <p className="text-sm text-gray-600">{invoiceData?.hospital?.address || "Hospital Address"}</p>
                  <p className="text-sm text-gray-600">Phone: {invoiceData?.hospital?.phone}</p>
                  <p className="text-sm text-gray-600">Email: {invoiceData?.hospital?.email}</p>
                  {invoiceData?.hospital?.logoUrl && (
                    <img 
                      src={invoiceData?.hospital?.logoUrl} 
                      alt="Hospital Logo" 
                      className="h-12 w-auto mt-2"
                    />
                  )}
                </div>
              )}
            </div>
            <h1 className="absolute right-[25px] top-[20px] text-6xl font-semibold text-[#0eabeb] z-10">
              {loading ? <Skeleton width={150} /> : "Invoice"}
            </h1>
          </div>
        </div>

        <div className="px-8">
          {/* Doctor Details */}
          <div className="flex justify-between mb-3 px-5">
            <div className="w-2/3">
              <div className="flex items-center gap-4">
                {invoiceData?.doctor?.profileImage && (
                  <img 
                    src={invoiceData?.doctor?.profileImage} 
                    alt="Doctor" 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="font-semibold text-lg text-gray-700">
                    {loading ? (
                      <Skeleton width={120} />
                    ) : (
                      `Dr. ${invoiceData?.doctor?.firstName} ${invoiceData?.doctor?.lastName}`
                    )}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {loading ? (
                      <Skeleton width={150} />
                    ) : (
                      <>
                        <span className="font-medium">{invoiceData?.doctor?.doctorDetails?.specialtyType}</span>
                        <span className="mx-2">•</span>
                        <span>{invoiceData?.doctor?.doctorDetails?.experience} years experience</span>
                        <span className="mx-2">•</span>
                        <span>{invoiceData?.doctor?.doctorDetails?.workType}</span>
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {loading ? (
                      <Skeleton width={150} />
                    ) : (
                      `Working Hours: ${invoiceData?.doctor?.doctorDetails?.workingHours?.workingTime}`
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {invoiceData?.doctor?.email}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2">
                <strong>Bill No:</strong>{" "}
                <span className="text-blue-600 font-medium">{loading ? <Skeleton width={100} /> : invoiceData?.billNumber}</span>
              </p>
              <p className="mb-2">
                <strong>Date:</strong>{" "}
                {loading ? <Skeleton width={100} /> : formatDate(invoiceData?.billDate)}
              </p>
              <p className="mb-2">
                <strong>Time:</strong>{" "}
                {loading ? <Skeleton width={100} /> : invoiceData?.billTime}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`${
                  invoiceData?.status === "Unpaid" ? "text-red-500" : "text-green-500"
                } font-medium`}>
                  {loading ? <Skeleton width={100} /> : invoiceData?.status}
                </span>
              </p>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-gray-100 p-4 rounded-xl mb-6 px-5">
            <h3 className="font-semibold mb-3">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Name:</strong>{" "}
                {loading ? (
                  <Skeleton width={120} />
                ) : (
                  `${invoiceData?.patient?.firstName} ${invoiceData?.patient?.lastName}`
                )}
              </p>
              <p>
                <strong>Age:</strong>{" "}
                {loading ? <Skeleton width={80} /> : `${invoiceData?.patient?.age} Years`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <p>
                <strong>Gender:</strong>{" "}
                {loading ? <Skeleton width={120} /> : invoiceData?.patient?.gender}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {loading ? <Skeleton width={120} /> : invoiceData?.patient?.phoneNumber}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <p>
                <strong>Email:</strong>{" "}
                {loading ? <Skeleton width={150} /> : invoiceData?.patient?.email}
              </p>
              <p>
                <strong>Payment Type:</strong>{" "}
                <span className="text-blue-500 font-medium">
                  {loading ? <Skeleton width={100} /> : invoiceData?.paymentType}
                </span>
              </p>
            </div>
            <div className="mt-2">
              <p>
                <strong>Address:</strong>{" "}
                {loading ? <Skeleton width={200} /> : invoiceData?.patient?.address}
              </p>
            </div>
          </div>

          {/* Disease and Description */}
          <div className="bg-gray-100 p-4 rounded-xl mb-6 px-5">
            <p>
              <strong>Disease:</strong>{" "}
              {loading ? <Skeleton width={120} /> : invoiceData?.diseaseName}
            </p>
          </div>

          {/* Description */}
          <div className="mb-6 px-5">
            <p className="text-gray-700">
              <strong>Description:</strong>{" "}
              {loading ? <Skeleton width={200} /> : invoiceData?.description}
            </p>
          </div>

          {/* Medicines Table - Ensure table doesn't break across pages */}
          <div className="mb-6 print:break-inside-avoid">
            <h3 className="font-semibold mb-2">Prescribed Medicines</h3>
            <table className="w-full bg-white rounded-xl overflow-hidden">
              <thead className="bg-[#0EABEB] text-white text-left">
                <tr>
                  <th className="px-4 py-2">Medicine Name</th>
                  <th className="px-4 py-2">Dose</th>
                  <th className="px-4 py-2">Duration</th>
                  <th className="px-4 py-2">When to Take</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-2">
                      <Skeleton count={3} />
                    </td>
                  </tr>
                ) : (
                  invoiceData?.medicines?.map((medicine, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{medicine.medicineId.name}</td>
                      <td className="px-4 py-2">{medicine.dose}</td>
                      <td className="px-4 py-2">{medicine.duration}</td>
                      <td className="px-4 py-2">{medicine.whenToTake}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Amount Details - Keep together */}
          <div className="flex justify-end px-4 print:break-inside-avoid">
            <div className="text-right w-64">
              <div className="border-b pb-2 mb-2">
                <p className="flex justify-between mb-2">
                  <span>Amount:</span>
                  <span>{loading ? <Skeleton width={80} /> : `₹ ${invoiceData?.amount?.toFixed(2)}`}</span>
                </p>
                <p className="flex justify-between mb-2">
                  <span>Discount:</span>
                  <span>{loading ? <Skeleton width={80} /> : `${invoiceData?.discount}%`}</span>
                </p>
                <p className="flex justify-between">
                  <span>Tax:</span>
                  <span>{loading ? <Skeleton width={80} /> : `${invoiceData?.tax}%`}</span>
                </p>
              </div>
              <p className="flex justify-between font-semibold text-[#0EABEB] text-xl">
                <span>Total:</span>
                <span>{loading ? <Skeleton width={100} /> : `₹ ${invoiceData?.totalAmount?.toFixed(2)}`}</span>
              </p>
            </div>
          </div>

          {/* Other Information */}
          <div className="mt-6 px-4 mb-4 print:break-inside-avoid">
            {invoiceData?.otherText && (
              <p className="text-sm text-gray-600 mb-2">
                <strong>Notes:</strong> {loading ? <Skeleton width={200} /> : invoiceData?.otherText}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <strong>Created:</strong>{" "}
              {loading ? (
                <Skeleton width={150} />
              ) : (
                formatDate(invoiceData?.createdAt)
              )}
            </p>
          </div>

          {/* Signature Section */}
          <div className="mt-8 px-4 mb-6 flex justify-between items-end print:break-inside-avoid">
            <div className="text-center">
              <div className="border-b border-gray-400 pb-1 mb-1 w-48">
                {loading ? (
                  <Skeleton width={100} height={40} />
                ) : (
                  <img 
                    src={invoiceData?.doctor?.profileImage} 
                    alt="Doctor Signature"
                    className="h-10 w-auto mx-auto"
                  />
                )}
              </div>
              <p className="text-sm font-medium">
                {loading ? (
                  <Skeleton width={100} />
                ) : (
                  `Dr. ${invoiceData?.doctor?.firstName} ${invoiceData?.doctor?.lastName}`
                )}
              </p>
              <p className="text-xs text-gray-600">
                {loading ? (
                  <Skeleton width={80} />
                ) : (
                  invoiceData?.doctor?.doctorDetails?.specialtyType
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-400 pb-1 mb-1 w-48">
                {loading ? (
                  <Skeleton width={100} height={40} />
                ) : (
                  <div className="h-10 w-full" /> // Space for hospital stamp
                )}
              </div>
              <p className="text-sm font-medium">Hospital Stamp</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm bg-[#0EABEB] p-2 rounded-b-lg text-white flex justify-between px-8 mt-4 print:bg-white print:text-gray-600 print:border-t print:border-gray-200">
          <p>Contact: {loading ? <Skeleton width={100} /> : invoiceData?.patient?.phoneNumber}</p>
          <p>Email: {loading ? <Skeleton width={150} /> : invoiceData?.patient?.email}</p>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>
        {`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
            .print\\:break-inside-avoid {
              break-inside: avoid;
            }
          }
        `}
      </style>
    </>
  );
};

export default Invoice;
