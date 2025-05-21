import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaPrint } from "react-icons/fa";
import api from "../../api/api";
import InvoicesHead from "../../assets/images/Invoice.png";
import IvoicesTop from "../../assets/images/Invoice-T.png";
import IvoicesBottom from "../../assets/images/Invoice-F.png";


const Invoice = () => {
  const { billId } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prepare charges list for pagination
  const chargesList = [];
  if (invoiceData?.charges?.odpCharges !== undefined) {
    chargesList.push({
      type: 'OPD Charges',
      amount: invoiceData.charges.odpCharges
    });
  }
  if (Array.isArray(invoiceData?.charges?.additionalCharges)) {
    chargesList.push(...invoiceData.charges.additionalCharges);
  }
  const firstPageCharges = chargesList.slice(0, 6);
  const restCharges = chargesList.slice(6);
  const chargesCount = chargesList.length;

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await api.get(`/invoices/${billId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setInvoiceData(response.data.invoice);
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
        {/* If 6 or fewer charges, show everything in one page */}
        {chargesCount <= 6 ? (
          <div className="relative w-full h-[297mm]">
            {/* Watermark background always */}
            <div className="absolute w-full h-full">
              <img src={InvoicesHead} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
            </div>
            {/* Top image only on first page */}
            {/* <div className="absolute w-full top-0 left-0">
              <img src={IvoicesTop} className="w-full" alt="" style={{zIndex: 1}} />
            </div> */}
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

              {/* Charges Table */}
              <div className="mb-6 w-full">
                <h3 className="font-semibold text-lg mb-2">CHARGES</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 text-left">CHARGE TYPE</th>
                      <th className="py-2 text-center">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="2" className="py-2">
                          <Skeleton count={3} />
                        </td>
                      </tr>
                    ) : (
                      firstPageCharges.map((charge, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2 text-left font-medium">{charge.type}</td>
                          <td className="py-2 text-center">₹ {Number(charge.amount).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Total Amount */}
              <div className="text-right mt-6 w-full">
                <div className="flex justify-between mb-2 text-sm w-full">
                  <span>TOTAL</span>
                  <span>
                    ₹{" "}
                    {loading ? (
                      <Skeleton width={70} />
                    ) : (
                      invoiceData?.totalAmount?.toFixed(2)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* First A4 page: patient info + first 6 charges */}
            <div className="print:a4-page print:page-break-after w-full relative h-[297mm]">
              {/* Watermark background always */}
              {/* <div className="absolute w-full h-full">
                <img src={InvoicesHead} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
              </div> */}
              {/* Top image only on first page */}
              <div className="absolute w-full top-0 left-0">
                <img src={IvoicesTop} className="w-full" alt="" style={{zIndex: 1}} />
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

                {/* Charges Table */}
                <div className="mb-6 w-full">
                  <h3 className="font-semibold text-lg mb-2">CHARGES {restCharges.length > 0 && <span className="text-xs">(Continued)</span>}</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 text-left">CHARGE TYPE</th>
                        <th className="py-2 text-center">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="2" className="py-2">
                            <Skeleton count={3} />
                          </td>
                        </tr>
                      ) : (
                        firstPageCharges.map((charge, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="py-2 text-left font-medium">{charge.type}</td>
                            <td className="py-2 text-center">₹ {Number(charge.amount).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Render additional pages for restCharges, 6 per page */}
            {(() => {
              const pages = [];
              for (let i = 0; i < restCharges.length; i += 6) {
                const pageCharges = restCharges.slice(i, i + 6);
                const isLastPage = i + 6 >= restCharges.length;
                pages.push(
                  <div key={i} className="print:a4-page print:page-break-after w-full relative h-[297mm]">
                    {/* Bottom image at the bottom of this page */}
                    <div className="absolute w-full bottom-0 left-0">
                      <img src={IvoicesBottom} className="w-full" alt="" style={{zIndex: 1}} />
                    </div>
                    <div className="inputfields absolute top-[10px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                      <div className="print:page-break-before w-full">
                        <h3 className="font-semibold text-lg mb-2">
                          CHARGES (Continued)
                        </h3>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="py-2 text-left">CHARGE TYPE</th>
                              <th className="py-2 text-center">AMOUNT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pageCharges.map((charge, index) => (
                              <tr key={index} className="border-b border-gray-200">
                                <td className="py-2 text-left font-medium">{charge.type}</td>
                                <td className="py-2 text-center">₹ {Number(charge.amount).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {isLastPage && (
                        <div className="print:page-break-before print:mt-12 text-right mt-6 w-full">
                          <div className="flex justify-between mb-2 text-sm w-full">
                            <span>TOTAL</span>
                            <span>
                              ₹{" "}
                              {loading ? (
                                <Skeleton width={70} />
                              ) : (
                                invoiceData?.totalAmount?.toFixed(2)
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return pages;
            })()}
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
