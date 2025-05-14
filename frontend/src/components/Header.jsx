import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDown, AiOutlineMenu, AiOutlineRight } from "react-icons/ai";
import { FaBell, FaSearch } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Home from "../assets/images/home-2.png";
import api from "../api/api";

const Header = ({ activeMenu, onSearch, toggleSidebar }) => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [greeting, setGreeting] = useState("");
  const [filterOption, setFilterOption] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation(); // Access the current location (route)
  const notificationRef = useRef(null); // Ref for the notification dropdown

  const [notifications, setNotifications] = useState([
    { message: "Change Invoice Theme", time: "5 min ago" },
    { message: "Created Bill by dr.bharat.", time: "5 min ago" },
    { message: "Payment Received", time: "1:52 PM" },
    { message: "Payment Cancelled", time: "1:52 PM" },
    { message: "Dr.Bharat Patel has been appointed.", time: "1:34 PM" },
    { message: "Doctor Removed Rakesh Patel", time: "9:00 AM" },
  ]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(`${decoded.firstName} ${decoded.lastName}`);
        setUserRole(decoded.role);

        api
          .get("/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            const userData = response.data;
            setProfileImage(`${userData.profileImage}`);
          })
          .catch((error) =>
            console.error("Error fetching user profile:", error)
          )
          .finally(() => setLoading(false));
      } catch (error) {
        console.error("Error decoding token:", error);
        setLoading(false);
      }
    }

    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting("Good Morning");
    else if (currentHour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleFilterSelect = (option) => {
    setFilterOption(option);
    setDropdownOpen(false);
    onSearch(searchQuery, option);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query, filterOption);
  };

  // Only show greeting on specific routes (Dashboard pages for each role)
  const showGreeting =
    (userRole === "admin" &&
      (location.pathname === "/admin/dashboard" ||
        location.pathname === "/admin" ||
        location.pathname === "/admin/edit-profile" ||
        location.pathname === "/admin/change-password" ||
        location.pathname === "/admin/terms-and-conditions" ||
        location.pathname === "/admin/privacy-policy")) ||
    (userRole === "doctor" &&
      (location.pathname === "/doctor" ||
        location.pathname === "/doctor/edit-profile" ||
        location.pathname === "/doctor/change-password" ||
        location.pathname === "/doctor/terms-and-conditions" ||
        location.pathname === "/doctor/privacy-policy")) ||
    (userRole === "patient" && location.pathname === "/patient");

  // Show breadcrumb only on allowed routes
  const showBreadcrumb =
    !(
      userRole === "admin" &&
      (location.pathname === "/admin/dashboard" ||
        location.pathname === "/admin" ||
        location.pathname === "/admin/edit-profile" ||
        location.pathname === "/admin/change-password" ||
        location.pathname === "/admin/terms-and-conditions" ||
        location.pathname === "/admin/privacy-policy")
    ) &&
    !(
      userRole === "doctor" &&
      (location.pathname === "/doctor" ||
        location.pathname === "/doctor/edit-profile" ||
        location.pathname === "/doctor/change-password" ||
        location.pathname === "/doctor/terms-and-conditions" ||
        location.pathname === "/doctor/privacy-policy")
    ) &&
    !(userRole === "patient" && location.pathname === "/patient");

  // Breadcrumb path functionality
  const pathSegments = location.pathname.split("/").filter(Boolean); // Remove empty strings
  const lastSegment =
    pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "Home";
  return (
    <div className="w-full px-4 py-4 bg-white shadow-md flex items-center justify-between">
      {/* Left Section - Hamburger Menu */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle Button */}
        <AiOutlineMenu
          className="text-gray-700 text-2xl md:hidden cursor-pointer"
          onClick={toggleSidebar}
        />

        {/* Breadcrumb Path - Conditionally Rendered */}
        {showBreadcrumb && (
          <div className="hidden md:flex items-center space-x-2 bg-[#f8fcfe] px-4 py-2 rounded-full border border-gray-200">
            <img src={Home} alt="home" className="w-6 h-6" />
            <AiOutlineRight className="text-[#0eabeb]" />
            <span className="text-[#0eabeb] font-medium">{lastSegment}</span>
          </div>
        )}

        {/* Greeting Section - Conditionally Rendered */}
        <div className="hidden md:block">
          {showGreeting && (
            <>
              <h1 className="text-lg font-bold text-gray-900">
                {loading ? (
                  <Skeleton width={150} />
                ) : (
                  `${greeting}! ${userName.split(" ")[0]}`
                )}
              </h1>
              <p className="text-gray-500 text-sm">
                {loading ? (
                  <Skeleton width={100} />
                ) : (
                  "Hope you have a good day"
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right Section - Icons */}
      <div className="flex items-center space-x-4">
        {/* Search Bar - Only visible for admin on medium and above screens */}

        {/* Profile Image */}
        <Link to={`/${userRole}`} className="flex items-center space-x-2">
          {loading ? (
            <Skeleton circle={true} width={40} height={40} />
          ) : (
            <img
              src={
                profileImage ||
                "https://b-hms.onrender.com/default-profile.png"
              }
              alt="user"
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <span className="font-semibold text-sm">
              {loading ? <Skeleton width={80} /> : userName}
            </span>
            <span className="block text-gray-500 text-xs">
              {loading ? <Skeleton width={40} /> : userRole}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Header;
