import React, { useState } from "react";
import { Collapse } from "@mui/material";
import { HiOutlineLogout } from "react-icons/hi";
import { useNavigate, NavLink } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { ReactComponent as DashboardIcon } from "../assets/images/Dashboard.svg";
import { ReactComponent as DoctorManagementIcon } from "../assets/images/DoctorManagement.svg";
import { ReactComponent as ReceptionIcon } from "../assets/images/user-tie-solid.svg";
import { ReactComponent as VectorIcon } from "../assets/images/Vector.svg";
import { ReactComponent as ReportIcon } from "../assets/images/Report.svg";
import { ReactComponent as BilingIcon } from "../assets/images/Billing.svg";
import { ReactComponent as CertiFicateIcon } from "../assets/images/certificateicon.svg";
import { ReactComponent as ChatIcon } from "../assets/images/Chaticon.svg";
import { ReactComponent as TeleAccessIcon } from "../assets/images/TeleAccess.svg";
import appointment from "../assets/images/appointment.png";
import toast from "react-hot-toast";

const Sidebar = ({ role, onLogout, isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const [openBilling, setOpenBilling] = useState(false);
  const [openCertificate, setOpenCertificate] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  const tabs = {
    admin: [
      {
        label: "Dashboard",
        icon: DashboardIcon,
        path: `/${role}/dashboard`,
      },
      {
        label: "Doctor Management",
        icon: DoctorManagementIcon,
        path: `/${role}/doctor-management`,
      },
      {
        label: "Reception Management",
        icon: ReceptionIcon,
        path: `/${role}/reception-management`,
      },
      {
        label: "Patient Management",
        icon: VectorIcon,
        path: `/${role}/patient-management`,
      },
      {
        label: "Billing And Payments",
        icon: BilingIcon,
        subMenu: [
          { label: "Monitor Billing", path: `/${role}/monitor-billing` },
          { label: "Payment Process", path: `/${role}/payment-process` },
          { label: "Medicines", path: `/${role}/medicines` },
        ],
      },
      //  { label: "Chat", icon: ChatIcon, path: `/${role}/chat` },
      {
        label: "Reporting And Analytics",
        icon: ReportIcon,
        path: `/${role}/analytics`,
      },
      {
        label:"Appointment booking",
        icon: TeleAccessIcon,
        path: `/${role}/appointment-booking`,
      },
       {
        label: "Certificate",
        icon: CertiFicateIcon,
        subMenu: [
          { label: "Sick Certificate", path: `/${role}/sick-certificate` },
          { label: "Death Certificate", path: `/${role}/death-certificate` },
          { label: "Fitness Certificate", path: `/${role}/fitness-certificate` },
          { label: "Medical Certificate", path: `/${role}/medical-certificate` },
        ],
      },
    ],
    doctor: [
      {
        label: "Dashboard",
        icon: DashboardIcon,
        path: `/${role}/dashboard`,
      },
      {
        label: "Reception Management",
        icon: ReceptionIcon,
        path: `/${role}/reception-management`,
      },
      {
        label: "Patient Management",
        icon: VectorIcon,
        path: `/${role}/patient-management`,
      },
      {
        label: "Billing And Payments",
        icon: BilingIcon,
        subMenu: [
          { label: "Monitor Billing", path: `/${role}/monitor-billing` },
          { label: "Payment Process", path: `/${role}/payment-process` },
          { label: "Medicines", path: `/${role}/medicines` },
        ],
      },
      {
        label: "Reporting And Analytics",
        icon: ReportIcon,
        path: `/${role}/analytics`,
      },
    ],
    receptionist: [
      {
        label: "Dashboard",
        icon: DashboardIcon,
        path: `/${role}/dashboard`,
      },
      {
        label: "Doctor Management",
        icon: DoctorManagementIcon,
        path: `/${role}/doctor-management`,
      },
      {
        label: "Patient Management",
        icon: VectorIcon,
        path: `/${role}/patient-management`,
      },
      {
        label: "Billing And Payments",
        icon: BilingIcon,
        subMenu: [
          { label: "Monitor Billing", path: `/${role}/monitor-billing` },
          { label: "Payment Process", path: `/${role}/payment-process` },
          { label: "Medicines", path: `/${role}/medicines` },
        ],
      },
      {
        label: "Reporting And Analytics",
        icon: ReportIcon,
        path: `/${role}/analytics`,
      },
      {
        label:"Appointment booking",
        icon: TeleAccessIcon,
        path: `/${role}/appointment-booking`,
      },
    ],
    // patient: [
    //   { label: "Personal Health Record", icon: healthIcon, path: "/patient" },
    //   {
    //     label: "Appointment Booking",
    //     icon: appPatientIcon,
    //     path: "/patient/appointment-booking",
    //   },
    //   {
    //     label: "Prescription Access",
    //     icon: PrescriptioniconIcon,
    //     path: "/patient/prescription-access",
    //   },
    //   {
    //     label: "Teleconsultation Access",
    //     icon: TelePatientIcon,
    //     path: "/patient/tele-access",
    //   },
    //   { label: "Chat", icon: ChatIcon, path: "/patient/chat" },
    //   { label: "Bills", icon: PatientBillIcon, path: "/patient/bills" },
    // ],
  };

  const handleLogout = () => {
    localStorage.clear();
    onLogout();
    navigate("/hms/auth");
    toast.success("Logout successfully!");
  };

  const handleMenuClick = (path, label) => {
    setActiveTab(label);
    if (path) navigate(path);
    setIsSidebarOpen(false);
  };

  const handleToggleBilling = () => {
    setOpenBilling(!openBilling);
    setOpenCertificate(false);
  };

  const handleToggleCertificate = () => {
    setOpenCertificate(!openCertificate);
    setOpenBilling(false);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed md:relative z-30 transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-64 md:w-72 bg-white h-screen flex flex-col justify-between overflow-hidden`}
      >
        {/* Logo Section - Fixed at top */}
        <div className="py-4 flex items-center justify-center md:justify-start md:px-6 bg-white border-b">
          <img src={logo} alt="Hospital Logo" className="w-40 md:w-48" />
        </div>

        {/* Scrollable Menu Items Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ul className="py-2">
            {tabs[role]?.map((item, index) => (
              <li key={index} className="py-2">
                {!item.subMenu ? (
                  <NavLink
                    to={item.path}
                    className={`relative flex items-center w-full px-6 py-4 font-semibold ${
                      activeTab === item.label
                        ? "text-[#0EABEB]"
                        : "hover:text-[#0EABEB] text-[#818194]"
                    }`}
                    onClick={() => handleMenuClick(item.path, item.label)}
                  >
                    {/* Conditionally apply color for SVG icons based on active tab */}
                    {item.icon === DashboardIcon ||
                    item.icon === DoctorManagementIcon ? (
                      <item.icon
                        className="mr-3 transition duration-300 z-20 relative"
                        style={{
                          fill: activeTab === item.label ? "#0EABEB" : "#818194",
                        }}
                      />
                    ) : (
                      <item.icon
                        className={`mr-3 transition duration-300 z-20 relative ${
                          activeTab === item.label
                            ? "text-[#0EABEB]"
                            : "text-[#818194]"
                        }`}
                      />
                    )}
                    <span className="relative z-20">{item.label}</span>

                    {/* Active Tab Background & Border */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-[#E0F3FB] to-white opacity-0 ${
                        activeTab === item.label
                          ? "opacity-100"
                          : "group-hover:opacity-100"
                      } transition duration-300 z-10`}
                    ></div>
                    <div
                      className={`absolute top-0 right-0 h-10 bg-[#0EABEB] ${
                        activeTab === item.label
                          ? "w-2 opacity-100"
                          : "group-hover:w-2 opacity-0"
                      } rounded-tl-lg rounded-bl-lg transition-all duration-300 z-10`}
                    ></div>
                  </NavLink>
                ) : (
                  <div>
                    <button
                      onClick={item.label === "Billing And Payments" ? handleToggleBilling : handleToggleCertificate}
                      className={`flex items-center w-full px-6 py-4 font-semibold ${
                        (item.label === "Billing And Payments" && openBilling) || 
                        (item.label === "Certificate" && openCertificate)
                          ? "text-[#0EABEB]"
                          : "hover:text-[#0EABEB] text-[#818194]"
                      }`}
                    >
                      <item.icon
                        className={`mr-4 ${
                          (item.label === "Billing And Payments" && openBilling) || 
                          (item.label === "Certificate" && openCertificate)
                            ? "text-[#0EABEB]"
                            : "text-[#818194]"
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                    <Collapse 
                      in={item.label === "Billing And Payments" ? openBilling : openCertificate} 
                      timeout="auto" 
                      unmountOnExit
                    >
                      <ul>
                        {item.subMenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <NavLink
                              to={subItem.path}
                              className={`relative flex items-center w-full pl-12 py-3 font-semibold ${
                                activeTab === subItem.label
                                  ? "text-[#0EABEB]"
                                  : "hover:text-[#0EABEB] text-[#818194]"
                              }`}
                              onClick={() =>
                                handleMenuClick(subItem.path, subItem.label)
                              }
                            >
                              <span className="relative z-20">
                                {subItem.label}
                              </span>
                              {/* Active Tab Background & Border */}
                              <div
                                className={`absolute inset-0 bg-gradient-to-r from-[#E0F3FB] to-white opacity-0 ${
                                  activeTab === subItem.label
                                    ? "opacity-100"
                                    : "group-hover:opacity-100"
                                } transition duration-300 z-10`}
                              ></div>
                              <div
                                className={`absolute top-0 right-0 h-10 bg-[#0EABEB] ${
                                  activeTab === subItem.label
                                    ? "w-2 opacity-100"
                                    : "group-hover:w-2 opacity-0"
                                } rounded-tl-lg rounded-bl-lg transition-all duration-300 z-10`}
                              ></div>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </Collapse>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Hospital Appointment section for patient role */}
          {role === "patient" && (
            <div className="relative px-5 m-5 bg-gray-100 rounded-2xl">
              <div className="flex justify-center mb-2 relative z-10">
                <img
                  src={appointment}
                  alt="appointment"
                  className="w-30 h-30 -mt-32"
                />
              </div>
              <div className="pb-5 text-center relative z-0">
                <h4 className="mb-2 font-semibold text-lg">
                  Hospital appointment
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  You have to fill up the form to be admitted to the Hospital.
                </p>
                <NavLink to={"/patient/appointment-booking"}>
                  <button className="w-full bg-customBlue text-white py-2 rounded-md">
                    Appointment
                  </button>
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button - Fixed at bottom */}
        <div className="mt-auto bg-white border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-3 text-red-500 font-semibold bg-red-100 px-6"
          >
            <HiOutlineLogout className="mr-2 text-lg" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for sidebar on small screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
