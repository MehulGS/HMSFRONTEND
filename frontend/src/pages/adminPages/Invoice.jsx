import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaPrint } from "react-icons/fa";
import api from "../../api/api";
import letterhead from "../../assets/images/letterhead.png";

const Invoice = () => {
  const { billId } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log(billId);

  // Split medicines for pagination (first 3, rest)
  const medicines = invoiceData?.medicines || [];
  const firstPageMedicines = medicines.slice(0, 3);
  const restMedicines = medicines.slice(3);
  const medicinesCount = medicines.length;

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
    //eslint-disable-next-line
  }, [billId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrint = () => {
    const printContents = document.getElementById("printableArea").innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // reload page to restore React DOM
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
      <div
        id="printableArea"
        className="bg-white print:bg-white text-black print:text-black rounded-2xl w-full max-w-3xl mx-auto shadow-md border border-gray-200 print:shadow-none print:border-none flex flex-col items-center"
      >
        {/* If only 1 medicine, show everything in one page, no A4/page-break wrappers */}
        {medicinesCount === 1 ? (
          <div className="relative w-full h-[297mm]">
            <div className="absolute w-full h-full">
              <img src={letterhead} className="w-full h-full" alt="" />
            </div>
            <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
              <div className="flex justify-between mb-4 w-full">
                <div>
                  <p className="text-sm">
                    <strong>BILL NO.</strong>
                  </p>
                  <p className="font-semibold">
                    {loading ? (
                      <Skeleton width={100} />
                    ) : (
                      invoiceData?.billNumber
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex justify-end gap-4 text-sm">
                    <div>
                      <p>
                        <strong>DATE</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={80} />
                        ) : (
                          formatDate(invoiceData?.billDate)
                        )}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>TIME</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={60} />
                        ) : (
                          invoiceData?.billTime
                        )}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>STATUS</strong>
                      </p>
                      <p
                        className={`font-semibold ${
                          invoiceData?.status === "Unpaid"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {loading ? (
                          <Skeleton width={70} />
                        ) : (
                          invoiceData?.status
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="mb-6 py-2 border-b border-gray-300 w-full">
                <h3 className="font-semibold text-lg mb-2">
                  PATIENT INFORMATION
                </h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm w-full">
                  <p>
                    <strong>NAME:</strong>{" "}
                    {loading ? (
                      <Skeleton width={120} />
                    ) : (
                      `${invoiceData?.patient?.firstName} ${invoiceData?.patient?.lastName}`
                    )}
                  </p>
                  <p>
                    <strong>AGE:</strong>{" "}
                    {loading ? (
                      <Skeleton width={40} />
                    ) : (
                      `${invoiceData?.patient?.age} Years`
                    )}
                  </p>
                  <p>
                    <strong>GENDER:</strong>{" "}
                    {loading ? (
                      <Skeleton width={80} />
                    ) : (
                      invoiceData?.patient?.gender
                    )}
                  </p>
                  <p>
                    <strong>PHONE:</strong>{" "}
                    {loading ? (
                      <Skeleton width={100} />
                    ) : (
                      invoiceData?.patient?.phoneNumber
                    )}
                  </p>
                  <p className="col-span-2">
                    <strong>EMAIL:</strong>{" "}
                    {loading ? (
                      <Skeleton width={150} />
                    ) : (
                      invoiceData?.patient?.email
                    )}
                  </p>
                  <p className="col-span-2">
                    <strong>ADDRESS:</strong>{" "}
                    {loading ? (
                      <Skeleton width={200} />
                    ) : (
                      invoiceData?.patient?.address
                    )}
                  </p>
                  <p className="col-span-2">
                    <strong>PAYMENT TYPE:</strong>{" "}
                    <span className="font-semibold">
                      {loading ? (
                        <Skeleton width={80} />
                      ) : (
                        invoiceData?.paymentType
                      )}
                    </span>
                  </p>
                </div>
              </div>

              {/* Disease */}
              <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                <p>
                  <strong>DISEASE</strong>
                </p>
                <p className="font-semibold">
                  {loading ? (
                    <Skeleton width={120} />
                  ) : (
                    invoiceData?.diseaseName
                  )}
                </p>
              </div>

              {/* Description */}
              <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                <p>
                  <strong>DESCRIPTION</strong>
                </p>
                <p className="font-semibold">
                  {loading ? (
                    <Skeleton width={200} />
                  ) : (
                    invoiceData?.description
                  )}
                </p>
              </div>

              {/* Medicines Table */}
              <div className="mb-6 w-full">
                <h3 className="font-semibold text-lg mb-2">MEDICINE</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 text-left">MEDICINE NAME</th>
                      <th className="py-2 text-center">DOSE</th>
                      <th className="py-2 text-center">DURATION</th>
                      <th className="py-2 text-center">TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="py-2">
                          <Skeleton count={3} />
                        </td>
                      </tr>
                    ) : (
                      firstPageMedicines.map((medicine, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2 text-left">{medicine.name}</td>
                          <td className="py-2 text-center">{medicine.dose}</td>
                          <td className="py-2 text-center">
                            {medicine.duration}
                          </td>
                          <td className="py-2 text-center">
                            {medicine.whenToTake}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Account details always after medicine table, inside inputfields */}
              <div className="text-right mt-6 w-full">
                <div className="flex justify-between mb-2 text-sm w-full">
                  <span>SUB TOTAL</span>
                  <span>
                    ₹{" "}
                    {loading ? (
                      <Skeleton width={70} />
                    ) : (
                      invoiceData?.amount?.toFixed(2)
                    )}
                  </span>
                </div>
                <div className="flex justify-between mb-2 text-sm w-full">
                  <span>DISCOUNT</span>
                  <span>
                    {loading ? (
                      <Skeleton width={50} />
                    ) : (
                      `${invoiceData?.discount}%`
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg w-full">
                  <span>GRAND TOTAL</span>
                  <span>
                    ₹{" "}
                    {loading ? (
                      <Skeleton width={80} />
                    ) : (
                      invoiceData?.totalAmount?.toFixed(2)
                    )}
                  </span>
                </div>
              </div>
              {/* Doctor Signature Section */}
              <div className="absolute -bottom-[160px] right-10 flex justify-end">
                <div className="text-center">
                  <img
                    src={invoiceData?.doctor?.signatureImage}
                    alt=""
                    className="w-32 h-12 object-cover mx-auto"
                  />
                  <div className="border-t border-gray-400 w-48 mb-2"></div>
                  <p className="font-semibold">
                    Dr.{" "}
                    {loading ? (
                      <Skeleton width={100} />
                    ) : (
                      invoiceData?.doctor?.firstName +
                        " " +
                        invoiceData?.doctor?.lastName || "Doctor Name"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* First A4 page: patient info + first medicines */}
            <div className="print:a4-page print:page-break-after w-full">
              <div className="relative w-full h-[297mm]">
                <div className="absolute w-full h-full">
                  <img src={letterhead} className="w-full h-full" alt="" />
                </div>
                <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                  <div className="flex justify-between mb-4 w-full">
                    <div>
                      <p className="text-sm">
                        <strong>BILL NO.</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          invoiceData?.billNumber
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex justify-end gap-4 text-sm">
                        <div>
                          <p>
                            <strong>DATE</strong>
                          </p>
                          <p className="font-semibold">
                            {loading ? (
                              <Skeleton width={80} />
                            ) : (
                              formatDate(invoiceData?.billDate)
                            )}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>TIME</strong>
                          </p>
                          <p className="font-semibold">
                            {loading ? (
                              <Skeleton width={60} />
                            ) : (
                              invoiceData?.billTime
                            )}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>STATUS</strong>
                          </p>
                          <p
                            className={`font-semibold ${
                              invoiceData?.status === "Unpaid"
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {loading ? (
                              <Skeleton width={70} />
                            ) : (
                              invoiceData?.status
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Patient Information */}
                  <div className="mb-6 py-2 border-b border-gray-300 w-full">
                    <h3 className="font-semibold text-lg mb-2">
                      PATIENT INFORMATION
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm w-full">
                      <p>
                        <strong>NAME:</strong>{" "}
                        {loading ? (
                          <Skeleton width={120} />
                        ) : (
                          `${invoiceData?.patient?.firstName} ${invoiceData?.patient?.lastName}`
                        )}
                      </p>
                      <p>
                        <strong>AGE:</strong>{" "}
                        {loading ? (
                          <Skeleton width={40} />
                        ) : (
                          `${invoiceData?.patient?.age} Years`
                        )}
                      </p>
                      <p>
                        <strong>GENDER:</strong>{" "}
                        {loading ? (
                          <Skeleton width={80} />
                        ) : (
                          invoiceData?.patient?.gender
                        )}
                      </p>
                      <p>
                        <strong>PHONE:</strong>{" "}
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          invoiceData?.patient?.phoneNumber
                        )}
                      </p>
                      <p className="col-span-2">
                        <strong>EMAIL:</strong>{" "}
                        {loading ? (
                          <Skeleton width={150} />
                        ) : (
                          invoiceData?.patient?.email
                        )}
                      </p>
                      <p className="col-span-2">
                        <strong>ADDRESS:</strong>{" "}
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          invoiceData?.patient?.address
                        )}
                      </p>
                      <p>
                        <strong>PAYMENT TYPE:</strong>{" "}
                        <span className="font-semibold">
                          {loading ? (
                            <Skeleton width={80} />
                          ) : (
                            invoiceData?.paymentType
                          )}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Disease */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <p>
                      <strong>DISEASE</strong>
                    </p>
                    <p className="font-semibold">
                      {loading ? (
                        <Skeleton width={120} />
                      ) : (
                        invoiceData?.diseaseName
                      )}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <p>
                      <strong>DESCRIPTION</strong>
                    </p>
                    <p className="font-semibold">
                      {loading ? (
                        <Skeleton width={200} />
                      ) : (
                        invoiceData?.description
                      )}
                    </p>
                  </div>

                  {/* Medicines Table */}
                  <div className="mb-6 print:page-break-before w-full">
                    <h3 className="font-semibold text-lg mb-2">MEDICINE</h3>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 text-left">MEDICINE NAME</th>
                          <th className="py-2 text-center">DOSE</th>
                          <th className="py-2 text-center">DURATION</th>
                          <th className="py-2 text-center">TIME</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="4" className="py-2">
                              <Skeleton count={3} />
                            </td>
                          </tr>
                        ) : (
                          firstPageMedicines.map((medicine, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200"
                            >
                              <td className="py-2 text-left">
                                {medicine.name}
                              </td>
                              <td className="py-2 text-center">
                                {medicine.dose}
                              </td>
                              <td className="py-2 text-center">
                                {medicine.duration}
                              </td>
                              <td className="py-2 text-center">
                                {medicine.whenToTake}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {/* If medicines > 3, new A4 page for rest of medicines */}
            {restMedicines.length > 0 && (
              <div className="print:a4-page print:page-break-after w-full">
                <div className="relative w-full h-[297mm]">
                  <div className="absolute w-full h-full">
                    <img src={letterhead} className="w-full h-full" alt="" />
                  </div>
                  <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                    <div className="print:page-break-before w-full">
                      <h3 className="font-semibold text-lg mb-2">
                        MEDICINE (Continued)
                      </h3>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="py-2 text-left">MEDICINE NAME</th>
                            <th className="py-2 text-center">DOSE</th>
                            <th className="py-2 text-center">DURATION</th>
                            <th className="py-2 text-center">TIME</th>
                          </tr>
                        </thead>
                        <tbody>
                          {restMedicines.map((medicine, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-200"
                            >
                              <td className="py-2 text-left">
                                {medicine.name}
                              </td>
                              <td className="py-2 text-center">
                                {medicine.dose}
                              </td>
                              <td className="py-2 text-center">
                                {medicine.duration}
                              </td>
                              <td className="py-2 text-center">
                                {medicine.whenToTake}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="print:page-break-before print:mt-12 text-right mt-6 w-full">
                      <div className="flex justify-between mb-2 text-sm w-full">
                        <span>SUB TOTAL</span>
                        <span>
                          ₹{" "}
                          {loading ? (
                            <Skeleton width={70} />
                          ) : (
                            invoiceData?.amount?.toFixed(2)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2 text-sm w-full">
                        <span>DISCOUNT</span>
                        <span>
                          {loading ? (
                            <Skeleton width={50} />
                          ) : (
                            `${invoiceData?.discount}%`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg w-full">
                        <span>GRAND TOTAL</span>
                        <span>
                          ₹{" "}
                          {loading ? (
                            <Skeleton width={80} />
                          ) : (
                            invoiceData?.totalAmount?.toFixed(2)
                          )}
                        </span>
                      </div>
                      {/* Doctor Signature Section */}
                    </div>
                    <div className="absolute -bottom-[150px] right-10 flex justify-end">
                      <div className="text-center">
                        <img
                          src={invoiceData?.doctor?.signatureImage}
                          alt=""
                          className="w-32 h-12 object-cover mx-auto"
                        />
                        <div className="border-t border-gray-400 w-48 mb-2"></div>
                        <p className="font-semibold">
                          Dr.{" "}
                          {loading ? (
                            <Skeleton width={100} />
                          ) : (
                            invoiceData?.doctor?.firstName +
                              " " +
                              invoiceData?.doctor?.lastName || "Doctor Name"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Account details on a new A4 page if medicines > 1 */}
            {medicinesCount > 2 && restMedicines.length === 0 && (
              <div className="print:a4-page print:page-break-after w-full">
                <div className="relative w-full h-[297mm]">
                  <div className="absolute w-full h-full">
                    <img src={letterhead} className="w-full h-full" alt="" />
                  </div>
                  <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start justify-end bg-transparent">
                    <div className="flex justify-between mb-2 text-sm">
                      <span>SUB TOTAL</span>
                      <span>
                        ₹{" "}
                        {loading ? (
                          <Skeleton width={70} />
                        ) : (
                          invoiceData?.amount?.toFixed(2)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>DISCOUNT</span>
                      <span>
                        {loading ? (
                          <Skeleton width={50} />
                        ) : (
                          `${invoiceData?.discount}%`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>GRAND TOTAL</span>
                      <span>
                        ₹{" "}
                        {loading ? (
                          <Skeleton width={80} />
                        ) : (
                          invoiceData?.totalAmount?.toFixed(2)
                        )}
                      </span>
                    </div>
                    {/* Doctor Signature Section */}
                  </div>
                  <div className="absolute bottom-4 right-10 flex justify-end">
                    <div className="text-center">
                      <img
                        src={invoiceData?.doctor?.signatureImage}
                        alt="not found"
                        className="w-32 h-12 object-cover mx-auto"
                      />
                      <div className="border-t border-gray-400 w-48 mb-2"></div>
                      <p className="font-semibold">
                        Dr.{" "}
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          invoiceData?.doctor?.firstName +
                            " " +
                            invoiceData?.doctor?.lastName || "Doctor Name"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>
        {`
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        margin: 0;
      }

      #printableArea {
        width: 210mm;
        min-height: 297mm;
        max-width: 210mm;
        margin: 0 auto;
        padding: 250px 100px 50px 100px;
        box-sizing: border-box;
        background-size: contain;
        background-repeat: no-repeat;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        background-color: white !important;
        color: black !important;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .print\\:a4-page {
        width: 210mm;
        min-height: 297mm;
        max-width: 210mm;
        max-height: 297mm;
        height: 297mm;
        margin: 0 auto;
        box-sizing: border-box;
        background: white;
        position: relative;
        overflow: hidden;
        display: block;
      }
      .print\\:page-break-after {
        page-break-after: always;
        break-after: page;
      }
    }
  `}
      </style>
    </>
  );
};

export default Invoice;
