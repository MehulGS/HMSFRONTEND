import React from "react";
import { Button } from "@mui/material";
import { motion } from "framer-motion";
import { FaHospitalAlt, FaUserMd, FaHeartbeat } from "react-icons/fa";
import { Link } from "react-router-dom";
import NBLOGO from "../assets/hmsnav.png";

const features = [
  {
    icon: <FaHospitalAlt size={32} className="text-blue-500" />,
    title: "Smart Hospital Management",
    description: "Digitize patient records, appointments, and reports.",
  },
  {
    icon: <FaUserMd size={32} className="text-green-500" />,
    title: "Doctor & Staff Portal",
    description: "Manage duties, schedules, and communication easily.",
  },
  {
    icon: <FaHeartbeat size={32} className="text-red-500" />,
    title: "24/7 Patient Care",
    description: "Access to medical history and emergency alerts anytime.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white overflow-x-hidden">
      {/* Header */}
      <header className="w-full fixed top-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-2 px-6">
          <motion.div
            className="flex items-center"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={NBLOGO}
              alt="HMS Logo"
              className="h-20 w-20 object-contain"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to="/hms/auth" className="text-white no-underline">
              <Button variant="contained" color="primary">
                Login
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center bg-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-blue-800 mb-4">
            Your Health, Our Priority
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Seamless, secure, and smart healthcare management.
          </p>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to={"/admin-registration"}>
              <Button variant="contained" color="secondary" size="large">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-6 bg-white">
        <h3 className="text-3xl text-center font-semibold text-blue-800 mb-12">
          Powerful Features
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-2xl shadow-lg border hover:shadow-2xl transition bg-white text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <h4 className="text-xl font-semibold mb-2 text-gray-800">
                {feature.title}
              </h4>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-6 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h3
            className="text-3xl font-bold text-blue-800 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Why Choose Our HMS?
          </motion.h3>
          <motion.p
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            Trusted by hospitals nationwide, our HMS offers a complete and
            secure solution to digitize operations, improve patient care, and
            increase efficiency.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h3
            className="text-3xl font-semibold text-blue-800 mb-6"
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Get in Touch
          </motion.h3>
          <motion.p
            className="text-gray-600 mb-6"
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Have questions or need a demo? Reach out to our support team now.
          </motion.p>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Button variant="outlined" color="primary">
              <Link to={"/contact-us"}>Contact Us</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-blue-900 text-white text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          &copy; 2025 HMS System. All rights reserved.
        </motion.p>
      </footer>
    </div>
  );
}
