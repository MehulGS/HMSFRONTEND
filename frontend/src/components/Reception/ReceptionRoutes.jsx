import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../Header";
import AdminDashboard from "../../pages/adminPages/AdminDashboard";
import DoctorManagement from "../../pages/adminPages/DoctorManagement";
import PatientManagement from "../PatientManagement";
import AddDoctorForm from "../../pages/adminPages/AddDoctorForm";
import EditDoctor from "../../pages/adminPages/EditDoctor";
import MonitorBilling from "../../pages/adminPages/MonitorBilling";
import InsuranceClaims from "../../pages/adminPages/InsuranceClaim";
import SelectTemplate from "../../pages/adminPages/SelectTemplate";
import Invoice from "../../pages/adminPages/Invoice";
import PaymentProcess from "../../pages/adminPages/PaymentProcess";
import InsuranceDetail from "../../pages/adminPages/InsuranceDetail";
import EditBill from "../EditBill";
import ReportingAnalysis from "../../pages/adminPages/ReportingAnalysis";
import AdminProfile from "../AdminProfile";
import AdminEditProfile from "../Profile/AdminEditProfile";
import CreateBill from "../../pages/adminPages/CreateBillForm";
import EditInvoice from "../../pages/adminPages/EditInvoice";
import PendingInvoice from "../PendingInvoice";
import SearchResults from "../SearchResults";
import AddPatientForm from "../AddPatientForm";
import Medicines from "../Medicines";
import BookAppointment from "../../pages/patientPages/BookAppointment";
import AppointmentBookingPage from "../../pages/patientPages/AppointmentBookingPage";
import RescheduleAppointment from "../../pages/patientPages/RescheduleAppointment";


const ReceptionRoutes = ({ onLogout }) => {
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
      <Sidebar role={"receptionist"} onLogout={onLogout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}/>
      <div className="flex-1 flex flex-col bg-[#f6f8fb]">
        <Header onSearch={handleSearch} toggleSidebar={toggleSidebar}/>
        <div className="flex-1 overflow-y-auto bg-[#f6f8fb] p-5">
          {searchQuery ? (
            <SearchResults query={searchQuery} filterOption={filterOption} />
          ) : (
            <Routes>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/doctor-management" element={<DoctorManagement />} />
              <Route path="/patient-management" element={<PatientManagement />} />
              <Route path="/appointment-booking" element={<AppointmentBookingPage />} />
              <Route path="/book-appointment" element={< BookAppointment/>} />
              <Route path="/reschedule-appointment" element={<RescheduleAppointment />} />
              <Route path="/add-new-patient" element={<AddPatientForm />} />
              <Route path="/add-new-doctor" element={<AddDoctorForm />} />
              <Route path="/edit-doctor/:id" element={<EditDoctor />} />
              <Route path="/view-doctor/:id" element={<EditDoctor isViewOnly />} />
              <Route path="/monitor-billing" element={<MonitorBilling />} />
              <Route path="/select-template" element={<SelectTemplate />} />
              <Route path="/payment-process" element={<PaymentProcess />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/invoice/:billId/:patientName" element={<Invoice />} />
              <Route path="/insurance/:id" element={<InsuranceDetail />} />
              <Route path="/payment/edit/:id" element={<EditBill />} />
              <Route path="/analytics" element={<ReportingAnalysis />} />
              <Route path="/*" element={<AdminProfile />} />
              <Route path="/edit-profile" element={<AdminEditProfile />} />
              <Route path="/create-bill" element={<CreateBill />} />
              <Route path="/edit-invoice" element={<EditInvoice />} />
              <Route path="/pending-invoice" element={<PendingInvoice />} />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionRoutes;
