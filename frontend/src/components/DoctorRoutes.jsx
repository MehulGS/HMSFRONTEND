import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import AdminDashboard from "../pages/adminPages/AdminDashboard";
import DoctorManagement from "../pages/adminPages/DoctorManagement";
import ReceptionManagement from "../pages/adminPages/ReceptionManagement";
import PatientManagement from "./PatientManagement";
import AppointmentBookingPage from "../pages/patientPages/AppointmentBookingPage";
import BookAppointment from "../pages/patientPages/BookAppointment";
import RescheduleAppointment from "../pages/patientPages/RescheduleAppointment";
import AddPatientForm from "./AddPatientForm";
import AddReciptionistForm from "../pages/adminPages/AddReciptionistForm";
import EditReceiptionist from "./EditReceiptionist";
import MonitorBilling from "../pages/adminPages/MonitorBilling";
import SelectTemplate from "../pages/adminPages/SelectTemplate";
import PaymentProcess from "../pages/adminPages/PaymentProcess";
import Medicines from "./Medicines";
import Invoice from "../pages/adminPages/Invoice";
import EditBill from "./EditBill";
import ReportingAnalysis from "../pages/adminPages/ReportingAnalysis";
import AdminProfile from "./AdminProfile";
import AdminEditProfile from "./Profile/AdminEditProfile";
import CreateBill from "../pages/adminPages/CreateBillForm";
import EditInvoice from "../pages/adminPages/EditInvoice";
import PendingInvoice from "./PendingInvoice";
import Sidebar from "./Sidebar";
import Header from "./Header";
import SearchResults from "./SearchResults";
import EditPatient from "./EditPatient";
// import PatientDetail from "./PatientDetail";
import Diseases from "../pages/Diseases";
import AppointmentPage from "../pages/AppointmentPage";
import CreatePrescriptionPage from "./CreatePrescriptionPage";
import Description from "../pages/Description";
import PatientDashboard from "../pages/patientPages/PatientDashboard";
import Prescription from "../pages/Prescription";
import PrescriptionInvoice from "../pages/Prescription/PrescriptionInvoice";
import SickPage from "../pages/Certificate/SickCertificate/SickPage";
import MedicalPage from "../pages/Certificate/MedicalCertificate/MedicalPage";
import DeathPage from "../pages/Certificate/DeathCertificate/DeathPage";
import FitnessPage from "../pages/Certificate/FitnessCertificate/FitnessPage";
import SickCertificateForm from "../pages/Certificate/SickCertificate/SickCertificateForm";
import SickCertificate from "../pages/Certificate/SickCertificate/SickCertificate";
import DeathCertificateForm from "../pages/Certificate/DeathCertificate/DeathCertificateForm";
import DeathCertificate from "../pages/Certificate/DeathCertificate/DeathCertificate";
import MedicalCertificateForm from "../pages/Certificate/MedicalCertificate/MedicalCertificateForm";
import MedicalCertificate from "../pages/Certificate/MedicalCertificate/MedicalCertificate";
import FitnessCertificateForm from "../pages/Certificate/FitnessCertificate/FitnessCertificateForm";
import FitnessCertificate from "../pages/Certificate/FitnessCertificate/FitnessCertificate";
import CreatePrescriptionInvoice from "../pages/Prescription/CreatePrescriptionInvoice";

const DoctorRoutes = ({ onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("All");

  const handleSearch = (query, filter) => {
    setSearchQuery(query);
    setFilterOption(filter);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f8fb]">
      <Sidebar
        role={"doctor"}
        onLogout={onLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col bg-[#f6f8fb]">
        <Header onSearch={handleSearch} toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto bg-[#f6f8fb] p-5">
          {searchQuery ? (
            <SearchResults query={searchQuery} filterOption={filterOption} />
          ) : (
            <Routes>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route
                path="/reception-management"
                element={<ReceptionManagement />}
              />
              <Route
                path="/patient-management"
                element={<PatientManagement />}
              />
              <Route
                path="/create-prescription"
                element={<CreatePrescriptionInvoice />}
              />
              <Route
                path="/create-prescription/:id"
                element={<CreatePrescriptionPage />}
              />
              <Route path="/patient/:id" element={<PatientDashboard />} />
              <Route path="/add-new-patient" element={<AddPatientForm />} />
              <Route
                path="/add-new-receiptionist"
                element={<AddReciptionistForm />}
              />
              <Route
                path="/edit-receiptionist/:id"
                element={<EditReceiptionist />}
              />
              <Route path="/monitor-billing" element={<MonitorBilling />} />
              <Route path="prescription" element={<Prescription />} />
              <Route path="/edit-patient/:id" element={<EditPatient />} />
              <Route path="/select-template" element={<SelectTemplate />} />
              <Route path="/payment-process" element={<PaymentProcess />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/diseases" element={<Diseases />} />
              <Route path="/discription" element={<Description />} />
              <Route path="/today-appointments" element={<AppointmentPage />} />
              <Route path="/invoice/:billId" element={<Invoice />} />
              <Route
                path="/prescription/:billId"
                element={<PrescriptionInvoice />}
              />
              <Route path="/payment/edit/:id" element={<EditBill />} />
              <Route path="/analytics" element={<ReportingAnalysis />} />
              <Route path="/*" element={<AdminProfile />} />
              <Route path="/edit-profile" element={<AdminEditProfile />} />
              <Route path="/create-bill" element={<CreateBill />} />
              <Route path="/edit-invoice" element={<EditInvoice />} />
              <Route path="/pending-invoice" element={<PendingInvoice />} />

              {/* Sick Certificate */}
              <Route path="/sick-certificate" element={<SickPage />} />
              <Route
                path="/create-sickcertificate"
                element={<SickCertificateForm />}
              />
              <Route
                path="/sickcertificate/:billId"
                element={<SickCertificate />}
              />

              {/* Medical Certificate */}
              <Route path="/medical-certificate" element={<MedicalPage />} />
              <Route
                path="/create-medicalcertificate"
                element={<MedicalCertificateForm />}
              />
              <Route
                path="/medicalcertificate/:billId"
                element={<MedicalCertificate />}
              />

              {/* Death Certificate */}
              <Route path="/death-certificate" element={<DeathPage />} />
              <Route
                path="/create-deathcertificate"
                element={<DeathCertificateForm />}
              />
              <Route
                path="/deathcertificate/:billId"
                element={<DeathCertificate />}
              />

              {/* Fitness Certificate */}
              <Route path="/fitness-certificate" element={<FitnessPage />} />
              <Route
                path="/create-fitnesscertificate"
                element={<FitnessCertificateForm />}
              />
              <Route
                path="/fitnesscertificate/:billId"
                element={<FitnessCertificate />}
              />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorRoutes;
