import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaPrint } from "react-icons/fa";
import api from "../../api/api";
import LetterheadWatermark from "../../assets/images/letterhead.png";
import LetterheadTop from "../../assets/images/letterhead-T.png";
import LetterheadBottom from "../../assets/images/letterhead-F.png";

const PrescriptionInvoice = () => {
  const { billId } = useParams();
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Split medicines for pagination (first 3, rest)
  const medicines = prescriptionData?.medicines || [];
  const firstPageMedicines = medicines.slice(0, 3);
  const restMedicines = medicines.slice(3);
  const medicinesCount = medicines.length;

  // Always split medicines for multi-page: 2 on first page, rest on next
  const firstPageMedicinesDynamic = medicines.slice(0, 2);
  const restMedicinesDynamic = medicines.slice(2);

  // Determine layout conditions
  const diseaseCount = prescriptionData?.diseaseDetails?.length || 0;
  const descriptionCount = prescriptionData?.descriptionDetails?.length || 0;
  const showSinglePage =
    diseaseCount === 1 && descriptionCount === 1 && medicinesCount < 2;

  // For dynamic description splitting
  let firstPageDescriptions = prescriptionData?.descriptionDetails || [];
  let secondPageDescriptions = [];
  if (diseaseCount > 9 && descriptionCount > 4) {
    firstPageDescriptions = prescriptionData?.descriptionDetails.slice(0, 4);
    secondPageDescriptions = prescriptionData?.descriptionDetails.slice(4);
  }

  // New: handle one disease, descriptions, and more than 1 medicine
  const oneDiseaseWithDescriptionsAndMultipleMedicines =
    diseaseCount === 1 && descriptionCount > 0 && medicinesCount > 1;

  // Special case: no follow up, additional notes present, more than 3 medicines
  const noFollowupWithNotesAndManyMedicines =
    !prescriptionData?.followUp?.date &&
    typeof prescriptionData?.addistionalNotes === 'string' &&
    prescriptionData?.addistionalNotes.trim() !== '' &&
    medicinesCount > 3;

  // Special case: diseases > 8 or (diseases >= 8 and descriptions > 3)
  const manyDiseasesOrDescriptions =
    diseaseCount > 8 || (diseaseCount >= 8 && descriptionCount > 3);
  const firstPageMedicinesSpecial = medicines.slice(0, 2);
  const restMedicinesSpecial = medicines.slice(2);

  useEffect(() => {
    const fetchPrescriptionData = async () => {
      try {
        const response = await api.get(`/prescription/${billId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPrescriptionData(response.data.data.prescription);
      } catch (error) {
        console.error("Error fetching prescription:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptionData();
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

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
          <span>Print Prescription</span>
        </button>
      </div>

      {/* Prescription Content */}
      <div
        id="printableArea"
        className="bg-white print:bg-white text-black print:text-black rounded-2xl w-full max-w-3xl mx-auto shadow-md border border-gray-200 print:shadow-none print:border-none flex flex-col items-center"
      >
        {diseaseCount < 3 && descriptionCount < 4 ? (
          medicines.length <= 4 ? (
            // Show all medicines (1, 2, 3, or 4) on the first page
            <div className="print:a4-page print:page-break-after w-full">
              <div className="relative w-full h-[297mm]">
                <div className="absolute w-full h-full">
                  <img src={LetterheadWatermark} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
                </div>
                <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                  <div className="flex justify-between mb-4 w-full">
                    <div>
                      <p className="text-sm">
                        <strong>PATIENT NUMBER</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          prescriptionData?.patient?.patientUniqueId
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
                              formatDate(prescriptionData?.createdAt)
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
                              formatTime(prescriptionData?.createdAt)
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
                        <strong>NAME:</strong>{' '}
                        {loading ? (
                          <Skeleton width={120} />
                        ) : (
                          `${prescriptionData?.patientDetails?.firstName} ${prescriptionData?.patientDetails?.lastName}`
                        )}
                      </p>
                      <p>
                        <strong>AGE:</strong>{' '}
                        {loading ? (
                          <Skeleton width={40} />
                        ) : (
                          `${prescriptionData?.patientDetails?.age} Years`
                        )}
                      </p>
                      <p>
                        <strong>GENDER:</strong>{' '}
                        {loading ? (
                          <Skeleton width={80} />
                        ) : (
                          prescriptionData?.patientDetails?.gender
                        )}
                      </p>
                      <p>
                        <strong>PHONE:</strong>{' '}
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          prescriptionData?.patientDetails?.phoneNumber
                        )}
                      </p>
                      <p className="col-span-2">
                        <strong>ADDRESS:</strong>{' '}
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          prescriptionData?.patientDetails?.address
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Disease */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <div className="flex items-start gap-4">
                      <p className="font-semibold whitespace-nowrap">
                        <strong>DISEASE :</strong>
                      </p>
                      <div className="flex-1">
                        {loading ? (
                          <Skeleton width={120} />
                        ) : (
                          prescriptionData?.diseaseDetails?.map(
                            (disease, index) => (
                              <div key={index} className="mb-2 inline-block">
                                <span className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                                  {disease.name}
                                </span>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <div className="flex items-start gap-4">
                      <p className="font-semibold whitespace-nowrap">
                        <strong>DESCRIPTION :</strong>
                      </p>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          (prescriptionData?.descriptionDetails || []).map(
                            (desc, index) => (
                              <span
                                key={index}
                                className="bg-blue-50 px-3 py-1 rounded-md text-gray-700 border border-blue-100"
                              >
                                {desc.description}
                              </span>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medicines Table (all medicines) */}
                  {medicines.length > 0 && (
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
                                <Skeleton count={4} />
                              </td>
                            </tr>
                          ) : (
                            medicines.map((medicine, index) => (
                              <tr key={index} className="border-b border-gray-200">
                                <td className="py-2 text-left">{medicine.medicineDetails?.name || medicine.name}</td>
                                <td className="py-2 text-center">{medicine.dose}</td>
                                <td className="py-2 text-center">{medicine.duration}</td>
                                <td className="py-2 text-center">{medicine.whenToTake}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // More than 4 medicines: split across pages
            <>
              {/* First page: show only first 4 medicines */}
              <div className="print:a4-page print:page-break-after w-full">
                <div className="relative w-full h-[297mm]">
                  <div className="absolute w-full h-full">
                    <img src={LetterheadTop} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
                  </div>
                  <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                    <div className="flex justify-between mb-4 w-full">
                      <div>
                        <p className="text-sm">
                          <strong>PATIENT NUMBER</strong>
                        </p>
                        <p className="font-semibold">
                          {loading ? (
                            <Skeleton width={100} />
                          ) : (
                            prescriptionData?.patient?.patientUniqueId
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
                                formatDate(prescriptionData?.createdAt)
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
                                formatTime(prescriptionData?.createdAt)
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
                          <strong>NAME:</strong>{' '}
                          {loading ? (
                            <Skeleton width={120} />
                          ) : (
                            `${prescriptionData?.patientDetails?.firstName} ${prescriptionData?.patientDetails?.lastName}`
                          )}
                        </p>
                        <p>
                          <strong>AGE:</strong>{' '}
                          {loading ? (
                            <Skeleton width={40} />
                          ) : (
                            `${prescriptionData?.patientDetails?.age} Years`
                          )}
                        </p>
                        <p>
                          <strong>GENDER:</strong>{' '}
                          {loading ? (
                            <Skeleton width={80} />
                          ) : (
                            prescriptionData?.patientDetails?.gender
                          )}
                        </p>
                        <p>
                          <strong>PHONE:</strong>{' '}
                          {loading ? (
                            <Skeleton width={100} />
                          ) : (
                            prescriptionData?.patientDetails?.phoneNumber
                          )}
                        </p>
                        <p className="col-span-2">
                          <strong>ADDRESS:</strong>{' '}
                          {loading ? (
                            <Skeleton width={200} />
                          ) : (
                            prescriptionData?.patientDetails?.address
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Disease */}
                    <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                      <div className="flex items-start gap-4">
                        <p className="font-semibold whitespace-nowrap">
                          <strong>DISEASE :</strong>
                        </p>
                        <div className="flex-1">
                          {loading ? (
                            <Skeleton width={120} />
                          ) : (
                            prescriptionData?.diseaseDetails?.map(
                              (disease, index) => (
                                <div key={index} className="mb-2 inline-block">
                                  <span className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                                    {disease.name}
                                  </span>
                                </div>
                              )
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                      <div className="flex items-start gap-4">
                        <p className="font-semibold whitespace-nowrap">
                          <strong>DESCRIPTION :</strong>
                        </p>
                        <div className="flex-1 flex flex-wrap gap-2">
                          {loading ? (
                            <Skeleton width={200} />
                          ) : (
                            firstPageDescriptions.map((desc, index) => (
                              <span
                                key={index}
                                className="bg-blue-50 px-3 py-1 rounded-md text-gray-700 border border-blue-100"
                              >
                                {desc.description}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Medicines Table (first 4 medicines) */}
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
                                <Skeleton count={4} />
                              </td>
                            </tr>
                          ) : (
                            medicines.slice(0, 4).map((medicine, index) => (
                              <tr key={index} className="border-b border-gray-200">
                                <td className="py-2 text-left">{medicine.medicineDetails?.name || medicine.name}</td>
                                <td className="py-2 text-center">{medicine.dose}</td>
                                <td className="py-2 text-center">{medicine.duration}</td>
                                <td className="py-2 text-center">{medicine.whenToTake}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              {/* Second page: show the rest of the medicines */}
              <div className="print:a4-page print:page-break-after w-full">
                <div className="relative w-full h-[297mm]">
                  <div className="absolute w-full bottom-0 left-0">
                    <img src={LetterheadBottom} className="w-full" alt="" style={{zIndex: 1}} />
                  </div>
                  <div className="inputfields absolute top-[10px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                    <div className="mb-6 w-full">
                      <h3 className="font-semibold text-lg mb-2">MEDICINE (Continued)</h3>
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
                          {medicines.slice(4).map((medicine, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="py-2 text-left">{medicine.medicineDetails?.name || medicine.name}</td>
                              <td className="py-2 text-center">{medicine.dose}</td>
                              <td className="py-2 text-center">{medicine.duration}</td>
                              <td className="py-2 text-center">{medicine.whenToTake}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        ) : manyDiseasesOrDescriptions ? (
          // First page: info, diseases, descriptions, up to 2 medicines. Second page: rest of medicines as continued
          <>
            {/* First page */}
            <div className="print:a4-page print:page-break-after w-full">
              <div className="relative w-full h-[297mm]">
                {/* Watermark background always */}
                {/* <div className="absolute w-full h-full">
                  <img src={LetterheadWatermark} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
                </div> */}
                {/* Top image only on first page */}
                <div className="absolute w-full top-0 left-0">
                  <img src={LetterheadTop} className="w-full" alt="" style={{zIndex: 0}} />
                </div>
                <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                  <div className="flex justify-between mb-4 w-full">
                    <div>
                      <p className="text-sm">
                        <strong>PATIENT NUMBER</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          prescriptionData?.patient?.patientUniqueId
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
                              formatDate(prescriptionData?.createdAt)
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
                              formatTime(prescriptionData?.createdAt)
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
                        <strong>NAME:</strong>{' '}
                        {loading ? (
                          <Skeleton width={120} />
                        ) : (
                          `${prescriptionData?.patientDetails?.firstName} ${prescriptionData?.patientDetails?.lastName}`
                        )}
                      </p>
                      <p>
                        <strong>AGE:</strong>{' '}
                        {loading ? (
                          <Skeleton width={40} />
                        ) : (
                          `${prescriptionData?.patientDetails?.age} Years`
                        )}
                      </p>
                      <p>
                        <strong>GENDER:</strong>{' '}
                        {loading ? (
                          <Skeleton width={80} />
                        ) : (
                          prescriptionData?.patientDetails?.gender
                        )}
                      </p>
                      <p>
                        <strong>PHONE:</strong>{' '}
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          prescriptionData?.patientDetails?.phoneNumber
                        )}
                      </p>
                      <p className="col-span-2">
                        <strong>ADDRESS:</strong>{' '}
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          prescriptionData?.patientDetails?.address
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Disease */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <div className="flex items-start gap-4">
                      <p className="font-semibold whitespace-nowrap">
                        <strong>DISEASE :</strong>
                      </p>
                      <div className="flex-1">
                        {loading ? (
                          <Skeleton width={120} />
                        ) : (
                          prescriptionData?.diseaseDetails?.map(
                            (disease, index) => (
                              <div key={index} className="mb-2 inline-block">
                                <span className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                                  {disease.name}
                                </span>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <div className="flex items-start gap-4">
                      <p className="font-semibold whitespace-nowrap">
                        <strong>DESCRIPTION :</strong>
                      </p>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          (prescriptionData?.descriptionDetails || []).map(
                            (desc, index) => (
                              <span
                                key={index}
                                className="bg-blue-50 px-3 py-1 rounded-md text-gray-700 border border-blue-100"
                              >
                                {desc.description}
                              </span>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medicines Table (up to 2) */}
                  {firstPageMedicinesSpecial.length > 0 && (
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
                            firstPageMedicinesSpecial.map((medicine, index) => (
                              <tr key={index} className="border-b border-gray-200">
                                <td className="py-2 text-left">
                                  {medicine.medicineDetails?.name || medicine.name}
                                </td>
                                <td className="py-2 text-center">{medicine.dose}</td>
                                <td className="py-2 text-center">{medicine.duration}</td>
                                <td className="py-2 text-center">{medicine.whenToTake}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Second page: rest of medicines as continued */}
            {restMedicinesSpecial.length > 0 && (
              <div className="print:a4-page print:page-break-after w-full">
                <div className="relative w-full h-[297mm]">
                  {/* Watermark background always */}
                  {/* <div className="absolute w-full h-full">
                    <img src={LetterheadWatermark} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
                  </div> */}
                  {/* Bottom image at the bottom of this page */}
                  <div className="absolute w-full bottom-0 left-0">
                    <img src={LetterheadBottom} className="w-full" alt="" style={{zIndex: 1}} />
                  </div>
                  <div className="inputfields absolute top-[10px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                    {/* Medicines Table (continued) */}
                    <div className="mb-6 w-full">
                      <h3 className="font-semibold text-lg mb-2">MEDICINE (Continued)</h3>
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
                          {restMedicinesSpecial.map((medicine, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="py-2 text-left">{medicine.medicineDetails?.name || medicine.name}</td>
                              <td className="py-2 text-center">{medicine.dose}</td>
                              <td className="py-2 text-center">{medicine.duration}</td>
                              <td className="py-2 text-center">{medicine.whenToTake}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : noFollowupWithNotesAndManyMedicines ? (
          // First page: info, disease, descriptions, first 3 medicines. Second page: rest of medicines and additional notes
          <>
            {/* First page */}
            <div className="print:a4-page print:page-break-after w-full">
              <div className="relative w-full h-[297mm]">
                {/* Watermark background always */}
                {/* <div className="absolute w-full h-full">
                  <img src={LetterheadWatermark} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
                </div> */}
                {/* Top image only on first page */}
                <div className="absolute w-full top-0 left-0">
                  <img src={LetterheadTop} className="w-full" alt="" style={{zIndex: 1}} />
                </div>
                <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                  <div className="flex justify-between mb-4 w-full">
                    <div>
                      <p className="text-sm">
                        <strong>PATIENT NUMBER</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          prescriptionData?.patient?.patientUniqueId
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
                              formatDate(prescriptionData?.createdAt)
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
                              formatTime(prescriptionData?.createdAt)
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
                        <strong>NAME:</strong>{' '}
                        {loading ? (
                          <Skeleton width={120} />
                        ) : (
                          `${prescriptionData?.patientDetails?.firstName} ${prescriptionData?.patientDetails?.lastName}`
                        )}
                      </p>
                      <p>
                        <strong>AGE:</strong>{' '}
                        {loading ? (
                          <Skeleton width={40} />
                        ) : (
                          `${prescriptionData?.patientDetails?.age} Years`
                        )}
                      </p>
                      <p>
                        <strong>GENDER:</strong>{' '}
                        {loading ? (
                          <Skeleton width={80} />
                        ) : (
                          prescriptionData?.patientDetails?.gender
                        )}
                      </p>
                      <p>
                        <strong>PHONE:</strong>{' '}
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          prescriptionData?.patientDetails?.phoneNumber
                        )}
                      </p>
                      <p className="col-span-2">
                        <strong>ADDRESS:</strong>{' '}
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          prescriptionData?.patientDetails?.address
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Disease */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <div className="flex items-start gap-4">
                      <p className="font-semibold whitespace-nowrap">
                        <strong>DISEASE :</strong>
                      </p>
                      <div className="flex-1">
                        {loading ? (
                          <Skeleton width={120} />
                        ) : (
                          prescriptionData?.diseaseDetails?.map(
                            (disease, index) => (
                              <div key={index} className="mb-2 inline-block">
                                <span className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                                  {disease.name}
                                </span>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <div className="flex items-start gap-4">
                      <p className="font-semibold whitespace-nowrap">
                        <strong>DESCRIPTION :</strong>
                      </p>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          (prescriptionData?.descriptionDetails || []).map(
                            (desc, index) => (
                              <span
                                key={index}
                                className="bg-blue-50 px-3 py-1 rounded-md text-gray-700 border border-blue-100"
                              >
                                {desc.description}
                              </span>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medicines Table (first 3) */}
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
                              <td className="py-2 text-left">{medicine.medicineDetails?.name || medicine.name}</td>
                              <td className="py-2 text-center">{medicine.dose}</td>
                              <td className="py-2 text-center">{medicine.duration}</td>
                              <td className="py-2 text-center">{medicine.whenToTake}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            {/* Second page: rest of medicines and additional notes */}
            <div className="print:a4-page print:page-break-after w-full">
              <div className="relative w-full h-[297mm]">
                {/* Watermark background always */}
                {/* <div className="absolute w-full h-full">
                  <img src={LetterheadWatermark} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
                </div> */}
                {/* Bottom image at the bottom of this page */}
                <div className="absolute w-full bottom-0 left-0">
                  <img src={LetterheadBottom} className="w-full" alt="" style={{zIndex: 1}} />
                </div>
                <div className="inputfields absolute top-[10px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                  {/* Medicines Table (rest) */}
                  <div className="mb-6 w-full">
                    <h3 className="font-semibold text-lg mb-2">MEDICINE (Continued)</h3>
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
                          restMedicines.map((medicine, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="py-2 text-left">{medicine.medicineDetails?.name || medicine.name}</td>
                              <td className="py-2 text-center">{medicine.dose}</td>
                              <td className="py-2 text-center">{medicine.duration}</td>
                              <td className="py-2 text-center">{medicine.whenToTake}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Additional Notes */}
                  {prescriptionData?.addistionalNotes && (
                    <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                      <p>
                        <strong>ADDITIONAL NOTES</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          prescriptionData?.addistionalNotes
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : showSinglePage ? (
          // Show everything on one page
          <div className="relative w-full h-[297mm]">
            {/* Watermark background always */}
            {/* <div className="absolute w-full h-full">
              <img src={LetterheadWatermark} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
            </div> */}
            {/* Top image only on first page */}
            <div className="absolute w-full top-0 left-0">
              <img src={LetterheadTop} className="w-full" alt="" style={{zIndex: 1}} />
            </div>
            <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
              <div className="flex justify-between mb-4 w-full">
                <div>
                  <p className="text-sm">
                    <strong>PATIENT NUMBER</strong>
                  </p>
                  <p className="font-semibold">
                    {loading ? (
                      <Skeleton width={100} />
                    ) : (
                      prescriptionData?.patient?.patientUniqueId
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
                          formatDate(prescriptionData?.createdAt)
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
                          formatTime(prescriptionData?.createdAt)
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
                      `${prescriptionData?.patientDetails?.firstName} ${prescriptionData?.patientDetails?.lastName}`
                    )}
                  </p>
                  <p>
                    <strong>AGE:</strong>{" "}
                    {loading ? (
                      <Skeleton width={40} />
                    ) : (
                      `${prescriptionData?.patientDetails?.age} Years`
                    )}
                  </p>
                  <p>
                    <strong>GENDER:</strong>{" "}
                    {loading ? (
                      <Skeleton width={80} />
                    ) : (
                      prescriptionData?.patientDetails?.gender
                    )}
                  </p>
                  <p>
                    <strong>PHONE:</strong>{" "}
                    {loading ? (
                      <Skeleton width={100} />
                    ) : (
                      prescriptionData?.patientDetails?.phoneNumber
                    )}
                  </p>
                  <p className="col-span-2">
                    <strong>ADDRESS:</strong>{" "}
                    {loading ? (
                      <Skeleton width={200} />
                    ) : (
                      prescriptionData?.patientDetails?.address
                    )}
                  </p>
                </div>
              </div>
              {/* Next Follow-up Date/Time - separate section, only if followUp.date exists */}
              {prescriptionData?.followUp?.date && (
                <div className="w-full mb-4 p-4 rounded-lg border border-blue-200 bg-blue-50 flex flex-col items-start">
                  <h3 className="font-semibold text-lg mb-2 text-blue-800">Next Follow-up Date/Time</h3>
                  <div className="text-sm">
                    <span className="font-semibold">Date:</span>{" "}
                    {loading ? (
                      <Skeleton width={80} inline />
                    ) : (
                      formatDate(prescriptionData?.followUp?.date)
                    )}
                    <span className="ml-4 font-semibold">Time:</span>{" "}
                    {loading ? (
                      <Skeleton width={60} inline />
                    ) : (
                      prescriptionData?.followUp?.time || "N/A"
                    )}
                  </div>
                </div>
              )}

              {/* Disease */}
              <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                <div className="flex items-start gap-4">
                  <p className="font-semibold whitespace-nowrap">
                    <strong>DISEASE :</strong>
                  </p>
                  <div className="flex-1">
                    {loading ? (
                      <Skeleton width={120} />
                    ) : (
                      prescriptionData?.diseaseDetails?.map(
                        (disease, index) => (
                          <div key={index} className="mb-2 inline-block">
                            <span className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                              {disease.name}
                            </span>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                <div className="flex items-start gap-4">
                  <p className="font-semibold whitespace-nowrap">
                    <strong>DESCRIPTION :</strong>
                  </p>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {loading ? (
                      <Skeleton width={200} />
                    ) : (
                      (prescriptionData?.descriptionDetails || []).map(
                        (desc, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 px-3 py-1 rounded-md text-gray-700 border border-blue-100"
                          >
                            {desc.description}
                          </span>
                        )
                      )
                    )}
                  </div>
                </div>
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
                          <td className="py-2 text-left">{medicine.medicineDetails?.name || medicine.name}</td>
                          <td className="py-2 text-center">{medicine.dose}</td>
                          <td className="py-2 text-center">{medicine.duration}</td>
                          <td className="py-2 text-center">{medicine.whenToTake}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Additional Notes */}
              {prescriptionData?.addistionalNotes && (
                <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                  <p>
                    <strong>ADDITIONAL NOTES</strong>
                  </p>
                  <p className="font-semibold">
                    {loading ? (
                      <Skeleton width={200} />
                    ) : (
                      prescriptionData?.addistionalNotes
                    )}
                  </p>
                </div>
              )}

              {/* Follow Up Information */}
              {prescriptionData?.followUp?.required && (
                <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                  <p>
                    <strong>FOLLOW UP</strong>
                  </p>
                  <p className="font-semibold">
                    Status: {prescriptionData?.followUp?.status}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : oneDiseaseWithDescriptionsAndMultipleMedicines ? (
          // First page: info, disease, descriptions. Second page: medicines and additional notes
          <>
            {/* First page: info, disease, descriptions */}
            <div className="print:a4-page print:page-break-after w-full">
              <div className="relative w-full h-[297mm]">
                {/* Watermark background always */}
                {/* <div className="absolute w-full h-full">
                  <img src={LetterheadWatermark} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
                </div> */}
                {/* Top image only on first page */}
                <div className="absolute w-full top-0 left-0">
                  <img src={LetterheadTop} className="w-full" alt="" style={{zIndex: 1}} />
                </div>
                <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                  <div className="flex justify-between mb-4 w-full">
                    <div>
                      <p className="text-sm">
                        <strong>PATIENT NUMBER</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          prescriptionData?.patient?.patientUniqueId
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
                              formatDate(prescriptionData?.createdAt)
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
                              formatTime(prescriptionData?.createdAt)
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
                          `${prescriptionData?.patientDetails?.firstName} ${prescriptionData?.patientDetails?.lastName}`
                        )}
                      </p>
                      <p>
                        <strong>AGE:</strong>{" "}
                        {loading ? (
                          <Skeleton width={40} />
                        ) : (
                          `${prescriptionData?.patientDetails?.age} Years`
                        )}
                      </p>
                      <p>
                        <strong>GENDER:</strong>{" "}
                        {loading ? (
                          <Skeleton width={80} />
                        ) : (
                          prescriptionData?.patientDetails?.gender
                        )}
                      </p>
                      <p>
                        <strong>PHONE:</strong>{" "}
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          prescriptionData?.patientDetails?.phoneNumber
                        )}
                      </p>
                      <p className="col-span-2">
                        <strong>ADDRESS:</strong>{" "}
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          prescriptionData?.patientDetails?.address
                        )}
                      </p>
                    </div>
                  </div>
                  {/* Next Follow-up Date/Time - separate section, only if followUp.date exists */}
                  {prescriptionData?.followUp?.date && (
                    <div className="w-full mb-4 p-4 rounded-lg border border-blue-200 bg-blue-50 flex flex-col items-start">
                      <h3 className="font-semibold text-lg mb-2 text-blue-800">Next Follow-up Date/Time</h3>
                      <div className="text-sm">
                        <span className="font-semibold">Date:</span>{" "}
                        {loading ? (
                          <Skeleton width={80} inline />
                        ) : (
                          formatDate(prescriptionData?.followUp?.date)
                        )}
                        <span className="ml-4 font-semibold">Time:</span>{" "}
                        {loading ? (
                          <Skeleton width={60} inline />
                        ) : (
                          prescriptionData?.followUp?.time || "N/A"
                        )}
                      </div>
                    </div>
                  )}

                  {/* Disease */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <div className="flex items-start gap-4">
                      <p className="font-semibold whitespace-nowrap">
                        <strong>DISEASE :</strong>
                      </p>
                      <div className="flex-1">
                        {loading ? (
                          <Skeleton width={120} />
                        ) : (
                          prescriptionData?.diseaseDetails?.map(
                            (disease, index) => (
                              <div key={index} className="mb-2 inline-block">
                                <span className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                                  {disease.name}
                                </span>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description (all) */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <div className="flex items-start gap-4">
                      <p className="font-semibold whitespace-nowrap">
                        <strong>DESCRIPTION :</strong>
                      </p>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          (prescriptionData?.descriptionDetails || []).map(
                            (desc, index) => (
                              <span
                                key={index}
                                className="bg-blue-50 px-3 py-1 rounded-md text-gray-700 border border-blue-100"
                              >
                                {desc.description}
                              </span>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Second page: medicines and additional notes */}
            <div className="print:a4-page print:page-break-after w-full">
              <div className="relative w-full h-[297mm]">
                {/* Watermark background always */}
                {/* <div className="absolute w-full h-full">
                  <img src={LetterheadWatermark} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
                </div> */}
                {/* Bottom image at the bottom of this page */}
                <div className="absolute w-full bottom-0 left-0">
                  <img src={LetterheadBottom} className="w-full" alt="" style={{zIndex: 1}} />
                </div>
                <div className="inputfields absolute top-[10px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
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
                          medicines.map((medicine, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="py-2 text-left">
                                {medicine.medicineDetails.name}
                              </td>
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
                  {/* Additional Notes */}
                  {prescriptionData?.addistionalNotes && (
                    <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                      <p>
                        <strong>ADDITIONAL NOTES</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          prescriptionData?.addistionalNotes
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          // Multi-page: first page for info, second page for medicines (+ rest descriptions if needed)
          <>
            {/* First page: patient info, diseases, descriptions, etc. */}
            <div className="print:a4-page print:page-break-after w-full">
              <div className="relative w-full h-[297mm]">
                {/* Watermark background always */}
                {/* <div className="absolute w-full h-full">
                  <img src={LetterheadWatermark} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
                </div> */}
                {/* Top image only on first page */}
                <div className="absolute w-full top-0 left-0">
                  <img src={LetterheadTop} className="w-full" alt="" style={{zIndex: 1}} />
                </div>
                <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                  <div className="flex justify-between mb-4 w-full">
                    <div>
                      <p className="text-sm">
                        <strong>PATIENT NUMBER</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          prescriptionData?.patient?.patientUniqueId
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
                              formatDate(prescriptionData?.createdAt)
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
                              formatTime(prescriptionData?.createdAt)
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
                          `${prescriptionData?.patientDetails?.firstName} ${prescriptionData?.patientDetails?.lastName}`
                        )}
                      </p>
                      <p>
                        <strong>AGE:</strong>{" "}
                        {loading ? (
                          <Skeleton width={40} />
                        ) : (
                          `${prescriptionData?.patientDetails?.age} Years`
                        )}
                      </p>
                      <p>
                        <strong>GENDER:</strong>{" "}
                        {loading ? (
                          <Skeleton width={80} />
                        ) : (
                          prescriptionData?.patientDetails?.gender
                        )}
                      </p>
                      <p>
                        <strong>PHONE:</strong>{" "}
                        {loading ? (
                          <Skeleton width={100} />
                        ) : (
                          prescriptionData?.patientDetails?.phoneNumber
                        )}
                      </p>
                      <p className="col-span-2">
                        <strong>ADDRESS:</strong>{" "}
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          prescriptionData?.patientDetails?.address
                        )}
                      </p>
                    </div>
                  </div>
                  {/* Next Follow-up Date/Time - separate section, only if followUp.date exists */}
                  {prescriptionData?.followUp?.date && (
                    <div className="w-full mb-4 p-4 rounded-lg border border-blue-200 bg-blue-50 flex flex-col items-start">
                      <h3 className="font-semibold text-lg mb-2 text-blue-800">Next Follow-up Date/Time</h3>
                      <div className="text-sm">
                        <span className="font-semibold">Date:</span>{" "}
                        {loading ? (
                          <Skeleton width={80} inline />
                        ) : (
                          formatDate(prescriptionData?.followUp?.date)
                        )}
                        <span className="ml-4 font-semibold">Time:</span>{" "}
                        {loading ? (
                          <Skeleton width={60} inline />
                        ) : (
                          prescriptionData?.followUp?.time || "N/A"
                        )}
                      </div>
                    </div>
                  )}

                  {/* Disease */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <div className="flex items-start gap-4">
                      <p className="font-semibold whitespace-nowrap">
                        <strong>DISEASE :</strong>
                      </p>
                      <div className="flex-1">
                        {loading ? (
                          <Skeleton width={120} />
                        ) : (
                          prescriptionData?.diseaseDetails?.map(
                            (disease, index) => (
                              <div key={index} className="mb-2 inline-block">
                                <span className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium border border-yellow-200">
                                  {disease.name}
                                </span>
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                    <div className="flex items-start gap-4">
                      <p className="font-semibold whitespace-nowrap">
                        <strong>DESCRIPTION :</strong>
                      </p>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          firstPageDescriptions.map((desc, index) => (
                            <span
                              key={index}
                              className="bg-blue-50 px-3 py-1 rounded-md text-gray-700 border border-blue-100"
                            >
                              {desc.description}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {prescriptionData?.addistionalNotes && (
                    <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                      <p>
                        <strong>ADDITIONAL NOTES</strong>
                      </p>
                      <p className="font-semibold">
                        {loading ? (
                          <Skeleton width={200} />
                        ) : (
                          prescriptionData?.addistionalNotes
                        )}
                      </p>
                    </div>
                  )}

                  {/* Follow Up Information */}
                  {prescriptionData?.followUp?.required && (
                    <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                      <p>
                        <strong>FOLLOW UP</strong>
                      </p>
                      <p className="font-semibold">
                        Status: {prescriptionData?.followUp?.status}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Second page: rest of descriptions (if any) and medicines table only */}
            <div className="print:a4-page print:page-break-after w-full">
              <div className="relative w-full h-[297mm]">
                {/* Watermark background always */}
                {/* <div className="absolute w-full h-full">
                  <img src={LetterheadWatermark} className="w-full h-full" alt="" style={{position: 'absolute', zIndex: 0}} />
                </div> */}
                {/* Bottom image at the bottom of this page */}
                <div className="absolute w-full bottom-0 left-0">
                  <img src={LetterheadBottom} className="w-full" alt="" style={{zIndex: 1}} />
                </div>
                <div className="inputfields absolute top-[10px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                  {/* Description (second page, if needed) */}
                  {secondPageDescriptions.length > 0 && (
                    <div className="mb-4 py-2 border-b border-gray-300 text-sm w-full">
                      <div className="flex items-start gap-4">
                        <p className="font-semibold whitespace-nowrap">
                          <strong>DESCRIPTION (Continued) :</strong>
                        </p>
                        <div className="flex-1 flex flex-wrap gap-2">
                          {secondPageDescriptions.map((desc, index) => (
                            <span
                              key={index}
                              className="bg-blue-50 px-3 py-1 rounded-md text-gray-700 border border-blue-100"
                            >
                              {desc.description}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Medicines Table (always after continued descriptions) */}
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
                          medicines.map((medicine, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="py-2 text-left">
                                {medicine.medicineDetails.name}
                              </td>
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
                </div>
              </div>
            </div>
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

export default PrescriptionInvoice;
