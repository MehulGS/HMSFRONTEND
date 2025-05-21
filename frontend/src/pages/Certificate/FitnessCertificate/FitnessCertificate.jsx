import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaPrint } from "react-icons/fa";
import api from "../../../api/api";
import LetterheadWatermark from "../../../assets/images/letterhead.png";

const FitnessCertificate = () => {
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
    if (!dateString) return "___ / ___ / ______";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth()+1).padStart(2, '0')} / ${d.getFullYear()}`;
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
            <h1 className="text-3xl font-bold text-center mb-6">
              FITNESS CERTIFICATE
            </h1>

            {/* Certificate Content */}
            <div className="text-lg leading-relaxed mb-12 w-full">
              <p className="mb-6">This is to certify that I have personally examined:</p>

              <div className="mb-6">
                <p className="mb-2">
                  <strong>Name:</strong> <span className="inline-block min-w-[220px] border-b border-black">{certificateData?.patientName || "__________________________"}</span>
                </p>
                <p className="mb-2 flex items-center gap-4">
                  <strong>Gender:</strong>
                  <span className="inline-flex items-center gap-2">
                    <span>{certificateData?.patientGender === 'Male' ? '☑' : '☐'} Male</span>
                    <span>{certificateData?.patientGender === 'Female' ? '☑' : '☐'} Female</span>
                    <span>{certificateData?.patientGender === 'Other' ? '☑' : '☐'} Other</span>
                  </span>
                </p>
                <p className="mb-2">
                  <strong>Age:</strong> <span className="inline-block min-w-[80px] border-b border-black">{certificateData?.patientAge || "___________"}</span>
                </p>
              </div>

              <p className="mb-6">
                He/She was examined on <span className="font-semibold">{formatDate(certificateData?.createdAt)}</span> and based on the clinical evaluation:
              </p>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span>
                    <span className={certificateData?.isFit === 'Fit' ? 'font-bold text-green-700' : ''}>
                      {certificateData?.isFit === 'Fit' ? '☑' : '☐'}
                    </span> <span className={certificateData?.isFit === 'Fit' ? 'font-bold text-green-700' : ''}>Fit</span> for duty/school/college
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span>
                    <span className={certificateData?.isFit === 'Unfit' ? 'font-bold text-red-700' : ''}>
                      {certificateData?.isFit === 'Unfit' ? '☑' : '☐'}
                    </span> <span className={certificateData?.isFit === 'Unfit' ? 'font-bold text-red-700' : ''}>Unfit</span> for duty/school/college due to &nbsp;
                    <span className={(certificateData?.isFit === 'Unfit' ? 'font-bold text-red-700 ' : '') + 'inline-block min-w-[200px] border-b border-black'}>
                      {certificateData?.isFit === 'Unfit' ? certificateData?.reason : "____________________________"}
                    </span>
                  </span>
                </div>
              </div>

              <p className="mb-6">
                This certificate is issued upon request for official/medical purposes.
              </p>

              <div className="mb-6">
                <p className="mb-2">
                  <strong>Doctor's Name:</strong> <span className="inline-block min-w-[220px] border-b border-black">{certificateData?.doctorName || "___________________________"}</span>
                </p>
                <p className="mb-2">
                  <strong>Signature & Stamp:</strong>
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

export default FitnessCertificate;
