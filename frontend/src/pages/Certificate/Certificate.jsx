import React from "react";
import MedicalCertificate from "../../assets/Certificates/MedicalCertificate.png";
import DeathCertificate from "../../assets/Certificates/DeathCertificate.png";
import FitnessCertificate from "../../assets/Certificates/FitnessCertificate.png";
import SicknessCertificate from "../../assets/Certificates/SicknessCertificate.png";

const Certificate = () => {
  const certificates = [
    {
      name: "Medical Certificate",
      image: MedicalCertificate,
    },
    {
      name: "Death Certificate",
      image: DeathCertificate,
    },
    {
      name: "Fitness Certificate",
      image: FitnessCertificate,
    },
    {
      name: "Sickness Certificate",
      image: SicknessCertificate,
    },
  ];

  const handlePrint = (certificate) => {
    // Open the window immediately on click
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Popup blocked! Please allow popups for this website.');
      return;
    }

    // Write the HTML content
    printWindow.document.write(`
      <html>
        <head>
          <title>${certificate.name}</title>
          <style>
            @media print {
              body, html {
                margin: 0;
                padding: 0;
                width: 100vw;
                height: 100vh;
                background: white;
              }
              img {
                display: block;
                margin: 0 auto;
                max-width: 100vw;
                max-height: 100vh;
                width: auto;
                height: auto;
              }
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: white;
            }
            img {
              max-width: 100vw;
              max-height: 100vh;
              width: auto;
              height: auto;
            }
          </style>
        </head>
        <body>
          <img id="toPrint" src="${certificate.image}" alt="${certificate.name}" />
          <script>
            // Wait for the image to load before printing
            const img = document.getElementById('toPrint');
            img.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
        <h2 className="text-lg md:text-xl font-semibold text-[#030229]">
          Certificates
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert, index) => (
          <div
            key={index}
            className="bg-white [box-shadow:0_4px_12px_-5px_rgba(0,0,0,0.4)] w-full rounded-2xl overflow-hidden"
          >
            <div className="aspect-[3/2]">
              <img
                src={cert.image}
                alt={cert.name}
                className="w-full h-full object-cover rounded-t-2xl"
              />
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-md mb-2 text-[#030229]">{cert.name}</h3>
              <button
                type="button"
                onClick={() => handlePrint(cert)}
                className="px-5 py-2.5 flex items-center justify-center rounded-sm cursor-pointer text-white text-sm tracking-wider font-medium border-none outline-none bg-blue-600 hover:bg-blue-700 active:bg-blue-600"
              >
                Print
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16px"
                  fill="currentColor"
                  className="ml-2 inline"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 16a.749.749 0 0 1-.542-.232l-5.25-5.5A.75.75 0 0 1 6.75 9H9.5V3.25c0-.689.561-1.25 1.25-1.25h2.5c.689 0 1.25.561 1.25 1.25V9h2.75a.75.75 0 0 1 .542 1.268l-5.25 5.5A.749.749 0 0 1 12 16zm10.25 6H1.75C.785 22 0 21.215 0 20.25v-.5C0 18.785.785 18 1.75 18h20.5c.965 0 1.75.785 1.75 1.75v.5c0 .965-.785 1.75-1.75 1.75z"
                    data-original="#000000"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificate;
