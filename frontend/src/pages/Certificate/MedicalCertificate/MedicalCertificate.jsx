import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaPrint } from "react-icons/fa";
import api from "../../../api/api";
import LetterheadWatermark from "../../../assets/images/letterhead.png";

const MedicalCertificate = () => {
  const { billId } = useParams();
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        const response = await api.get(`/certificate/${billId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCertificateData(response.data.data);
      } catch (error) {
        console.error("Error fetching certificate:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificateData();
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
    window.location.reload();
  };

  return (
    <>
      {/* Print Button */}
      <div className="print:hidden mb-4 flex justify-end max-w-3xl mx-auto px-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#0eabeb] text-white px-4 py-2 rounded-xl hover:bg-[#0c97cc] transition-colors"
        >
          <FaPrint />
          <span>Print Certificate</span>
        </button>
      </div>

      {/* Certificate Content */}
      <div
        id="printableArea"
        className="bg-white print:bg-white text-black print:text-black rounded-2xl w-full max-w-3xl mx-auto shadow-md border border-gray-200 print:shadow-none print:border-none"
      >
        <div className="relative w-full h-[297mm]">
          <div className="absolute w-full h-full">
            <img
              src={LetterheadWatermark}
              className="w-full h-full"
              alt=""
              style={{ position: "absolute", zIndex: 0 }}
            />
          </div>
          <div className="absolute top-[280px] w-full max-w-3xl m-auto px-28 flex flex-col items-center bg-transparent">
            {/* Certificate Header */}
            <p className="mb-2 border-b-2 border-gray-200">
              <strong>Issued Date:</strong>{" "}
              {loading ? (
                <Skeleton width={150} inline />
              ) : (
                formatDate(certificateData?.createdAt)
              )}
            </p>
            <h1 className="text-3xl font-bold text-center mb-6">
              MEDICAL CERTIFICATE
            </h1>

            {/* Certificate Content */}
            <div className="text-lg leading-relaxed mb-12">
              <p className="mb-2">
                Patient Name:{" "}
                <span className="font-semibold">
                  {loading ? (
                    <Skeleton width={150} inline />
                  ) : (
                    certificateData?.patientName
                  )}
                </span>
              </p>

              <div className="mb-6">
                <p className="mb-2">
                  <strong>Gender:</strong>{" "}
                  <span className="font-semibold">
                    {loading ? (
                      <Skeleton width={100} inline />
                    ) : (
                      certificateData?.patientGender
                    )}
                  </span>
                </p>
                <p className="mb-2">
                  <strong>Age:</strong>{" "}
                  <span className="font-semibold">
                    {loading ? (
                      <Skeleton width={50} inline />
                    ) : (
                      `${certificateData?.patientAge} years`
                    )}
                  </span>
                </p>
              </div>

              <p className="mb-2">
                He/She was brought to me on{" "}
                <span className="font-semibold">
                  {loading ? (
                    <Skeleton width={150} inline />
                  ) : (
                    formatDate(certificateData?.createdAt)
                  )}
                </span>{" "}
                and has been diagnosed with{" "}
                <span className="font-semibold">
                  {loading ? (
                    <Skeleton width={200} inline />
                  ) : (
                    certificateData?.diseaseName
                  )}
                </span>
                .
              </p>

              <p className="mb-2">
                <strong>Reason:</strong>{" "}
                <span className="font-semibold">
                  {loading ? (
                    <Skeleton width={200} inline />
                  ) : (
                    certificateData?.reason
                  )}
                </span>
              </p>

              <p className="mb-2">
                In my opinion, the above-named individual is medically unfit to
                attend work/school/college and is advised rest and appropriate
                medical care.
              </p>

              <p className="mb-6">
                He/She may be considered fit to resume duties subject to
                improvement in condition.
              </p>

              <p className="mb-2">
                This certificate is issued upon request for medical and official
                purposes.
              </p>

              {/* Doctor's Information */}
              <div className="mt-2">
                <p className="mb-2">
                  <strong>Doctor's Name:</strong>{" "}
                  {loading ? (
                    <Skeleton width={150} inline />
                  ) : (
                    certificateData?.doctorName
                  )}
                </p>
                <p className="mb-2">
                  <strong>Signature & Official Stamp:</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
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
            }
          }
        `}
      </style>
    </>
  );
};

export default MedicalCertificate;
