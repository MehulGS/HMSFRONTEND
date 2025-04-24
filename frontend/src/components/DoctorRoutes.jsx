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
              <Route path="/add-new-patient" element={<AddPatientForm />} />
              <Route path="/add-new-receiptionist" element={<AddReciptionistForm />} />
              <Route path="/edit-receiptionist/:id" element={<EditReceiptionist />} />
              <Route path="/monitor-billing" element={<MonitorBilling />} />
              <Route path="/select-template" element={<SelectTemplate />} />
              <Route path="/payment-process" element={<PaymentProcess />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route
                path="/invoice/:billId/:patientName"
                element={<Invoice />}
              />
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

export default DoctorRoutes;
