import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDown, AiOutlineMenu, AiOutlineRight } from "react-icons/ai";
import { FaBell, FaSearch } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "../assets/images/home-2.png";
import api from "../api/api";
import { io } from "socket.io-client";

let socket = null;

const initializeSocket = () => {
  if (socket) return socket;

  // Get token from localStorage
  const token = localStorage.getItem("token");
  if (!token) return null;

  // Create socket connection with configuration
  socket = io("https://46tb8kl9-8000.inc1.devtunnels.ms/", {
    withCredentials: true,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
      token: token,
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Socket event handlers
  socket.on("connect", () => {
    console.log("Socket connected successfully");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    // Only clear token and redirect if it's an authentication error
    if (error.message === "Authentication token required" || error.message === "Invalid token") {
      if (window.location.pathname !== "/") {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};

// Function to update token
export const updateSocketToken = (newToken) => {
  if (!socket) return;
  
  socket.auth.token = newToken;
  socket.io.opts.extraHeaders.Authorization = `Bearer ${newToken}`;
  socket.disconnect().connect();
};

const Header = ({ activeMenu, onSearch, toggleSidebar }) => {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [greeting, setGreeting] = useState("");
  const [filterOption, setFilterOption] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const socketRef = useRef(null);

  const location = useLocation();

  // Socket initialization and event listener setup
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = initializeSocket();

    // Set up notification listener
    if (socketRef.current) {
      socketRef.current.on("new_notification", (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("new_notification");
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // Click outside handler setup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

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

  // Add mark as read handler
  const handleMarkAsRead = (notificationId) => {
    if (socketRef.current) {
      socketRef.current.emit('mark_read', notificationId);
      // Update local state to reflect the read status
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      // Decrease unread count if the notification was unread
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Add mark all as read handler
  const handleMarkAllAsRead = () => {
    if (socketRef.current) {
      socketRef.current.emit('mark_all_read');
      // Update local state to reflect all notifications as read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      // Reset unread count
      setUnreadCount(0);
    }
  };

  return (
    <div className="w-full px-4 py-4 bg-white shadow-md flex items-center">
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
      <div className="flex items-center space-x-4 w-full justify-end">
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 text-gray-600 hover:text-[#0eabeb] transition-colors"
          >
            <FaBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  <>
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border-b border-gray-100 hover:bg-[#f3f8fa] transition-colors flex rounded-lg mb-1 ${!notification.isRead ? 'bg-[#eaf6fd]' : 'bg-white'}`}
                        style={{ position: 'relative' }}
                      >
                        {/* Unread dot */}
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-[#0eabeb] rounded-full absolute left-2 top-5"></span>
                        )}
                        <div className="flex-1 pl-3">
                          <p className="text-sm text-gray-800 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="ml-3 px-2 py-1 text-xs rounded bg-[#0eabeb] text-white hover:bg-[#0a8cbb] transition-colors shadow-sm"
                                style={{ minWidth: 80 }}
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {unreadCount > 0 && (
                      <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                        <button
                          onClick={handleMarkAllAsRead}
                          className="w-full text-sm text-white bg-[#0eabeb] hover:bg-[#0a8cbb] font-medium py-2 rounded transition-colors shadow"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Image */}
        <Link to={`/${userRole}`} className="flex items-center space-x-2">
          {loading ? (
            <Skeleton circle={true} width={40} height={40} />
          ) : (
            <img
              src={
                profileImage ||
                "https://46tb8kl9-8000.inc1.devtunnels.ms/default-profile.png"
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

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Header;
