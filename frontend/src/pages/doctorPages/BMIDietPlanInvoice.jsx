import { useLocation, useNavigate } from "react-router-dom";
import { FaPrint } from "react-icons/fa";
import LetterheadWatermark from "../../assets/images/letterhead.png";
import api from "../../api/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const BMIDietPlanInvoice = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const record = state?.record;

  if (!record) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <p className="text-sm text-gray-700 mb-4">
          No BMI record data found for diet plan view.
        </p>
        <button
          type="button"
          onClick={() => navigate("/doctor/bmi-calculator")}
          className="px-4 py-2 bg-customBlue text-white rounded-lg text-sm"
        >
          Back to BMI List
        </button>
      </div>
    );
  }

  const dietPlanText =
    state?.dietPlan ||
    record.dietPlanResponse ||
    record.diet_plan ||
    record.dietPlan ||
    "Diet plan details are not available from AI. Please review BMI and counsel patient manually.";

  const formatLineBreaks = (text) => {
    return text.split(/\n+/).map((line) => line);
  };

  const allLines = formatLineBreaks(dietPlanText).filter((line) => line && line.trim() !== "");
  const ITEMS_PER_PAGE = 10;
  const pages = [];

  for (let i = 0; i < allLines.length; i += ITEMS_PER_PAGE) {
    pages.push(allLines.slice(i, i + ITEMS_PER_PAGE));
  }

  return (
    <>
      {/* Print Button - hidden when printing */}
      <div className="print:hidden mb-4 flex justify-end max-w-3xl mx-auto px-4">
        <button
          onClick={async () => {
            const id = record.id || record._id;

            try {
              if (id) {
                const element = document.getElementById("bmi-diet-printable");
                if (element) {
                  const canvas = await html2canvas(element, { scale: 2 });
                  const imgData = canvas.toDataURL("image/png");

                  const pdf = new jsPDF("p", "mm", "a4");
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

                  const pdfBlob = pdf.output("blob");
                  const pdfFile = new File([pdfBlob], "diet-plan.pdf", {
                    type: "application/pdf",
                  });

                  const formData = new FormData();
                  formData.append("dietPlanPdf", pdfFile);

                  await api.put(`/bmi-records/update-record/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                }
              }
            } catch (error) {
              console.error("Failed to update diet plan PDF on server", error);
            }

            const printContents = document.getElementById("bmi-diet-printable").innerHTML;
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
          }}
          className="flex items-center gap-2 bg-[#0eabeb] text-white px-4 py-2 rounded-xl hover:bg-[#0c97cc] transition-colors"
        >
          <FaPrint />
          <span>Print Diet Plan</span>
        </button>
      </div>

      <div
        id="bmi-diet-printable"
        className="bg-white print:bg-white text-black print:text-black rounded-2xl w-full max-w-3xl mx-auto shadow-md border border-gray-200 print:shadow-none print:border-none flex flex-col items-center"
      >
        {pages.map((pageLines, pageIndex) => (
          <div key={pageIndex} className="print:a4-page w-full">
            <div className="relative w-full h-[297mm]">
              <div className="absolute w-full h-full">
                <img
                  src={LetterheadWatermark}
                  className="w-full h-full"
                  alt=""
                  style={{ position: "absolute", zIndex: 0 }}
                />
              </div>
              <div className="inputfields absolute top-[300px] w-full max-w-3xl m-auto px-28 flex flex-col items-start bg-transparent">
                {/* Header Row */}
                {pageIndex === 0 && (
                  <div className="mb-6 py-2 border-b border-gray-300 w-full">
                    <h3 className="font-semibold text-lg mb-2">PATIENT INFORMATION</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm w-full">
                      <p>
                        <strong>NAME:</strong> {record.name || "-"}
                      </p>
                      <p>
                        <strong>AGE:</strong> {record.age ? `${record.age} Years` : "-"}
                      </p>
                      <p>
                        <strong>PHONE:</strong> {record.phoneNumber || "-"}
                      </p>
                      <p>
                        <strong>BLOOD GROUP:</strong> {record.bloodGroup || "-"}
                      </p>
                      <p>
                        <strong>HEIGHT:</strong> {record.height} cm
                      </p>
                      <p>
                        <strong>WEIGHT:</strong> {record.weight} kg
                      </p>
                      <p>
                        <strong>BMI:</strong> {record.bmi}
                      </p>
                      <p>
                        <strong>STATUS:</strong> {record.status || "-"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Diet Plan Section */}
                <div className="w-full">
                  <h3 className="font-semibold text-lg mb-3">
                    {pageIndex === 0 ? "DIET PLAN" : "DIET PLAN (CONTINUED)"}
                  </h3>
                  <div className="border border-gray-300 rounded-md p-3 bg-white/70 text-gray-800">
                    {pageLines.map((line, idx) => (
                      <p key={idx} className="text-sm leading-relaxed mb-1">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BMIDietPlanInvoice;
